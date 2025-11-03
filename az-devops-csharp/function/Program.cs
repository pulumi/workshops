using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Azure.Functions.Worker;
using Azure.AI.OpenAI;
using Azure;

var host = new HostBuilder()
    .ConfigureFunctionsWorkerDefaults()
    .ConfigureServices(services =>
    {
        // Add Azure OpenAI client
        var openAiEndpoint = Environment.GetEnvironmentVariable("AZURE_OPENAI_ENDPOINT");
        var openAiApiKey = Environment.GetEnvironmentVariable("AZURE_OPENAI_API_KEY");

        if (!string.IsNullOrEmpty(openAiEndpoint) && !string.IsNullOrEmpty(openAiApiKey))
        {
            services.AddSingleton(new OpenAIClient(new Uri(openAiEndpoint), new Azure.AzureKeyCredential(openAiApiKey)));
        }
    })
    .Build();

host.Run();