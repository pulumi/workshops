import { createServer } from "node:http";
import { ActivityLog } from "../../../packages/shared/src/activity-log.js";
import { TransientServiceError } from "../../../packages/shared/src/backend-service.js";
import { readJsonBody, sendJson, sendText } from "../../../packages/shared/src/http.js";
import { localBackendService } from "../../../packages/shared/src/stages/local.js";
import type { Status } from "../../../packages/shared/src/types.js";

const port = Number(process.env.BACKEND_PORT ?? 7001);
const queuePollMs = Number(process.env.LOCAL_QUEUE_POLL_MS ?? 1000);
const activityLog = new ActivityLog();

function routeNotFound() {
  return { error: "Not found" };
}

async function startQueueWorker(): Promise<void> {
  setInterval(async () => {
    try {
      const processed = await localBackendService.workQueueOnce();
      if (processed) {
        activityLog.record("worker", "processed queue message");
      }
    } catch (error) {
      activityLog.record("worker", "queue processing failed", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }, queuePollMs);
}

createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? `localhost:${port}`}`);

  try {
    if (request.method === "GET" && url.pathname === "/health") {
      sendText(response, 200, "healthy");
      return;
    }

    if (request.method === "GET" && url.pathname === "/internal/logs") {
      const limit = Number(url.searchParams.get("limit") ?? "50");
      sendJson(response, 200, { entries: activityLog.list(limit) });
      return;
    }

    if (request.method === "DELETE" && url.pathname === "/internal/logs") {
      activityLog.clear();
      sendJson(response, 200, { cleared: true });
      return;
    }

    if (request.method === "GET" && url.pathname === "/internal/board") {
      activityLog.record("http", "GET /internal/board");
      sendJson(response, 200, await localBackendService.getBoardView());
      return;
    }

    if (request.method === "POST" && url.pathname === "/internal/board/reset") {
      activityLog.record("http", "POST /internal/board/reset");
      sendJson(response, 200, await localBackendService.resetBoard());
      return;
    }

    const itemMatch = url.pathname.match(/^\/internal\/items\/([^/]+)$/);
    if (request.method === "GET" && itemMatch) {
      const result = await localBackendService.getItemView(itemMatch[1]);
      sendJson(response, result ? 200 : 404, result ?? routeNotFound());
      return;
    }

    const statusMatch = url.pathname.match(/^\/internal\/items\/([^/]+)\/status$/);
    if (request.method === "POST" && statusMatch) {
      const body = await readJsonBody<{ status: Status }>(request);
      const result = await localBackendService.setItemStatus(statusMatch[1], body.status);
      activityLog.record("http", `status change ${statusMatch[1]} -> ${body.status}`, {
        found: Boolean(result),
      });
      sendJson(response, result ? 200 : 404, result ?? routeNotFound());
      return;
    }

    sendJson(response, 404, routeNotFound());
  } catch (error) {
    if (error instanceof TransientServiceError) {
      activityLog.record("http", "transient error", { message: error.message });
      sendJson(response, error.statusCode, {
        error: error.name,
        message: error.message,
      });
      return;
    }

    activityLog.record("http", "internal error", {
      message: error instanceof Error ? error.message : String(error),
    });
    sendJson(response, 500, {
      error: "InternalServerError",
      message: error instanceof Error ? error.message : "Unexpected backend failure",
    });
  }
}).listen(port, async () => {
  await startQueueWorker();
  console.log(`[backend] listening on http://127.0.0.1:${port}`);
});
