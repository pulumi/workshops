using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc.Testing;
using TodoApi.Models;

namespace TodoApi.Tests;

public class ApiIntegrationTests : IClassFixture<WebApplicationFactory<Program>>, IDisposable
{
    private readonly HttpClient _client;
    private readonly WebApplicationFactory<Program> _factory;
    private readonly JsonSerializerOptions _jsonOptions;

    public ApiIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) }
        };
    }

    public void Dispose()
    {
        _client.Dispose();
    }

    [Fact]
    public async Task HealthCheck_ReturnsHealthy()
    {
        // Act
        var response = await _client.GetAsync("/health");

        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("healthy", content);
    }

    [Fact]
    public async Task GetBoard_ReturnsInitialData()
    {
        // Arrange - Reset to known state first
        await _client.PostAsync("/api/board/reset", null);

        // Act
        var response = await _client.GetAsync("/api/board");

        // Assert
        response.EnsureSuccessStatusCode();
        var board = await response.Content.ReadFromJsonAsync<Board>(_jsonOptions);

        Assert.NotNull(board);
        Assert.Equal(5, board.Columns.Length); // inbox, doing, blocked, done, snoozed
        Assert.Equal(10, board.Items.Length); // 10 initial items
        Assert.Contains(board.Items, i => i.Title == "Setup OIDC integration");
        Assert.Contains(board.Items, i => i.Title == "Fix login timeout bug");
    }

    [Fact]
    public async Task GetBoard_ReturnsCorrectColumns()
    {
        // Act
        var response = await _client.GetAsync("/api/board");
        var board = await response.Content.ReadFromJsonAsync<Board>(_jsonOptions);

        // Assert
        Assert.NotNull(board);
        Assert.Equal(Status.Inbox, board.Columns[0]);
        Assert.Equal(Status.Doing, board.Columns[1]);
        Assert.Equal(Status.Blocked, board.Columns[2]);
        Assert.Equal(Status.Done, board.Columns[3]);
        Assert.Equal(Status.Snoozed, board.Columns[4]);
    }

    [Fact]
    public async Task GetItem_ReturnsItemWithHistory()
    {
        // Arrange - Reset first
        await _client.PostAsync("/api/board/reset", null);

        // Act
        var response = await _client.GetAsync("/api/items/item_001");

        // Assert
        response.EnsureSuccessStatusCode();
        var result = await response.Content.ReadFromJsonAsync<ItemWithHistory>(_jsonOptions);

        Assert.NotNull(result);
        Assert.Equal("item_001", result.Item.Id);
        Assert.Equal("Setup OIDC integration", result.Item.Title);
        Assert.NotEmpty(result.History);
    }

    [Fact]
    public async Task GetItem_NotFound_Returns404()
    {
        // Act
        var response = await _client.GetAsync("/api/items/nonexistent_item");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task SetStatus_UpdatesItemStatus()
    {
        // Arrange - Reset first
        await _client.PostAsync("/api/board/reset", null);
        var request = new SetStatusRequest(Status.Doing);

        // Act
        var response = await _client.PostAsJsonAsync("/api/items/item_001/status", request, _jsonOptions);

        // Assert
        response.EnsureSuccessStatusCode();
        var item = await response.Content.ReadFromJsonAsync<Item>(_jsonOptions);

        Assert.NotNull(item);
        Assert.Equal("item_001", item.Id);
        Assert.Equal(Status.Doing, item.Status);

        // Verify it persisted
        var boardResponse = await _client.GetAsync("/api/board");
        var board = await boardResponse.Content.ReadFromJsonAsync<Board>(_jsonOptions);
        var updatedItem = board!.Items.First(i => i.Id == "item_001");
        Assert.Equal(Status.Doing, updatedItem.Status);
    }

    [Fact]
    public async Task SetStatus_NotFound_Returns404()
    {
        // Arrange
        var request = new SetStatusRequest(Status.Done);

        // Act
        var response = await _client.PostAsJsonAsync("/api/items/nonexistent/status", request, _jsonOptions);

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task SnoozeItem_SetsStatusToSnoozedWithDate()
    {
        // Arrange - Reset first
        await _client.PostAsync("/api/board/reset", null);
        var snoozeDate = DateTime.UtcNow.AddDays(3);
        var request = new SnoozeRequest(snoozeDate);

        // Act
        var response = await _client.PostAsJsonAsync("/api/items/item_001/snooze", request, _jsonOptions);

        // Assert
        response.EnsureSuccessStatusCode();
        var item = await response.Content.ReadFromJsonAsync<Item>(_jsonOptions);

        Assert.NotNull(item);
        Assert.Equal(Status.Snoozed, item.Status);
        Assert.NotNull(item.SnoozeUntil);
    }

    [Fact]
    public async Task CreateItem_AddsNewItemToBoard()
    {
        // Arrange - Reset first
        await _client.PostAsync("/api/board/reset", null);
        var payload = new WebhookPayload(
            "New test item from webhook",
            SourceType.Github,
            "test-repo#999"
        );

        // Act
        var response = await _client.PostAsJsonAsync("/api/items", payload, _jsonOptions);

        // Assert
        response.EnsureSuccessStatusCode();
        var result = await response.Content.ReadFromJsonAsync<CreateItemResponse>(_jsonOptions);
        Assert.NotNull(result);
        Assert.StartsWith("item_", result.ItemId);

        // Verify it was added
        var boardResponse = await _client.GetAsync("/api/board");
        var board = await boardResponse.Content.ReadFromJsonAsync<Board>(_jsonOptions);
        Assert.Contains(board!.Items, i => i.Title == "New test item from webhook");
    }

    [Fact]
    public async Task CreateItem_DefaultsToInboxStatus()
    {
        // Arrange - Reset first
        await _client.PostAsync("/api/board/reset", null);
        var payload = new WebhookPayload(
            "Another test item",
            SourceType.Jira,
            "TEST-123"
        );

        // Act
        var response = await _client.PostAsJsonAsync("/api/items", payload, _jsonOptions);
        var result = await response.Content.ReadFromJsonAsync<CreateItemResponse>(_jsonOptions);

        // Verify status
        var itemResponse = await _client.GetAsync($"/api/items/{result!.ItemId}");
        var itemWithHistory = await itemResponse.Content.ReadFromJsonAsync<ItemWithHistory>(_jsonOptions);

        Assert.Equal(Status.Inbox, itemWithHistory!.Item.Status);
    }

    [Fact]
    public async Task ExecuteCommand_MovesToBlocked()
    {
        // Arrange - Reset first
        await _client.PostAsync("/api/board/reset", null);
        var request = new CommandRequest(
            "move OIDC to blocked",
            null,
            new[] { "item_001", "item_002", "item_003" }
        );

        // Act
        var response = await _client.PostAsJsonAsync("/api/command", request, _jsonOptions);

        // Assert
        response.EnsureSuccessStatusCode();
        var result = await response.Content.ReadFromJsonAsync<CommandResponse>(_jsonOptions);

        Assert.NotNull(result);
        Assert.Contains("Blocked", result.AssistantMessage);
        Assert.Single(result.Actions);
        Assert.Equal("set_status", result.Actions[0].Type);
        Assert.Equal("item_001", result.Actions[0].ItemId);
        Assert.Equal(Status.Blocked, result.Actions[0].To);

        // Verify the board was updated
        var item = result.Board.Items.First(i => i.Id == "item_001");
        Assert.Equal(Status.Blocked, item.Status);
    }

    [Fact]
    public async Task ExecuteCommand_MarkAsDone()
    {
        // Arrange - Reset first
        await _client.PostAsync("/api/board/reset", null);
        var request = new CommandRequest(
            "mark login as done",
            null,
            new[] { "item_001", "item_002", "item_003" }
        );

        // Act
        var response = await _client.PostAsJsonAsync("/api/command", request, _jsonOptions);
        var result = await response.Content.ReadFromJsonAsync<CommandResponse>(_jsonOptions);

        // Assert
        Assert.NotNull(result);
        Assert.Single(result.Actions);
        Assert.Equal(Status.Done, result.Actions[0].To);
    }

    [Fact]
    public async Task ExecuteCommand_Snooze()
    {
        // Arrange - Reset first
        await _client.PostAsync("/api/board/reset", null);
        var request = new CommandRequest(
            "snooze OIDC",
            null,
            new[] { "item_001", "item_002" }
        );

        // Act
        var response = await _client.PostAsJsonAsync("/api/command", request, _jsonOptions);
        var result = await response.Content.ReadFromJsonAsync<CommandResponse>(_jsonOptions);

        // Assert
        Assert.NotNull(result);
        Assert.Single(result.Actions);
        Assert.Equal("snooze", result.Actions[0].Type);

        var item = result.Board.Items.First(i => i.Id == "item_001");
        Assert.Equal(Status.Snoozed, item.Status);
        Assert.NotNull(item.SnoozeUntil);
    }

    [Fact]
    public async Task ExecuteCommand_UsesSelectedItem()
    {
        // Arrange - Reset first
        await _client.PostAsync("/api/board/reset", null);
        var request = new CommandRequest(
            "move to done",
            "item_002", // Selected item
            new[] { "item_001", "item_002", "item_003" }
        );

        // Act
        var response = await _client.PostAsJsonAsync("/api/command", request, _jsonOptions);
        var result = await response.Content.ReadFromJsonAsync<CommandResponse>(_jsonOptions);

        // Assert - Should act on selected item_002
        Assert.NotNull(result);
        Assert.Single(result.Actions);
        Assert.Equal("item_002", result.Actions[0].ItemId);
    }

    [Fact]
    public async Task ResetBoard_RestoresToInitialState()
    {
        // Arrange - Make some changes
        await _client.PostAsJsonAsync("/api/items/item_001/status", new SetStatusRequest(Status.Done), _jsonOptions);
        await _client.PostAsJsonAsync("/api/items", new WebhookPayload("Extra item", SourceType.Custom, "EXTRA-1"), _jsonOptions);

        // Verify changes were made
        var boardBefore = await (await _client.GetAsync("/api/board")).Content.ReadFromJsonAsync<Board>(_jsonOptions);
        Assert.True(boardBefore!.Items.Length > 10 || boardBefore.Items.First(i => i.Id == "item_001").Status == Status.Done);

        // Act
        var response = await _client.PostAsync("/api/board/reset", null);

        // Assert
        response.EnsureSuccessStatusCode();
        var board = await response.Content.ReadFromJsonAsync<Board>(_jsonOptions);

        Assert.NotNull(board);
        Assert.Equal(10, board.Items.Length); // Back to 10 items
        var item001 = board.Items.First(i => i.Id == "item_001");
        Assert.Equal(Status.Inbox, item001.Status); // Back to inbox
    }

    [Fact]
    public async Task FullWorkflow_CreateMoveComplete()
    {
        // This is a chunky end-to-end test

        // 1. Reset to clean state
        await _client.PostAsync("/api/board/reset", null);

        // 2. Create a new item
        var createPayload = new WebhookPayload(
            "Implement user authentication",
            SourceType.Github,
            "auth-service#200"
        );
        var createResponse = await _client.PostAsJsonAsync("/api/items", createPayload, _jsonOptions);
        var createResult = await createResponse.Content.ReadFromJsonAsync<CreateItemResponse>(_jsonOptions);
        var newItemId = createResult!.ItemId;

        // Verify item was created in inbox
        var itemResponse = await _client.GetAsync($"/api/items/{newItemId}");
        var itemData = await itemResponse.Content.ReadFromJsonAsync<ItemWithHistory>(_jsonOptions);
        Assert.Equal(Status.Inbox, itemData!.Item.Status);
        Assert.Single(itemData.History); // Should have ItemCreated event

        // 3. Move to doing
        await _client.PostAsJsonAsync($"/api/items/{newItemId}/status", new SetStatusRequest(Status.Doing), _jsonOptions);

        // Verify status changed
        itemResponse = await _client.GetAsync($"/api/items/{newItemId}");
        itemData = await itemResponse.Content.ReadFromJsonAsync<ItemWithHistory>(_jsonOptions);
        Assert.Equal(Status.Doing, itemData!.Item.Status);
        Assert.Equal(2, itemData.History.Length); // ItemCreated + StatusChanged

        // 4. Move to blocked via chat command
        var commandRequest = new CommandRequest(
            "move authentication to blocked",
            null,
            new[] { newItemId }
        );
        await _client.PostAsJsonAsync("/api/command", commandRequest, _jsonOptions);

        itemResponse = await _client.GetAsync($"/api/items/{newItemId}");
        itemData = await itemResponse.Content.ReadFromJsonAsync<ItemWithHistory>(_jsonOptions);
        Assert.Equal(Status.Blocked, itemData!.Item.Status);

        // 5. Complete it
        await _client.PostAsJsonAsync($"/api/items/{newItemId}/status", new SetStatusRequest(Status.Done), _jsonOptions);

        itemResponse = await _client.GetAsync($"/api/items/{newItemId}");
        itemData = await itemResponse.Content.ReadFromJsonAsync<ItemWithHistory>(_jsonOptions);
        Assert.Equal(Status.Done, itemData!.Item.Status);

        // 6. Reset and verify item is gone
        await _client.PostAsync("/api/board/reset", null);
        var boardResponse = await _client.GetAsync("/api/board");
        var board = await boardResponse.Content.ReadFromJsonAsync<Board>(_jsonOptions);
        Assert.DoesNotContain(board!.Items, i => i.Id == newItemId);
    }
}
