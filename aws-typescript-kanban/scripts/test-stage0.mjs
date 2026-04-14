import assert from "node:assert/strict";
import { localBackendService, localBoardStore, localQueue } from "../dist/packages/shared/src/stages/local.js";

await localQueue.reset();
await localBoardStore.resetBoardState();

let board = await localBackendService.getBoardView();
assert.equal(board.items.length >= 5, true);
assert.equal(board.queueDepth, 0);

const updated = await localBackendService.setItemStatus("item_002", "doing");
assert.equal(updated?.status, "doing");

const queued = await localBackendService.enqueueExternalEvent({
  title: "Async verification task",
  sourceType: "github",
  externalId: "workshop#verify",
});

assert.equal(queued.payload.title, "Async verification task");
assert.equal((await localQueue.getMetrics()).queueDepth, 1);

await localBackendService.workQueueOnce();

board = await localBackendService.getBoardView();
assert.equal(board.items.some((item) => item.title === "Async verification task"), true);
assert.equal(board.queueDepth, 0);

console.log("Stage 0 logic verification passed.");
