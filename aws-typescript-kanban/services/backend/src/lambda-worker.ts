import type { SQSBatchResponse, SQSEvent } from "aws-lambda";
import { finalBoardStore } from "../../../packages/shared/src/stages/final.js";

export async function handler(event: SQSEvent): Promise<SQSBatchResponse> {
  const failures: SQSBatchResponse["batchItemFailures"] = [];

  for (const record of event.Records) {
    try {
      await finalBoardStore.createItemFromExternalEvent(JSON.parse(record.body));
    } catch (error) {
      console.error("Failed to process SQS record", record.messageId, error);
      if (error instanceof Error) {
        failures.push({ itemIdentifier: record.messageId });
      }
    }
  }

  return {
    batchItemFailures: failures,
  };
}
