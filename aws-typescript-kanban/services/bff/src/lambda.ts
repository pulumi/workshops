import { ActivityLog } from "../../../packages/shared/src/activity-log.js";
import type { BoardView, RecentActivityEntry } from "../../../packages/shared/src/types.js";

const activityLog = new ActivityLog();
const activityLimit = Number(process.env.BFF_ACTIVITY_LIMIT ?? 3);

type ApiEvent = {
  rawPath?: string;
  body?: string | null;
  requestContext?: {
    http?: {
      method?: string;
    };
  };
};

function notificationsFrom(board: BoardView) {
  return (board.recentActivity ?? []).slice(0, activityLimit).map((entry: RecentActivityEntry) => {
    const titlePrefix = entry.type === "itemCreated" ? "New item" : entry.type === "statusChanged" ? "Moved" : "Event";
    return {
      level: "info" as const,
      title: `${titlePrefix}: ${entry.itemTitle}`,
      detail: `${entry.summary} · ${new Date(entry.occurredAt).toLocaleTimeString()}`,
    };
  });
}

function json(statusCode: number, body: unknown, headers: Record<string, string> = {}): { statusCode: number; body: string; headers: Record<string, string> } {
  return {
    statusCode,
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json",
      ...headers,
    },
  };
}

async function proxy(path: string, method = "GET", body?: unknown): Promise<{ status: number; payload: unknown; retries: number }> {
  const baseUrl = process.env.BACKEND_BASE_URL;

  if (!baseUrl) {
    return {
      status: 500,
      payload: {
        error: "MissingBackendUrl",
        message: "Set BACKEND_BASE_URL for the final-stage BFF Lambda.",
      },
      retries: 0,
    };
  }

  const retryCount = Number(process.env.BFF_RETRY_COUNT ?? 2);

  for (let attempt = 0; attempt <= retryCount; attempt += 1) {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        "content-type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const payload = await response.json();
    if (response.status < 500 || attempt === retryCount) {
      return {
        status: response.status,
        payload,
        retries: attempt,
      };
    }
  }

  return {
    status: 502,
    payload: {
      error: "BadGateway",
    },
    retries: retryCount,
  };
}

export async function handler(event: ApiEvent): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> {
  const method = event.requestContext?.http?.method ?? "GET";
  const path = event.rawPath ?? "/";

  if (method === "GET" && path === "/api/logs") {
    return json(200, { entries: activityLog.list(50) });
  }

  if (method === "GET" && path === "/api/board") {
    activityLog.record("api", "GET /api/board");
    const result = await proxy("/internal/board");
    return json(result.status, result.payload, { "x-retry-count": String(result.retries) });
  }

  if (method === "GET" && path === "/api/notifications") {
    const result = await proxy("/internal/board");
    if (result.status !== 200) {
      return json(result.status, result.payload, { "x-retry-count": String(result.retries) });
    }
    const notifications = notificationsFrom(result.payload as BoardView);
    activityLog.record("api", `GET /api/notifications`, { count: notifications.length });
    return json(200, { notifications }, { "x-retry-count": String(result.retries) });
  }

  if (method === "POST" && path === "/api/board/reset") {
    const result = await proxy("/internal/board/reset", "POST");
    return json(result.status, result.payload, { "x-retry-count": String(result.retries) });
  }

  const itemMatch = path.match(/^\/api\/items\/([^/]+)$/);
  if (method === "GET" && itemMatch) {
    const result = await proxy(`/internal/items/${itemMatch[1]}`);
    return json(result.status, result.payload, { "x-retry-count": String(result.retries) });
  }

  const statusMatch = path.match(/^\/api\/items\/([^/]+)\/status$/);
  if (method === "POST" && statusMatch) {
    const payload = event.body ? JSON.parse(event.body) : {};
    const result = await proxy(`/internal/items/${statusMatch[1]}/status`, "POST", payload);
    return json(result.status, result.payload, { "x-retry-count": String(result.retries) });
  }

  return json(404, { error: "NotFound" });
}
