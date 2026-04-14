import { createServer } from "node:http";
import { ActivityLog } from "../../../packages/shared/src/activity-log.js";
import { distFrontendPath } from "../../../packages/shared/src/files.js";
import { readJsonBody, sendFile, sendJson, sendText } from "../../../packages/shared/src/http.js";
import { localBackendService } from "../../../packages/shared/src/stages/local.js";
import type { BoardView, ExternalEventPayload } from "../../../packages/shared/src/types.js";

const port = Number(process.env.BFF_PORT ?? 7070);
const backendBaseUrl = process.env.BACKEND_BASE_URL ?? "http://127.0.0.1:7001";
const retryCount = Number(process.env.BFF_RETRY_COUNT ?? 2);
const retryDelayMs = Number(process.env.BFF_RETRY_DELAY_MS ?? 250);
const staleDoingMinutes = Number(process.env.BFF_STALE_DOING_MINUTES ?? 30);
const queueWarnDepth = Number(process.env.BFF_QUEUE_WARN_DEPTH ?? 5);
const notificationsCooldownMs = Number(process.env.BFF_NOTIFICATIONS_COOLDOWN_MS ?? 3000);
const activityLog = new ActivityLog();

let notificationsCache: { at: number; notifications: Notification[] } | null = null;

type NotificationLevel = "info" | "warn" | "alert";

type Notification = {
  level: NotificationLevel;
  title: string;
  detail: string;
};

// The BFF turns the backend's recent history into a user-facing activity feed.
const activityLimit = Number(process.env.BFF_ACTIVITY_LIMIT ?? 3);

