import { localBoardStore, localQueue } from "../dist/packages/shared/src/stages/local.js";

await localQueue.reset();
await localBoardStore.resetBoardState();
console.log("Reset board state, queue, and dead letters.");
