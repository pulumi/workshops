import { GetQueueAttributesCommand, PurgeQueueCommand, SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import type { EventQueue } from "../queue.js";
import type { ExternalEventPayload, QueueMessage } from "../types.js";

const client = new SQSClient({});

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable ${name}.`);
  }

  return value;
}

function queueUrl(): string {
  return requireEnv("EVENT_QUEUE_URL");
}

function deadLetterQueueUrl(): string | null {
  return process.env.DEAD_LETTER_QUEUE_URL ?? null;
}

async function readApproximateDepth(url: string): Promise<number> {
  const response = await client.send(new GetQueueAttributesCommand({
    QueueUrl: url,
    AttributeNames: ["ApproximateNumberOfMessages"],
  }));

  return Number(response.Attributes?.ApproximateNumberOfMessages ?? "0");
}

export function createSqsQueue(): EventQueue {
  return {
    async reset(): Promise<void> {
      await client.send(new PurgeQueueCommand({
        QueueUrl: queueUrl(),
      }));

      const deadLetterUrl = deadLetterQueueUrl();
      if (deadLetterUrl) {
        await client.send(new PurgeQueueCommand({
          QueueUrl: deadLetterUrl,
        }));
      }
    },

    async enqueueExternalEvent(payload: ExternalEventPayload): Promise<QueueMessage> {
      const response = await client.send(new SendMessageCommand({
        QueueUrl: queueUrl(),
        MessageBody: JSON.stringify(payload),
      }));

      return {
        id: response.MessageId ?? `msg_${Date.now()}`,
        payload,
        attempts: 0,
        availableAt: new Date().toISOString(),
      };
    },

    async getMetrics() {
      const [queueDepth, deadLetterCount] = await Promise.all([
        readApproximateDepth(queueUrl()),
        deadLetterQueueUrl() ? readApproximateDepth(deadLetterQueueUrl()!) : Promise.resolve(0),
      ]);

      return {
        queueDepth,
        deadLetterCount,
      };
    },

    async claimNextAvailableMessage(): Promise<QueueMessage | null> {
      throw new Error("claimNextAvailableMessage is not used in the AWS final stage. Use the SQS-triggered worker Lambda instead.");
    },

    async acknowledgeMessage(_messageId: string): Promise<void> {
      throw new Error("acknowledgeMessage is not used in the AWS final stage. Use SQS event source mapping acknowledgements instead.");
    },

    async retryMessage(_message: QueueMessage, _reason: string): Promise<void> {
      throw new Error("retryMessage is not used in the AWS final stage. Use SQS redrive policy instead.");
    },
  };
}
