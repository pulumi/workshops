namespace TodoApi.Models;

public enum Status
{
    Inbox,
    Doing,
    Blocked,
    Done,
    Snoozed
}

public enum SourceType
{
    Github,
    Jira,
    Custom
}

public enum HistoryEventType
{
    ItemCreated,
    StatusChanged,
    Snoozed,
    SourceUpdated,
    NoteAdded
}
