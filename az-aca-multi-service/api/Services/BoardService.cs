using System.Text.Json;
using System.Text.Json.Serialization;
using TodoApi.Data;
using TodoApi.Models;

namespace TodoApi.Services;

public class BoardService : IBoardService
{
    private readonly SemaphoreSlim _lock = new(1, 1);
    private readonly IStorageService _storageService;
    private readonly JsonSerializerOptions _jsonOptions;

    private static readonly Status[] AllColumns = { Status.Inbox, Status.Doing, Status.Blocked, Status.Done, Status.Snoozed };

    public BoardService(IStorageService storageService)
    {
        _storageService = storageService;

        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = true,
            Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) }
        };
    }

    public async Task<Board> GetBoardAsync()
    {
        var state = await ReadStateAsync();
        return new Board(AllColumns, state.Items.ToArray());
    }

    public async Task<ItemWithHistory?> GetItemAsync(string id)
    {
        var state = await ReadStateAsync();
        var item = state.Items.FirstOrDefault(i => i.Id == id);
        if (item == null) return null;

        var history = state.History.TryGetValue(id, out var h) ? h.ToArray() : Array.Empty<HistoryEvent>();
        return new ItemWithHistory(item, history);
    }

    public async Task<Item?> SetStatusAsync(string itemId, Status to)
    {
        await _lock.WaitAsync();
        try
        {
            var state = await ReadStateInternalAsync();
            var itemIndex = state.Items.FindIndex(i => i.Id == itemId);
            if (itemIndex < 0) return null;

            var item = state.Items[itemIndex];
            var oldStatus = item.Status;

            // Create updated item
            var updatedItem = item with
            {
                Status = to,
                UpdatedAt = DateTime.UtcNow,
                SnoozeUntil = to != Status.Snoozed ? null : item.SnoozeUntil
            };
            state.Items[itemIndex] = updatedItem;

            // Add history event
            AddHistoryEvent(state, itemId, new HistoryEvent(
                $"h_{state.NextHistoryId++}",
                HistoryEventType.StatusChanged,
                DateTime.UtcNow,
                $"Status changed from {oldStatus.ToString().ToLower()} to {to.ToString().ToLower()}"
            ));

            state.LastModified = DateTime.UtcNow;
            await WriteStateInternalAsync(state);

            return updatedItem;
        }
        finally
        {
            _lock.Release();
        }
    }

    public async Task<Item?> SnoozeItemAsync(string itemId, DateTime until)
    {
        await _lock.WaitAsync();
        try
        {
            var state = await ReadStateInternalAsync();
            var itemIndex = state.Items.FindIndex(i => i.Id == itemId);
            if (itemIndex < 0) return null;

            var item = state.Items[itemIndex];

            // Create updated item
            var updatedItem = item with
            {
                Status = Status.Snoozed,
                SnoozeUntil = until,
                UpdatedAt = DateTime.UtcNow
            };
            state.Items[itemIndex] = updatedItem;

            // Add history event
            AddHistoryEvent(state, itemId, new HistoryEvent(
                $"h_{state.NextHistoryId++}",
                HistoryEventType.Snoozed,
                DateTime.UtcNow,
                $"Snoozed until {until:yyyy-MM-dd}"
            ));

            state.LastModified = DateTime.UtcNow;
            await WriteStateInternalAsync(state);

            return updatedItem;
        }
        finally
        {
            _lock.Release();
        }
    }

    public async Task<string> CreateItemAsync(WebhookPayload payload)
    {
        await _lock.WaitAsync();
        try
        {
            var state = await ReadStateInternalAsync();

            var itemId = $"item_{state.NextItemId++:D3}";
            var now = DateTime.UtcNow;

            var newItem = new Item(
                itemId,
                payload.Title,
                payload.Status ?? Status.Inbox,
                new Source(payload.SourceType, payload.ExternalId, payload.ExternalId),
                now,
                now,
                null,
                null
            );

            state.Items.Insert(0, newItem);

            // Add history event
            AddHistoryEvent(state, itemId, new HistoryEvent(
                $"h_{state.NextHistoryId++}",
                HistoryEventType.ItemCreated,
                now,
                $"Item created from {payload.SourceType.ToString().ToLower()} webhook"
            ));

            state.LastModified = now;
            await WriteStateInternalAsync(state);

            return itemId;
        }
        finally
        {
            _lock.Release();
        }
    }

    public async Task<Board> ResetBoardAsync()
    {
        await _lock.WaitAsync();
        try
        {
            // Copy initial-board state to board state
            var initialJson = await _storageService.ReadInitialBoardStateAsync();
            await _storageService.WriteBoardStateAsync(initialJson);

            var state = JsonSerializer.Deserialize<BoardState>(initialJson, _jsonOptions)!;
            return new Board(AllColumns, state.Items.ToArray());
        }
        finally
        {
            _lock.Release();
        }
    }

    private async Task<BoardState> ReadStateAsync()
    {
        await _lock.WaitAsync();
        try
        {
            return await ReadStateInternalAsync();
        }
        finally
        {
            _lock.Release();
        }
    }

    private async Task<BoardState> ReadStateInternalAsync()
    {
        var json = await _storageService.ReadBoardStateAsync();
        return JsonSerializer.Deserialize<BoardState>(json, _jsonOptions) ?? new BoardState();
    }

    private async Task WriteStateInternalAsync(BoardState state)
    {
        var json = JsonSerializer.Serialize(state, _jsonOptions);
        await _storageService.WriteBoardStateAsync(json);
    }

    private void AddHistoryEvent(BoardState state, string itemId, HistoryEvent historyEvent)
    {
        if (!state.History.ContainsKey(itemId))
        {
            state.History[itemId] = new List<HistoryEvent>();
        }
        state.History[itemId].Add(historyEvent);
    }
}
