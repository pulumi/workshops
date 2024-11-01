import { ChatCompletionMessageParam } from "openai/resources/chat";
import { Logger } from "pino";
import { RedisClientType, createClient } from "redis";

export class MemoryService {
  static async initialize() {
    const client = createClient<any, any, any>({
      url: process.env.REDIS_BASE ?? "redis://localhost:6379/0",
    });
    await client.connect();

    return new MemoryService(client);
  }

  private constructor(private redisClient: RedisClientType<any>) { }

  async lookupConversation(conversationId: string) {
    const conversationStr = await this.redisClient.get(conversationId);

    if (conversationStr) {
      return JSON.parse(
        conversationStr
      ) as ChatCompletionMessageParam[];
    } else {
      return null;
    }
  }

  async storeConversation(
    chatGuid: string,
    chat: ChatCompletionMessageParam[],
    logger: Logger
  ) {
    logger.info("Recording conversation %s", chatGuid);
    await this.redisClient.set(chatGuid, JSON.stringify(chat));
  }
}
