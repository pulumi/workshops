namespace TodoApi.Models;

public record Board(
    Status[] Columns,
    Item[] Items
);
