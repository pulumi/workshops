import { createBackendService } from "../backend-service.js";
import { createFileBoardStore } from "../local/file-board-store.js";
import { createFileQueue } from "../local/file-queue.js";

export const localBoardStore = createFileBoardStore();
export const localQueue = createFileQueue();
export const localBackendService = createBackendService({
  boardStore: localBoardStore,
  queue: localQueue,
  mode: "local-file",
});
