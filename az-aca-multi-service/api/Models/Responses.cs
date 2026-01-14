namespace TodoApi.Models;

public record ItemWithHistory(
    Item Item,
    HistoryEvent[] History
);

public record CreateItemResponse(string ItemId);

public record NotificationResponse(
    bool Success,
    string Message,
    int NotificationsSent
);
