using TodoApi.Models;

namespace TodoApi.Services;

public interface IBoardService
{
    Task<Board> GetBoardAsync();
    Task<ItemWithHistory?> GetItemAsync(string id);
    Task<Item?> SetStatusAsync(string itemId, Status to);
    Task<Item?> SnoozeItemAsync(string itemId, DateTime until);
    Task<string> CreateItemAsync(WebhookPayload payload);
    Task<Board> ResetBoardAsync();
}