function computeNotifications(board: BoardView): Notification[] {
  return (board.recentActivity ?? []).slice(0, activityLimit).map((entry) => {
    const level: NotificationLevel = entry.type === "statusChanged" ? "info" : "info";
    const titlePrefix = entry.type === "itemCreated" ? "New item" : entry.type === "statusChanged" ? "Moved" : "Event";
    return {
      level,
      title: `${titlePrefix}: ${entry.itemTitle}`,
      detail: `${entry.summary} · ${new Date(entry.occurredAt).toLocaleTimeString()}`,
    };
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function proxyJson(pathname: string, method = "GET", body?: unknown): Promise<{ status: number; payload: unknown; retries: number }> {
  let attempt = 0;
  let lastResponse: Response | null = null;

  while (attempt <= retryCount) {
    const response = await fetch(`${backendBaseUrl}${pathname}`, {
      method,
      headers: {
        "content-type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    lastResponse = response;

    if (response.status < 500 || attempt === retryCount) {
      return {
        status: response.status,
        payload: await response.json(),
        retries: attempt,
      };
    }

    activityLog.record("retry", `backend ${method} ${pathname} returned ${response.status}, retrying`, {
      attempt: attempt + 1,
    });
    attempt += 1;
    await delay(retryDelayMs);
  }

  return {
    status: lastResponse?.status ?? 502,
    payload: {
      error: "BadGateway",
      message: "Backend request failed",
    },
    retries: retryCount,
  };
}

createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? `localhost:${port}`}`);

  try {
    if (request.method === "GET" && url.pathname === "/health") {
      sendText(response, 200, "healthy");
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/logs") {
      const limit = Number(url.searchParams.get("limit") ?? "50");
      sendJson(response, 200, { entries: activityLog.list(limit) });
      return;
    }

    if (request.method === "DELETE" && url.pathname === "/api/logs") {
      activityLog.clear();
      sendJson(response, 200, { cleared: true });
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/board") {
      activityLog.record("api", "GET /api/board");
      const result = await proxyJson("/internal/board");
      sendJson(response, result.status, result.payload, { "x-retry-count": String(result.retries) });
      return;
    }

    // /api/notifications 
    //
    // The browser may poll this on a tight loop (or many users may hit it at once).
    // We don't want every poll to fan out to the backend. The BFF coalesces calls
    // inside a small window: first caller pays the backend round-trip, everyone
    // else inside `notificationsCooldownMs` gets the cached snapshot.
    //
    // The backend stays unaware of polling behavior — that's a client-shape concern
    // and it lives here, in the public tier. This is also why the backend is private:
    // if clients could call /internal/board directly they'd skip this throttling.
    //
    // Demo (watch fromCache flip after the cooldown expires):
    //   for i in {1..6}; do
    //     curl -s http://127.0.0.1:7070/api/notifications | jq '{fromCache, ageMs}'
    //     sleep 0.3
    //   done
    if (request.method === "GET" && url.pathname === "/api/notifications") {
      const now = Date.now();
      if (notificationsCache && now - notificationsCache.at < notificationsCooldownMs) {
        const ageMs = now - notificationsCache.at;
        activityLog.record("api", "GET /api/notifications (coalesced)", {
          count: notificationsCache.notifications.length,
          ageMs,
        });
        sendJson(response, 200, {
          notifications: notificationsCache.notifications,
          fromCache: true,
          ageMs,
        });
        return;
      }
      const result = await proxyJson("/internal/board");
      if (result.status !== 200) {
        sendJson(response, result.status, result.payload, { "x-retry-count": String(result.retries) });
        return;
      }
      const board = result.payload as BoardView;
      const notifications = computeNotifications(board);
      notificationsCache = { at: now, notifications };
      activityLog.record("api", "GET /api/notifications (fresh)", {
        count: notifications.length,
      });
      sendJson(
        response,
        200,
        { notifications, fromCache: false, ageMs: 0 },
        { "x-retry-count": String(result.retries) },
      );
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/board/reset") {
      const result = await proxyJson("/internal/board/reset", "POST");
      sendJson(response, result.status, result.payload, { "x-retry-count": String(result.retries) });
      return;
    }

    const itemMatch = url.pathname.match(/^\/api\/items\/([^/]+)$/);
    if (request.method === "GET" && itemMatch) {
      const result = await proxyJson(`/internal/items/${itemMatch[1]}`);
      sendJson(response, result.status, result.payload, { "x-retry-count": String(result.retries) });
      return;
    }

    const statusMatch = url.pathname.match(/^\/api\/items\/([^/]+)\/status$/);
    if (request.method === "POST" && statusMatch) {
      const body = await readJsonBody<{ status: string }>(request);
      activityLog.record("api", `POST status ${statusMatch[1]} -> ${body.status}`);
      const result = await proxyJson(`/internal/items/${statusMatch[1]}/status`, "POST", body);
      sendJson(response, result.status, result.payload, { "x-retry-count": String(result.retries) });
      return;
    }

    if (request.method === "POST" && url.pathname === "/webhooks/external") {
      const payload = await readJsonBody<ExternalEventPayload>(request);
      const message = await localBackendService.enqueueExternalEvent(payload);
      activityLog.record("webhook", `enqueued external event ${message.id}`, {
        sourceType: payload.sourceType,
        externalId: payload.externalId,
      });
      sendJson(response, 202, {
        accepted: true,
        messageId: message.id,
      });
      return;
    }

    if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
      await sendFile(response, distFrontendPath("index.html"), "text/html; charset=utf-8");
      return;
    }

    if (request.method === "GET" && url.pathname === "/styles.css") {
      await sendFile(response, distFrontendPath("styles.css"), "text/css; charset=utf-8");
      return;
    }

    if (request.method === "GET" && url.pathname === "/app.js") {
      await sendFile(response, distFrontendPath("app.js"), "application/javascript; charset=utf-8");
      return;
    }

    if (request.method === "GET" && url.pathname === "/config.js") {
      await sendFile(response, distFrontendPath("config.js"), "application/javascript; charset=utf-8");
      return;
    }

    sendJson(response, 404, { error: "NotFound" });
  } catch (error) {
    sendJson(response, 500, {
      error: "BffError",
      message: error instanceof Error ? error.message : "Unexpected BFF failure",
    });
  }
}).listen(port, () => {
  console.log(`[bff] listening on http://127.0.0.1:${port}`);
});
