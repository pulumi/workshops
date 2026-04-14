import { access, copyFile } from "node:fs/promises";
import { dataPath, ensureDataDir, readJsonFile, writeJsonFile } from "../files.js";
import type { EventQueue } from "../queue.js";
import type { DeadLetterEntry, ExternalEventPayload, QueueMessage, QueueState } from "../types.js";

const visibilityTimeoutMs = Number(process.env.LOCAL_QUEUE_VISIBILITY_TIMEOUT_MS ?? 1200);
const maxAttempts = Number(process.env.LOCAL_QUEUE_MAX_ATTEMPTS ?? 3);

function nowIso(): string {
  return new Date().toISOString();
}

function inFutureIso(ms: number): string {
  return new Date(Date.now() + ms).toISOString();
}

function messageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

async function ensureQueueFile(name: string, initial: unknown): Promise<void> {
  await ensureDataDir();

  try {
    await access(dataPath(name));
  } catch {
    await writeJsonFile(dataPath(name), initial);
  }
}

async function loadQueueState(): Promise<QueueState> {
  await ensureQueueFile("event-queue.json", { messages: [] });
  return readJsonFile<QueueState>(dataPath("event-queue.json"));
}

async function saveQueueState(queueState: QueueState): Promise<void> {
  await writeJsonFile(dataPath("event-queue.json"), queueState);
}

async function loadDeadLetters(): Promise<DeadLetterEntry[]> {
  await ensureQueueFile("dead-letter-queue.json", []);
  return readJsonFile<DeadLetterEntry[]>(dataPath("dead-letter-queue.json"));
}

async function saveDeadLetters(entries: DeadLetterEntry[]): Promise<void> {
  await writeJsonFile(dataPath("dead-letter-queue.json"), entries);
}

export function createFileQueue(): EventQueue {
  return {
    async reset(): Promise<void> {
      await ensureDataDir();
      await copyFile(dataPath("initial-board.json"), dataPath("board-state.json"));
      await writeJsonFile(dataPath("event-queue.json"), { messages: [] });
      await writeJsonFile(dataPath("dead-letter-queue.json"), []);
    },

    async enqueueExternalEvent(payload: ExternalEventPayload): Promise<QueueMessage> {
      const queueState = await loadQueueState();
      const message: QueueMessage = {
        id: messageId(),
        payload,
        attempts: 0,
        availableAt: nowIso(),
      };

      queueState.messages.push(message);
      await saveQueueState(queueState);
      return message;
    },

    async getMetrics() {
      const [queueState, deadLetters] = await Promise.all([loadQueueState(), loadDeadLetters()]);
      return {
        queueDepth: queueState.messages.length,
        deadLetterCount: deadLetters.length,
      };
    },

    async claimNextAvailableMessage(): Promise<QueueMessage | null> {
      const queueState = await loadQueueState();
      const now = Date.now();
      const nextMessage = queueState.messages.find((message) => Date.parse(message.availableAt) <= now);

      if (!nextMessage) {
        return null;
      }

      nextMessage.availableAt = inFutureIso(visibilityTimeoutMs);
      await saveQueueState(queueState);
      return nextMessage;
    },

    async acknowledgeMessage(messageIdValue: string): Promise<void> {
      const queueState = await loadQueueState();
      queueState.messages = queueState.messages.filter((message) => message.id !== messageIdValue);
      await saveQueueState(queueState);
    },

    async retryMessage(message: QueueMessage, reason: string): Promise<void> {
      const queueState = await loadQueueState();
      const target = queueState.messages.find((candidate) => candidate.id === message.id);

      if (!target) {
        return;
      }

      target.attempts += 1;
      target.lastError = reason;

      if (target.attempts >= maxAttempts) {
        queueState.messages = queueState.messages.filter((candidate) => candidate.id !== message.id);
        await saveQueueState(queueState);
        const deadLetters = await loadDeadLetters();
        deadLetters.push({
          ...target,
          failedAt: nowIso(),
        });
        await saveDeadLetters(deadLetters);
        return;
      }

      target.availableAt = inFutureIso(visibilityTimeoutMs);
      await saveQueueState(queueState);
    },
  };
}
