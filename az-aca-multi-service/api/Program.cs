using System.Text.Json;
using System.Text.Json.Serialization;
using TodoApi.Models;
using TodoApi.Services;

var builder = WebApplication.CreateBuilder(args);

// Configure JSON serialization
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
    options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
});

// Configure CORS - reads from CORS_ORIGINS env var (set by Pulumi ESC)
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        var origins = Environment.GetEnvironmentVariable("CORS_ORIGINS")?.Split(',')
            ?? builder.Configuration["Cors:Origins"]?.Split(',')
            ?? new[] { "http://localhost:5173" };
        policy.WithOrigins(origins)
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Register services
// Storage service registration - choose implementation based on configuration
var useAzureStorage = builder.Configuration.GetValue<bool>("Azure:UseStorage", false);
if (useAzureStorage)
{
    builder.Services.AddSingleton<IStorageService, BlobStorageService>();
}
else
{
    builder.Services.AddSingleton<IStorageService, FileStorageService>();
}

builder.Services.AddSingleton<IBoardService, BoardService>();
builder.Services.AddSingleton<ActivityLog>();

// Add Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Todo Board API", Version = "v1" });
});

var app = builder.Build();

// Failure simulation middleware for demo purposes
var failureRate = builder.Configuration.GetValue<double>("FailureRate", 0.0);
if (failureRate > 0)
{
    app.Use(async (context, next) =>
    {
        // Only simulate failures for /api/* endpoints (not health checks or swagger)
        if (context.Request.Path.StartsWithSegments("/api") &&
            !context.Request.Path.StartsWithSegments("/api/logs"))
        {
            var random = Random.Shared.NextDouble();
            if (random < failureRate)
            {
                var log = context.RequestServices.GetRequiredService<ActivityLog>();
                log.Log(context.Request.Method, context.Request.Path,
                    "SIMULATED FAILURE (will retry via Dapr)", 500);

                context.Response.StatusCode = 500;
                await context.Response.WriteAsJsonAsync(new
                {
                    error = "Simulated failure",
                    message = $"Random failure simulation (rate: {failureRate:P0})"
                });
                return;
            }
        }
        await next();
    });

    app.Logger.LogWarning("⚠️  Failure simulation enabled: {FailureRate:P0} of API requests will fail", failureRate);
}

app.UseCors();
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Todo Board API v1");
    c.RoutePrefix = "swagger";
});

// GET /api/board - Get full board state
app.MapGet("/api/board", async (IBoardService service, ActivityLog log) =>
{
    var board = await service.GetBoardAsync();
    log.Log("GET", "/api/board", $"Returned {board.Items.Length} items", 200);
    return Results.Ok(board);
})
.WithName("GetBoard")
.WithTags("Board")
.WithDescription("Get the full board state including all items");

// GET /api/items/{id} - Get single item with history
app.MapGet("/api/items/{id}", async (string id, IBoardService service, ActivityLog log) =>
{
    var result = await service.GetItemAsync(id);
    if (result is not null)
    {
        log.Log("GET", $"/api/items/{id}", $"Returned item: {result.Item.Title}", 200);
        return Results.Ok(result);
    }
    log.Log("GET", $"/api/items/{id}", "Item not found", 404);
    return Results.NotFound();
})
.WithName("GetItem")
.WithTags("Items")
.WithDescription("Get a single item with its history");

// POST /api/items - Create new item (webhook simulation)
app.MapPost("/api/items", async (WebhookPayload payload, IBoardService service, ActivityLog log) =>
{
    var itemId = await service.CreateItemAsync(payload);
    log.Log("POST", "/api/items", $"Created item '{payload.Title}' ({itemId})", 200);
    return Results.Ok(new CreateItemResponse(itemId));
})
.WithName("CreateItem")
.WithTags("Items")
.WithDescription("Create a new item (simulates webhook from external system)");

// POST /api/items/{id}/status - Update item status
app.MapPost("/api/items/{id}/status", async (string id, SetStatusRequest request, IBoardService service, ActivityLog log) =>
{
    var item = await service.SetStatusAsync(id, request.Status);
    if (item is not null)
    {
        log.Log("POST", $"/api/items/{id}/status", $"Changed '{item.Title}' to {request.Status}", 200);
        return Results.Ok(item);
    }
    log.Log("POST", $"/api/items/{id}/status", "Item not found", 404);
    return Results.NotFound();
})
.WithName("UpdateItemStatus")
.WithTags("Items")
.WithDescription("Update an item's status (inbox, doing, blocked, done, snoozed)");

