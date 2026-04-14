import { copyFile } from "node:fs/promises";
import { dataPath, ensureDataDir, readJsonFile, writeJsonFile } from "../files.js";
import type { BoardStore } from "../board-store.js";
import type { BoardState, ExternalEventPayload, HistoryEvent, Item, Status } from "../types.js";

function timestamp(): string {
  return new Date().toISOString();
}

function makeItemId(nextItemId: number): string {
  return `item_${String(nextItemId).padStart(3, "0")}`;
}

function makeHistoryId(nextHistoryId: number): string {
  return `h_${String(nextHistoryId).padStart(3, "0")}`;
}

async function ensureBoardStateFile(): Promise<void> {
  await ensureDataDir();

  try {
    await readJsonFile<BoardState>(dataPath("board-state.json"));
  } catch {
    await copyFile(dataPath("initial-board.json"), dataPath("board-state.json"));
  }
}

function addHistory(state: BoardState, itemId: string, entry: HistoryEvent): void {
  const current = state.history[itemId] ?? [];
  state.history[itemId] = [...current, entry];
}

export function createFileBoardStore(): BoardStore {
  return {
    async loadBoardState(): Promise<BoardState> {
      await ensureBoardStateFile();
      return readJsonFile<BoardState>(dataPath("board-state.json"));
    },

    async saveBoardState(state: BoardState): Promise<void> {
      await ensureBoardStateFile();
      await writeJsonFile(dataPath("board-state.json"), state);
    },

    async resetBoardState(): Promise<BoardState> {
      await copyFile(dataPath("initial-board.json"), dataPath("board-state.json"));
      return this.loadBoardState();
    },

    async getItem(itemId: string) {
      const state = await this.loadBoardState();
      const item = state.items.find((candidate) => candidate.id === itemId);

      if (!item) {
        return null;
      }

      return {
        item,
        history: state.history[itemId] ?? [],
      };
    },

    async updateItemStatus(itemId: string, status: Status): Promise<Item | null> {
      const state = await this.loadBoardState();
      const index = state.items.findIndex((item) => item.id === itemId);

      if (index === -1) {
        return null;
      }

      const current = state.items[index];
      const updated: Item = {
        ...current,
        status,
        updatedAt: timestamp(),
      };

      state.items[index] = updated;
      state.lastModified = updated.updatedAt;
      addHistory(state, itemId, {
        id: makeHistoryId(state.nextHistoryId++),
        type: "statusChanged",
        occurredAt: updated.updatedAt,
        summary: `Moved to ${status}`,
      });

      await this.saveBoardState(state);
      return updated;
    },

    async createItemFromExternalEvent(payload: ExternalEventPayload): Promise<Item> {
      const state = await this.loadBoardState();
      const now = timestamp();
      const itemId = makeItemId(state.nextItemId++);

      const item: Item = {
        id: itemId,
        title: payload.title,
        status: payload.status ?? "inbox",
        source: {
          type: payload.sourceType,
          externalId: payload.externalId,
          display: payload.externalId,
        },
        createdAt: now,
        updatedAt: now,
      };

      state.items.unshift(item);
      addHistory(state, itemId, {
        id: makeHistoryId(state.nextHistoryId++),
        type: "externalEvent",
        occurredAt: now,
        summary: `Created from ${payload.sourceType} webhook`,
      });
      state.lastModified = now;

      await this.saveBoardState(state);
      return item;
    },
  };
}
