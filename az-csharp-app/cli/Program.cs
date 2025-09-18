using OpenAI;
using OpenAI.Chat;

class Program
{
    static async Task Main(string[] args)
    {
        Console.WriteLine("Dad Joke CLI");
        Console.WriteLine("============");

        var openAiApiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY");

        if (string.IsNullOrEmpty(openAiApiKey))
        {
            Console.WriteLine("Error: Please set OPENAI_API_KEY environment variable.");
            return;
        }

        var client = new OpenAIClient(openAiApiKey);

        string? keywords = args.Length > 0 ? string.Join(" ", args) : null;

        try
        {
            var joke = await GenerateJoke(client, keywords);
            Console.WriteLine();
            Console.WriteLine(joke);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error generating joke: {ex.Message}");
        }
    }

    static async Task<string> GenerateJoke(OpenAIClient client, string? keywords)
    {
        var prompt = string.IsNullOrEmpty(keywords)
            ? "Generate a clean, family-friendly joke. Just return the joke, nothing else."
            : $"Generate a clean, family-friendly joke about {keywords}. Just return the joke, nothing else.";

        var chatClient = client.GetChatClient("gpt-4o-mini");

        var response = await chatClient.CompleteChatAsync(
            [ChatMessage.CreateUserMessage(prompt)],
            new ChatCompletionOptions
            {
                MaxOutputTokenCount = 100,
                Temperature = 0.9f
            });

        var joke = response.Value.Content[0].Text?.Trim() ?? "";

        if (string.IsNullOrEmpty(joke))
        {
            throw new InvalidOperationException("AI service returned empty response");
        }

        return joke;
    }
}