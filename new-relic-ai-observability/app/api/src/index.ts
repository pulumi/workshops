import Hapi from "@hapi/hapi";
import Pino from "hapi-pino";
import { VectorDbService } from "./vector-db";
import { AiService, EmbeddingService } from "./ai";
import { initializeRoutes } from "./routes";
import { MemoryService } from "./memory";

const init = async () => {
  const server = Hapi.server({
    port: 8081,
    host: "0.0.0.0",
    routes: {
      cors: {
        origin: ["*"],
        headers: [
          "Accept",
          "Authorization",
          "Content-Type",
          "If-None-Match",
          "newrelic",
          "traceparent",
          "tracestate",
          "x-ai-engine",
          "x-instrumentation-method",
        ],
      },
    },
  });

  await server.register(Pino);

  const embeddingService = await EmbeddingService.initialize();
  const vectorDbService = await VectorDbService.initialize(embeddingService);
  const aiService = await AiService.initialize(vectorDbService);
  const memoryService = await MemoryService.initialize();

  await initializeRoutes(server, vectorDbService, aiService, memoryService);

  await server.start();
  console.log("Server running on %s", server.info.uri);
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();
