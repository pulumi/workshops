import type { BoardState, ExternalEventPayload, HistoryEvent, Item, Status } from "./types.js";

export type ItemView = {
  item: Item;
  history: HistoryEvent[];
};

export interface BoardStore {
  loadBoardState(): Promise<BoardState>;
  saveBoardState(state: BoardState): Promise<void>;
  resetBoardState(): Promise<BoardState>;
  getItem(itemId: string): Promise<ItemView | null>;
  updateItemStatus(itemId: string, status: Status): Promise<Item | null>;
  createItemFromExternalEvent(payload: ExternalEventPayload): Promise<Item>;
}
