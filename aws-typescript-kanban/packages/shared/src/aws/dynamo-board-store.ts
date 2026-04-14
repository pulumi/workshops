import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { dataPath, readJsonFile } from "../files.js";
import type { BoardStore, ItemView } from "../board-store.js";
import type { BoardState, ExternalEventPayload, HistoryEvent, Item, Status } from "../types.js";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable ${name}.`);
  }

  return value;
}

function boardTableName(): string {
  return requireEnv("BOARD_TABLE_NAME");
}

function boardStateKey(): string {
  return process.env.BOARD_STATE_PK ?? "BOARD_STATE";
}

function timestamp(): string {
  return new Date().toISOString();
}

function makeItemId(nextItemId: number): string {
  return `item_${String(nextItemId).padStart(3, "0")}`;
}

function makeHistoryId(nextHistoryId: number): string {
  return `h_${String(nextHistoryId).padStart(3, "0")}`;
}

function addHistory(state: BoardState, itemId: string, entry: HistoryEvent): void {
  const current = state.history[itemId] ?? [];
  state.history[itemId] = [...current, entry];
}

async function seedState(): Promise<BoardState> {
  return readJsonFile<BoardState>(dataPath("initial-board.json"));
}

async function writeState(state: BoardState): Promise<void> {
  await client.send(new PutCommand({
    TableName: boardTableName(),
    Item: {
      pk: boardStateKey(),
      state,
    },
  }));
}

async function readState(): Promise<BoardState | null> {
  const response = await client.send(new GetCommand({
    TableName: boardTableName(),
    Key: {
      pk: boardStateKey(),
    },
  }));

  return (response.Item?.state as BoardState | undefined) ?? null;
}

async function loadOrSeedBoardState(): Promise<BoardState> {
  const existing = await readState();

  if (existing) {
    return existing;
  }

  const seeded = await seedState();
  await writeState(seeded);
  return seeded;
}

export function createDynamoBoardStore(): BoardStore {
  return {
    loadBoardState: async (): Promise<BoardState> => loadOrSeedBoardState(),

    saveBoardState: async (state: BoardState): Promise<void> => {
      await writeState(state);
    },

    resetBoardState: async (): Promise<BoardState> => {
      const seeded = await seedState();
      await writeState(seeded);
      return seeded;
    },

    getItem: async (itemId: string): Promise<ItemView | null> => {
      const state = await loadOrSeedBoardState();
      const item = state.items.find((candidate) => candidate.id === itemId);

      if (!item) {
        return null;
      }

      return {
        item,
        history: state.history[itemId] ?? [],
      };
    },

    updateItemStatus: async (itemId: string, status: Status): Promise<Item | null> => {
      const state = await loadOrSeedBoardState();
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

      await writeState(state);
      return updated;
    },

    createItemFromExternalEvent: async (payload: ExternalEventPayload): Promise<Item> => {
      const state = await loadOrSeedBoardState();
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

      await writeState(state);
      return item;
    },
  };
}
