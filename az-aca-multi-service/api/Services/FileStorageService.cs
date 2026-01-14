namespace TodoApi.Services;

public class FileStorageService : IStorageService
{
    private readonly string _boardPath;
    private readonly string _initialBoardPath;
    private readonly ILogger<FileStorageService> _logger;

    public FileStorageService(IWebHostEnvironment env, ILogger<FileStorageService> logger)
    {
        _logger = logger;
        _boardPath = Path.Combine(env.ContentRootPath, "Data", "board.json");
        _initialBoardPath = Path.Combine(env.ContentRootPath, "Data", "initial-board.json");
        _logger.LogInformation("Using FILE storage: {Path}", _boardPath);
    }

    public async Task<string> ReadBoardStateAsync()
    {
        if (!File.Exists(_boardPath))
        {
            // Initialize from initial-board.json if doesn't exist
            if (File.Exists(_initialBoardPath))
            {
                var initialContent = await File.ReadAllTextAsync(_initialBoardPath);
                await File.WriteAllTextAsync(_boardPath, initialContent);
                return initialContent;
            }
            throw new FileNotFoundException("Board state file not found", _boardPath);
        }

        return await File.ReadAllTextAsync(_boardPath);
    }

    public async Task WriteBoardStateAsync(string jsonContent)
    {
        await File.WriteAllTextAsync(_boardPath, jsonContent);
    }

    public async Task<string> ReadInitialBoardStateAsync()
    {
        if (!File.Exists(_initialBoardPath))
        {
            throw new FileNotFoundException("Initial board state file not found", _initialBoardPath);
        }
        return await File.ReadAllTextAsync(_initialBoardPath);
    }
}
