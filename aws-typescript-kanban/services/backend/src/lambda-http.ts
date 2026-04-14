import type { ALBEvent, ALBResult, APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { ActivityLog } from "../../../packages/shared/src/activity-log.js";
import { TransientServiceError } from "../../../packages/shared/src/backend-service.js";
import { basicBackendService } from "../../../packages/shared/src/stages/basic.js";
import { finalBackendService } from "../../../packages/shared/src/stages/final.js";
import { privateBackendService } from "../../../packages/shared/src/stages/private.js";

const activityLog = new ActivityLog();

// Stage 1 and Stage 3 front the backend Lambda with API Gateway v2;
// Stage 2 fronts it with an internal ALB. The two wire formats differ,
// so accept either and normalize method and path below.
type LambdaEvent = APIGatewayProxyEventV2 | ALBEvent;
type LambdaResponse = APIGatewayProxyStructuredResultV2 & ALBResult;

function response(statusCode: number, body: unknown): LambdaResponse {
  return {
    statusCode,
    isBase64Encoded: false,
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  };
}

function backendServiceForStage() {
  const stage = process.env.APP_STAGE ?? "";

  if (stage.includes("basic")) {
    return basicBackendService;
  }

  if (stage.includes("private")) {
    return privateBackendService;
  }

  return finalBackendService;
}

export async function handler(event: LambdaEvent): Promise<LambdaResponse> {
  const method = "requestContext" in event && "http" in event.requestContext
    ? event.requestContext.http.method
    : (event as ALBEvent).httpMethod ?? "GET";
  const path = "rawPath" in event ? event.rawPath : (event as ALBEvent).path ?? "/";
  const backendService = backendServiceForStage();

  try {
    if (method === "GET" && path === "/internal/logs") {
      return response(200, { entries: activityLog.list(50) });
    }

    if (method === "GET" && path === "/internal/board") {
      activityLog.record("http", "GET /internal/board");
      return response(200, await backendService.getBoardView());
    }

    if (method === "POST" && path === "/internal/board/reset") {
      return response(200, await backendService.resetBoard());
    }

    const itemMatch = path.match(/^\/internal\/items\/([^/]+)$/);
    if (method === "GET" && itemMatch) {
      const item = await backendService.getItemView(itemMatch[1]);
      return response(item ? 200 : 404, item ?? { error: "NotFound" });
    }

    const statusMatch = path.match(/^\/internal\/items\/([^/]+)\/status$/);
    if (method === "POST" && statusMatch) {
      const payload = event.body ? JSON.parse(event.body) as { status: "inbox" | "doing" | "blocked" | "done" } : { status: "inbox" as const };
      const item = await backendService.setItemStatus(statusMatch[1], payload.status);
      activityLog.record("http", `status ${statusMatch[1]} -> ${payload.status}`);
      return response(item ? 200 : 404, item ?? { error: "NotFound" });
    }

    return response(404, { error: "NotFound" });
  } catch (error) {
    if (error instanceof TransientServiceError) {
      return response(error.statusCode, {
        error: error.name,
        message: error.message,
      });
    }

    return response(500, {
      error: "InternalServerError",
      message: error instanceof Error ? error.message : "Unexpected Lambda error",
    });
  }
}
