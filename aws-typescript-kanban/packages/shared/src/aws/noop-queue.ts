import type { EventQueue } from "../queue.js";
import type { ExternalEventPayload, QueueMessage } from "../types.js";

export function createNoopQueue(): EventQueue {
  return {
    async reset(): Promise<void> {
      return;
    },

    async enqueueExternalEvent(_payload: ExternalEventPayload): Promise<QueueMessage> {
      throw new Error("External event enqueue is not enabled for this stage.");
    },

    async getMetrics() {
      return {
        queueDepth: 0,
        deadLetterCount: 0,
      };
    },

    async claimNextAvailableMessage(): Promise<QueueMessage | null> {
      return null;
    },

    async acknowledgeMessage(_messageId: string): Promise<void> {
      return;
    },

    async retryMessage(_message: QueueMessage, _reason: string): Promise<void> {
      return;
    },
  };
}
