namespace TodoApi.Models;

public record SetStatusRequest(Status Status);

public record SnoozeRequest(DateTime Until);

public record WebhookPayload(
    string Title,
    SourceType SourceType,
    string ExternalId,
    Status? Status = null
);

public record NotificationRequest(
    string Message,
    string ItemTitle,
    string ItemPriority,
    string ItemSource,
    string Timestamp
);
