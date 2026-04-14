import { createBackendService } from "../backend-service.js";
import { createDynamoBoardStore } from "../aws/dynamo-board-store.js";
import { createSqsQueue } from "../aws/sqs-queue.js";

export const finalBoardStore = createDynamoBoardStore();
export const finalQueue = createSqsQueue();
export const finalBackendService = createBackendService({
  boardStore: finalBoardStore,
  queue: finalQueue,
  mode: "aws-final",
});
