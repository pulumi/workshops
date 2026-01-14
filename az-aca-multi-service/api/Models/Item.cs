namespace TodoApi.Models;

public record Source(
    SourceType Type,
    string ExternalId,
    string Display
);

public record Item(
    string Id,
    string Title,
    Status Status,
    Source Source,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    DateTime? SnoozeUntil = null,
    string[]? Tags = null
);
