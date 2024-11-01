import { OpenAI } from "openai";
import { assertExists } from "./utils";
import {
  ChatCompletionChunk,
  ChatCompletionMessage,
  ChatCompletionMessageParam,
  ChatCompletionRole,
} from "openai/resources/chat";
import { VectorDbService } from "./vector-db";
import { Logger } from "pino";

const embeddingModel = "text-embedding-ada-002";
const chatModel = process.env.MODEL_TO_USE || "gpt-3.5-turbo";

console.log(`Using AI model: ${chatModel}`)

const functions = [
  {
    name: "lookup_game_rules",
    description:
      "lets you look up the rules for a game that the user wants to play",
    parameters: {
      type: "object",
      properties: {
        activity: { type: "string", description: "the game to play" },
      },
    },
  },
];

interface MessageChunk {
  type: "message_chunk";
  message: string;
}
interface CompleteChunk {
  type: "complete";
  reason: ChatCompletionChunk.Choice["finish_reason"];
  content: string;
}
interface FunctionCallChunk {
  type: "function_call";
  functionCall: ChatCompletionMessage["function_call"];
}
export type ProgressMessage = MessageChunk | CompleteChunk | FunctionCallChunk;

export class EmbeddingService {
  static async initialize() {
    const client = new OpenAI({
      apiKey: assertExists(
        process.env.OPENAI_API_KEY,
        "Expected OpenAI api key"
      ),
    });

    return new EmbeddingService(client);
  }

  private constructor(private client: OpenAI) { }

  async createEmbedding(str: string) {
    const embedding = await this.client.embeddings.create({
      input: str,
      model: embeddingModel,
    });
    return embedding.data[0].embedding;
  }
}

export class AiService {
  static async initialize(vectorDbService: VectorDbService) {

    const client = new OpenAI({
      apiKey: assertExists(
        process.env.OPENAI_API_KEY,
        "Expected OpenAI api key"
      ),
    });

    return new AiService(client, vectorDbService);
  }

  private constructor(
    private client: OpenAI,
    private vectorDbService: VectorDbService
  ) { }

  generateInitialPrompt(message: string): ChatCompletionMessageParam[] {
    return [
      {
        role: "system",
        content: `\
  You are an assistant who likes to play text based games. \
  When a user asks to play a game, you should print the rules \
  of the game and provide any visual cues needed for the user to start playing`,
      },
      {
        role: "user",
        content: message,
      },
    ];
  }

  async completeChat(
    messages: ChatCompletionMessageParam[],
    logger: Logger,
    streaming: boolean,
    onProgress: (progress: ProgressMessage) => void
  ) {
    const contextMessages: ChatCompletionMessageParam[] = [...messages];

    do {
      logger.info("Calling GPT");

      const nextMessage = await (streaming
        ? this.streamNextMessage(contextMessages, onProgress)
        : this.completeNextMessage(contextMessages));
      contextMessages.push(nextMessage as any);

      if (nextMessage.function_call) {
        logger.info(
          { calledFunction: nextMessage.function_call.name },
          "GPT requesting function call: %s",
          nextMessage.function_call.name
        );
        console.log("function call: " + JSON.stringify(nextMessage.function_call));
        const funcResult = await this.evalFunction(nextMessage.function_call);
        logger.info(
          { calledFunction: nextMessage.function_call.name },
          "GPT produced response: %s",
          funcResult.substring(0, 100)
        );
        contextMessages.push({
          role: "function",
          name: nextMessage.function_call.name,
          content: funcResult,
        });
      }
    } while (contextMessages[contextMessages.length - 1].role !== "assistant");

    return contextMessages;
  }

  private async completeNextMessage(
    contextMessages: ChatCompletionMessageParam[]
  ) {
    const completion = await this.client.chat.completions.create({
      model: chatModel,
      messages: contextMessages,
      function_call: "auto",
      functions,
    });
    return completion.choices[0].message;
  }

  private async streamNextMessage(
    contextMessages: ChatCompletionMessageParam[],
    streamProgress: (progress: ProgressMessage) => void
  ) {
    let content = "";
    let functionCall: ChatCompletionMessage.FunctionCall | undefined =
      undefined;
    let role: ChatCompletionRole = "assistant";
    for await (const chunk of await this.client.chat.completions.create({
      model: chatModel,
      messages: contextMessages,
      function_call: "auto",
      functions,
      stream: true,
    })) {
      const delta = chunk.choices?.[0]?.delta;
      if (delta?.content) {
        content += delta.content;
        streamProgress({ type: "message_chunk", message: delta.content });
      } else if (delta?.function_call) {
        functionCall = functionCall ?? {
          name: "",
          arguments: "",
        };
        functionCall.name += delta.function_call.name ?? "";
        functionCall.arguments += delta.function_call.arguments ?? "";
      } else if (chunk.choices?.[0]?.finish_reason === "stop") {
        streamProgress({
          type: "complete",
          reason: chunk.choices[0].finish_reason,
          content,
        });
      } else if (chunk.choices?.[0]?.finish_reason === "function_call") {
        streamProgress({
          type: "function_call",
          functionCall,
        });
      }
      if (delta?.role) {
        role = delta.role;
      }
    }

    return {
      content,
      role: role,
      function_call: functionCall,
    };
  }

  private async evalFunction(
    functionCall: OpenAI.Chat.Completions.ChatCompletionMessage.FunctionCall
  ): Promise<string> {
    const args = JSON.parse(functionCall.arguments ?? "{}") as any;
    console.log("args: " + JSON.stringify(args));
    switch (functionCall.name) {
      case "lookup_game_rules":
        if (args.activity.toLowerCase().includes("monopoly")) {
          throw new Error("Come on. Nobody likes monopoly");
        }
        const activity = await this.vectorDbService.queryActivity(
          args.activity
        );
        return activity.description;
      default:
        return "You cannot perform the next action to complete the user's request. Please let them know and politely ask if there's anything else you can help with";
    }
  }
}
