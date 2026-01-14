namespace TodoApi.Services;

public interface IStorageService
{
    Task<string> ReadBoardStateAsync();
    Task WriteBoardStateAsync(string jsonContent);
    Task<string> ReadInitialBoardStateAsync();
}
