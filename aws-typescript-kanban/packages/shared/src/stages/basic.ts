import { createDynamoBoardStore } from "../aws/dynamo-board-store.js";
import { createNoopQueue } from "../aws/noop-queue.js";
import { createBackendService } from "../backend-service.js";

export const basicBoardStore = createDynamoBoardStore();
export const basicQueue = createNoopQueue();
export const basicBackendService = createBackendService({
  boardStore: basicBoardStore,
  queue: basicQueue,
  mode: "aws-basic",
});
