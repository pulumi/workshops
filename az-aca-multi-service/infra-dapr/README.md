# Dapr Pub/Sub Infrastructure

This infrastructure demonstrates using Dapr for pub/sub messaging to receive webhook events when the backend is private.

## What's Different from infra-native

- **Backend**: Has Dapr enabled (for pub/sub subscriptions)
- **Frontend**: No Dapr (uses native service discovery)
- **Service Bus**: Added for webhook event buffering
- **Dapr Component**: Connects Service Bus to backend

## Use Case

Receive webhook events from external systems (GitHub, Slack, Monday.com) when backend has no public endpoint:

```
External Webhooks → Azure Service Bus → Dapr Pub/Sub → Backend
```

## When to Use This

Use Dapr pub/sub when you need:
- Message broker abstraction (swap Service Bus for Kafka without code changes)
- Event buffering (webhooks queued if backend is down)
- Multi-cloud portability
- Dead letter queue for failed events

## Deployment

This is NOT deployed in the main workshop. It's shown in Part 7 as an example of when Dapr adds value.

If you want to deploy it:

```bash
cd infra-dapr
pulumi stack init dapr
pulumi config set azure-native:location westus2
pulumi up
```

## Backend Code

Backend would need these endpoints (not included in current backend):

```csharp
// Subscribe to Dapr pub/sub
app.MapGet("/dapr/subscribe", () => new[]
{
    new {
        pubsubname = "pubsub",
        topic = "external-tasks",
        route = "/events/tasks"
    }
});

// Receive webhook events
app.MapPost("/events/tasks", async (TaskEvent evt, BoardService board) =>
{
    var item = new Item(
        Id: Guid.NewGuid().ToString(),
        Title: evt.Title,
        Source: new Source(evt.SourceType, evt.ExternalId, evt.DisplayName),
        Status: Status.Inbox,
        CreatedAt: DateTime.UtcNow
    );

    await board.AddItemAsync(item);
    return Results.Ok();
});

public record TaskEvent(
    string Title,
    string SourceType,  // "github", "slack", "monday"
    string ExternalId,
    string DisplayName
);
```

## Testing

After deployment, publish a test event to Service Bus:

```bash
# Get Service Bus connection string
CONNECTION_STRING=$(pulumi stack output serviceBusConnectionString_out)

# Send test event (requires Azure CLI with Service Bus extension)
az servicebus topic message send \
  --namespace-name $(pulumi stack output serviceBusNamespace_out) \
  --topic-name external-tasks \
  --body '{
    "title": "Test task from webhook",
    "sourceType": "github",
    "externalId": "GH-123",
    "displayName": "github.com/user/repo#123"
  }'
```

Backend should receive the event via Dapr pub/sub and create a new todo item.

## Architecture

```
┌─────────────┐
│   GitHub    │
│   Webhook   │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ Azure Service Bus   │
│  (external-tasks)   │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Dapr Pub/Sub        │
│   Component         │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Backend Container   │
│  (Internal Only)    │
│ /events/tasks       │
└─────────────────────┘
```

## Key Differences from Native Approach

### Frontend
- **Native**: No Dapr, calls backend directly via internal FQDN
- **Dapr**: Same as native (no Dapr needed for simple HTTP calls)

### Backend
- **Native**: No Dapr, uses native resiliency policies
- **Dapr**: Has Dapr enabled for pub/sub subscriptions

### Why Backend Needs Dapr
The backend needs Dapr to subscribe to Service Bus topics without writing Service Bus-specific code. The Dapr pub/sub component abstracts the message broker, making it portable across different providers.
