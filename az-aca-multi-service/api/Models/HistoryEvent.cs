namespace TodoApi.Models;

public record HistoryEvent(
    string Id,
    HistoryEventType Type,
    DateTime OccurredAt,
    string Summary
);
