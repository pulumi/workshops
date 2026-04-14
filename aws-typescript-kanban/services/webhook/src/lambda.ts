import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { finalBackendService } from "../../../packages/shared/src/stages/final.js";
import type { ExternalEventPayload } from "../../../packages/shared/src/types.js";

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> {
  const payload = event.body ? JSON.parse(event.body) as ExternalEventPayload : null;

  if (!payload?.title || !payload.externalId || !payload.sourceType) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "InvalidPayload",
      }),
    };
  }

  const message = await finalBackendService.enqueueExternalEvent(payload);
  return {
    statusCode: 202,
    body: JSON.stringify({
      accepted: true,
      messageId: message.id,
    }),
  };
}
