import { finalBoardStore } from "../../../packages/shared/src/stages/final.js";

type SqsRecord = {
  messageId: string;
  body: string;
};

type SqsEvent = {
  Records?: SqsRecord[];
};

export async function handler(event: SqsEvent): Promise<{ batchItemFailures: Array<{ itemIdentifier: string }> }> {
  const failures: Array<{ itemIdentifier: string }> = [];

  for (const record of event.Records ?? []) {
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