// POST /api/items/{id}/snooze - Snooze item
app.MapPost("/api/items/{id}/snooze", async (string id, SnoozeRequest request, IBoardService service, ActivityLog log) =>
{
    var item = await service.SnoozeItemAsync(id, request.Until);
    if (item is not null)
    {
        log.Log("POST", $"/api/items/{id}/snooze", $"Snoozed '{item.Title}' until {request.Until:yyyy-MM-dd}", 200);
        return Results.Ok(item);
    }
    log.Log("POST", $"/api/items/{id}/snooze", "Item not found", 404);
    return Results.NotFound();
})
.WithName("SnoozeItem")
.WithTags("Items")
.WithDescription("Snooze an item until a specified date");

// POST /api/items/{id}/notify-team - Send notification about an item
// ⚠️ DANGEROUS: This endpoint should NOT be publicly exposed!
// It simulates sending notifications (email/Slack) to team members.
// Without protection, this could be spammed to flood team communications.
app.MapPost("/api/items/{id}/notify-team", async (string id, NotificationRequest request, IBoardService service, ActivityLog log, ILogger<Program> logger) =>
{
    var itemResult = await service.GetItemAsync(id);
    if (itemResult is null)
    {
        log.Log("POST", $"/api/items/{id}/notify-team", "Item not found", 404);
        return Results.NotFound();
    }

    // Simulate sending notifications to team members
    // In a real app, this would send emails/Slack messages
    var teamMembers = new[] { "alice@example.com", "bob@example.com", "charlie@example.com" };

    foreach (var member in teamMembers)
    {
        logger.LogInformation(
            "📧 [SIMULATED] Sending notification to {Member}: '{Message}' about item '{ItemTitle}' (Priority: {Priority}, Source: {Source})",
            member, request.Message, request.ItemTitle, request.ItemPriority, request.ItemSource
        );

        // In production: await emailService.SendAsync(member, ...);
        // In production: await slackService.PostAsync(channel, ...);
    }

    var responseMessage = $"Notified {teamMembers.Length} team members about '{request.ItemTitle}'";
    log.Log("POST", $"/api/items/{id}/notify-team", responseMessage, 200);

    return Results.Ok(new NotificationResponse(
        Success: true,
        Message: responseMessage,
        NotificationsSent: teamMembers.Length
    ));
})
.WithName("NotifyTeam")
.WithTags("Notifications")
.WithDescription("⚠️ PROTECTED: Send notifications to team members (should only be called via BFF)");

// POST /api/board/reset - Reset to initial state
app.MapPost("/api/board/reset", async (IBoardService service, ActivityLog log) =>
{
    var board = await service.ResetBoardAsync();
    log.Log("POST", "/api/board/reset", $"Board reset to initial state ({board.Items.Length} items)", 200);
    return Results.Ok(board);
})
.WithName("ResetBoard")
.WithTags("Board")
.WithDescription("Reset the board to its initial demo state");

// GET /api/logs - Get activity log (for demo visibility)
app.MapGet("/api/logs", (ActivityLog log, int? limit) =>
{
    var entries = log.GetEntries(limit ?? 50);
    return Results.Ok(new
    {
        count = entries.Length,
        entries = entries.Select(e => new
        {
            timestamp = e.Timestamp.ToString("HH:mm:ss.fff"),
            method = e.Method,
            path = e.Path,
            summary = e.Summary,
            status = e.StatusCode
        })
    });
})
.WithName("GetLogs")
.WithTags("Logs")
.WithDescription("Get recent API activity logs for demo visibility");

// DELETE /api/logs - Clear activity log
app.MapDelete("/api/logs", (ActivityLog log) =>
{
    log.Clear();
    return Results.Ok(new { message = "Activity log cleared" });
})
.WithName("ClearLogs")
.WithTags("Logs")
.WithDescription("Clear all activity logs");

// Health check endpoint
app.MapGet("/health", (ActivityLog log) =>
{
    log.Log("GET", "/health", "Health check", 200);
    return Results.Ok(new { status = "healthy" });
})
.WithName("HealthCheck")
.WithTags("Health")
.WithDescription("Check API health status");

app.Run();

// Make Program accessible for integration tests
public partial class Program { }
