import { Pinecone } from "@pinecone-database/pinecone";
import { EmbeddingService } from "./ai";
import { assertExists } from "./utils";
import * as fs from 'fs';
import * as path from 'path';

const gamesIndexName = "games";

export interface ActivityMetadata {
  description: string;
  prompt: string;
  name: string;
}

type Activity = {
  name: string;
  description: string;
  prompt: string;
};

export class VectorDbService {

  static async initialize(embeddingService: EmbeddingService) {
    const client = new Pinecone({
      apiKey: assertExists(
        process.env.PINECONE_API_KEY,
        "Expected a pinecone API key"
      )
    });

    const index = client.index(gamesIndexName);

    const filePath = path.join(__dirname, 'activities.json');

    if (index) {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading file:', err);
          return;
        }
        try {
          // Parse the JSON data
          const jsonArray: Activity[] = JSON.parse(data);

          // Check if the parsed data is an array
          if (Array.isArray(jsonArray)) {

            jsonArray.forEach((activity: Activity) => {
              embeddingService.createEmbedding(activity.name).then((embedding) => {
                index.upsert([{
                  "id": activity.name ?? "none",
                  "values": embedding,
                  "metadata": activity
                }]);
              });
            });

            console.log("actities.json has been updated and indexed.");

          } else {
            console.error('The JSON data is not an array.');
          }
        } catch (parseError) {
          console.error('Error parsing JSON:', parseError);
        }

      });
    } else {
      console.error('Index not found');
    }
    return new VectorDbService(client, embeddingService);
  }

  private constructor(
    private pineconeClient: Pinecone,
    private embeddingService: EmbeddingService
  ) { }

  async queryAllActivity(): Promise<string[]> {
    const activityVector = await this.embeddingService.createEmbedding(
      "higher or lower, global thermonuclear war, chess, othello, noughts and crosses, 20 questions"
    );

    const gamesIndex = this.pineconeClient.Index(gamesIndexName);

    const r = await gamesIndex.listPaginated();
    console.log(`listPaginated: ${JSON.stringify(r)}`);

    const resp = await gamesIndex.query({
      topK: 10,
      includeMetadata: true,
      vector: activityVector,
    });

    //return resp.matches?.[0]?.metadata as ActivityMetadata;
    const uniqueNames = resp.matches.map((m) => m.metadata?.name);
    var games: string[] = [];
    uniqueNames.forEach(element => {
      var game = JSON.stringify(element).replace(/\"/g, '');
      if (games.indexOf(game) == -1) {
        games.push(game);
      }
    });
    console.log(`uniqueNames: ${JSON.stringify(games)}`);

    return games;
  }

  async queryActivity(activity: string): Promise<ActivityMetadata> {
    console.log(`Requested activity is ${activity}`);

    const activityVector = await this.embeddingService.createEmbedding(
      activity
    );

    const gamesIndex = this.pineconeClient.Index(gamesIndexName);

    const resp = await gamesIndex.query({
      topK: 3,
      includeMetadata: true,
      vector: activityVector,
    });

    //return resp.matches?.[0]?.metadata as ActivityMetadata;
    const activityResp = resp.matches[0];

    if (activityResp &&
      activityResp.metadata) {
      // Since we passed the ActivityMetadata type parameter above,
      // we can interact with metadata fields without having to
      // do any typecasting.
      const { description, prompt, name } = activityResp.metadata;
      console.log(`The best match in drama was ${name}`);
      return { description, prompt, name } as ActivityMetadata;
    }

    console.log(`No response`);
    return { description: "", prompt: "", name: "" } as ActivityMetadata;
  }
}
