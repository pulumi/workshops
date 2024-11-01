import Hapi from "@hapi/hapi";
import Nes from "@hapi/nes";
import { VectorDbService } from "./vector-db";
import { AiService } from "./ai";
import { MemoryService } from "./memory";
import { ChatCompletionMessageParam } from "openai/resources/chat";
import crypto from "crypto";
import newrelic from "newrelic";

export async function initializeRoutes(
  server: Hapi.Server,
  vectorDbService: VectorDbService,
  aiService: AiService,
  memoryService: MemoryService
) {
  await server.register(Nes);

  server.route({
    method: "GET",
    path: "/activities",
    handler: async (req) => {
      const activity = await vectorDbService.queryAllActivity();
      return activity;
    },
  });

  server.route({
    method: "GET",
    path: "/activities/search",
    handler: async (req) => {
      const activitySearchTerm = req.query.activity;
      const activity = await vectorDbService.queryActivity(activitySearchTerm);
      return activity;
    },
  });

  server.route({
    method: "POST",
    path: "/chat",
    handler: async (req) => {
      const message: string = (req.payload as any).message;
      const chatUuid = crypto.randomUUID();
      const streaming = req.query["stream"] === "true";

      newrelic.addCustomAttribute("conversation_id", chatUuid);
      const logger = req.logger.child({ conversationId: chatUuid });
      logger.info("Generated conversation ID: %s", chatUuid);

      logger.info("Human asked: %s", message);
      const conversation = aiService.generateInitialPrompt(message);
      const chatOperation = aiService
        .completeChat(conversation, logger, streaming, (progress) =>
          server.publish(`/chat/${chatUuid}`, progress)
        )
        .then((chat) => {
          memoryService.storeConversation(chatUuid, chat, logger);
          return chat;
        });

      if (streaming) {
        return {
          guid: chatUuid,
        };
      } else {
        const chat = await chatOperation;
        if (message.endsWith("?!?!")) {
          throw new Error("Oh noes!");
        }
        return {
          guid: chatUuid,
          messages: filterChat(chat),
        };
      }
    },
    options: {
      payload: {
        parse: true,
      },
    },
  });

  server.subscription("/chat/{guid}");

  server.route({
    method: "PUT",
    path: "/chat/{chatId}",
    handler: async (req) => {
      const chatId: string = req.params.chatId;
      newrelic.addCustomAttribute("conversation_id", chatId);

      const logger = req.logger.child({ conversationId: chatId });

      logger.info("Resuming conversation: %s", chatId);
      const message: string = (req.payload as any).message;

      const conversation = await memoryService.lookupConversation(chatId);
      if (!conversation) {
        throw new Error(`Failed to load conversation ${chatId} from memory`);
      }
      logger.info(
        "Found conversation with %d context messages",
        conversation.length
      );

      const streaming = req.query["stream"] === "true";

      const chatOperation = aiService
        .completeChat(
          [...conversation, { role: "user", content: message }],
          logger,
          streaming,
          (progress) => server.publish(`/chat/${chatId}`, progress)
        )
        .then((chat) => {
          memoryService.storeConversation(chatId, chat, logger);
          return chat;
        });

      if (streaming) {
        return {
          guid: chatId,
        };
      } else {
        const chat = await chatOperation;
        return {
          guid: chatId,
          messages: filterChat(chat),
        };
      }
    },
    options: {
      payload: {
        parse: true,
      },
    },
  });
}

function filterChat(chat: ChatCompletionMessageParam[]) {
  return chat.filter(
    (message) =>
      (message.role === "assistant" || message.role === "user") &&
      (!("function_call" in message) || !message.tool_calls)
  );
}
