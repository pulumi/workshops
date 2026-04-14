import type { BoardStore } from "./board-store.js";
import type { EventQueue } from "./queue.js";
import { STATUSES, type BoardView, type Item, type QueueMessage, type Status } from "./types.js";

export class TransientServiceError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode = 503) {
    super(message);
    this.name = "TransientServiceError";
    this.statusCode = statusCode;
  }
}

function probabilityFromEnv(name: string): number {
  const raw = process.env[name];

  if (!raw) {
    return 0;
  }

  const value = Number(raw);
  return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
}

function maybeFail(probability: number, label: string): void {
  if (probability > 0 && Math.random() < probability) {
    throw new TransientServiceError(`${label} failed during chaos simulation.`);
  }
}

export class BackendService {
  constructor(
    private readonly boardStore: BoardStore,
    private readonly queue: EventQueue,
    private readonly mode: BoardView["mode"],
  ) {}

  private async buildBoardView(): Promise<BoardView> {
    const [state, metrics] = await Promise.all([this.boardStore.loadBoardState(), this.queue.getMetrics()]);
    const titleById = new Map(state.items.map((item) => [item.id, item.title]));
    const recentActivity = Object.entries(state.history)
      .flatMap(([itemId, events]) =>
        events.map((event) => ({
          id: event.id,
          itemId,
          itemTitle: titleById.get(itemId) ?? itemId,
          type: event.type,
          occurredAt: event.occurredAt,
          summary: event.summary,
        })),
      )
      .sort((a, b) => (a.occurredAt < b.occurredAt ? 1 : -1))
      .slice(0, 10);
    return {
      columns: [...STATUSES],
      items: state.items,
      queueDepth: metrics.queueDepth,
      deadLetterCount: metrics.deadLetterCount,
      mode: this.mode,
      recentActivity,
    };
  }

  async getBoardView(): Promise<BoardView> {
    maybeFail(probabilityFromEnv("CHAOS_SYNC_PROBABILITY"), "Board fetch");
    return this.buildBoardView();
  }

  async getItemView(itemId: string): Promise<{ item: Item; history: unknown[] } | null> {
    maybeFail(probabilityFromEnv("CHAOS_SYNC_PROBABILITY"), "Item fetch");
    return this.boardStore.getItem(itemId);
  }

  async setItemStatus(itemId: string, status: Status): Promise<Item | null> {
    maybeFail(probabilityFromEnv("CHAOS_SYNC_PROBABILITY"), "Status update");
    return this.boardStore.updateItemStatus(itemId, status);
  }

  async resetBoard(): Promise<BoardView> {
    await this.boardStore.resetBoardState();
    return this.buildBoardView();
  }

  async enqueueExternalEvent(payload: QueueMessage["payload"]) {
    return this.queue.enqueueExternalEvent(payload);
  }

  private async processQueueMessage(message: QueueMessage): Promise<void> {
    maybeFail(probabilityFromEnv("CHAOS_ASYNC_PROBABILITY"), "Async event");
    await this.boardStore.createItemFromExternalEvent(message.payload);
  }

  async workQueueOnce(): Promise<boolean> {
    const message = await this.queue.claimNextAvailableMessage();

    if (!message) {
      return false;
    }

    try {
      await this.processQueueMessage(message);
      await this.queue.acknowledgeMessage(message.id);
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Unknown queue worker failure";
      await this.queue.retryMessage(message, reason);
    }

    return true;
  }
}

export function createBackendService(options: {
  boardStore: BoardStore;
  queue: EventQueue;
  mode: BoardView["mode"];
}): BackendService {
  return new BackendService(options.boardStore, options.queue, options.mode);
}
