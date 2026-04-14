import { createDynamoBoardStore } from "../aws/dynamo-board-store.js";
import { createNoopQueue } from "../aws/noop-queue.js";
import { createBackendService } from "../backend-service.js";

export const privateBoardStore = createDynamoBoardStore();
export const privateQueue = createNoopQueue();
export const privateBackendService = createBackendService({
  boardStore: privateBoardStore,
  queue: privateQueue,
  mode: "aws-private",
});
