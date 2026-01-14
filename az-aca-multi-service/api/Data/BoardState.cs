using TodoApi.Models;

namespace TodoApi.Data;

public class BoardState
{
    public List<Item> Items { get; set; } = new();
    public Dictionary<string, List<HistoryEvent>> History { get; set; } = new();
    public int NextItemId { get; set; } = 11;
    public int NextHistoryId { get; set; } = 100;
    public int Version { get; set; } = 1;
    public DateTime LastModified { get; set; } = DateTime.UtcNow;
}
