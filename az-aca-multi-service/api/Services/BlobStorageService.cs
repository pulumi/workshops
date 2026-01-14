using Azure.Storage.Blobs;
using Azure.Identity;
using System.Text;

namespace TodoApi.Services;

public class BlobStorageService : IStorageService
{
    private readonly BlobContainerClient _containerClient;
    private readonly ILogger<BlobStorageService> _logger;
    private const string BoardBlobName = "board.json";
    private const string InitialBoardBlobName = "initial-board.json";

    public BlobStorageService(IConfiguration config, ILogger<BlobStorageService> logger)
    {
        _logger = logger;

        var storageAccountName = config["Azure:StorageAccountName"]
            ?? throw new InvalidOperationException("Azure:StorageAccountName configuration is required");

        var containerName = config["Azure:BlobContainerName"] ?? "board-state";

        var useManagedIdentity = config.GetValue<bool>("Azure:UseManagedIdentity", true);

        var blobServiceUri = new Uri($"https://{storageAccountName}.blob.core.windows.net");

        BlobServiceClient blobServiceClient;
        if (useManagedIdentity)
        {
            _logger.LogInformation("Using MANAGED IDENTITY for blob storage authentication");
            blobServiceClient = new BlobServiceClient(blobServiceUri, new DefaultAzureCredential());
        }
        else
        {
            var connectionString = config["Azure:StorageConnectionString"]
                ?? throw new InvalidOperationException("Azure:StorageConnectionString is required when not using managed identity");
            _logger.LogInformation("Using CONNECTION STRING for blob storage authentication");
            blobServiceClient = new BlobServiceClient(connectionString);
        }

        _containerClient = blobServiceClient.GetBlobContainerClient(containerName);
        _logger.LogInformation("Using BLOB storage: {Uri}/{Container}", blobServiceUri, containerName);
    }

    public async Task<string> ReadBoardStateAsync()
    {
        var blobClient = _containerClient.GetBlobClient(BoardBlobName);

        if (!await blobClient.ExistsAsync())
        {
            _logger.LogWarning("Board blob not found, initializing from initial-board.json");
            // Initialize from initial-board blob
            var initialContent = await ReadInitialBoardStateAsync();
            await WriteBoardStateAsync(initialContent);
            return initialContent;
        }

        var response = await blobClient.DownloadContentAsync();
        return response.Value.Content.ToString();
    }

    public async Task WriteBoardStateAsync(string jsonContent)
    {
        var blobClient = _containerClient.GetBlobClient(BoardBlobName);
        var bytes = Encoding.UTF8.GetBytes(jsonContent);

        using var stream = new MemoryStream(bytes);
        await blobClient.UploadAsync(stream, overwrite: true);

        _logger.LogDebug("Board state written to blob storage ({Bytes} bytes)", bytes.Length);
    }

    public async Task<string> ReadInitialBoardStateAsync()
    {
        var blobClient = _containerClient.GetBlobClient(InitialBoardBlobName);

        if (!await blobClient.ExistsAsync())
        {
            throw new FileNotFoundException($"Initial board blob '{InitialBoardBlobName}' not found in container");
        }

        var response = await blobClient.DownloadContentAsync();
        return response.Value.Content.ToString();
    }
}
