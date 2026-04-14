import type { ExternalEventPayload, QueueMessage } from "./types.js";

export type QueueMetrics = {
  queueDepth: number;
  deadLetterCount: number;
};

export interface EventQueue {
  reset(): Promise<void>;
  enqueueExternalEvent(payload: ExternalEventPayload): Promise<QueueMessage>;
  getMetrics(): Promise<QueueMetrics>;
  claimNextAvailableMessage(): Promise<QueueMessage | null>;
  acknowledgeMessage(messageId: string): Promise<void>;
  retryMessage(message: QueueMessage, reason: string): Promise<void>;
}
