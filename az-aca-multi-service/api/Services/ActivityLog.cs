namespace TodoApi.Services;

public record ActivityEntry(
    DateTime Timestamp,
    string Method,
    string Path,
    string Summary,
    int? StatusCode = null
);

public class ActivityLog
{
    private readonly List<ActivityEntry> _entries = new();
    private readonly object _lock = new();
    private const int MaxEntries = 100;

    public void Log(string method, string path, string summary, int? statusCode = null)
    {
        lock (_lock)
        {
            _entries.Add(new ActivityEntry(DateTime.UtcNow, method, path, summary, statusCode));

            // Keep only the last N entries
            if (_entries.Count > MaxEntries)
            {
                _entries.RemoveAt(0);
            }
        }
    }

    public ActivityEntry[] GetEntries(int? limit = null)
    {
        lock (_lock)
        {
            var entries = _entries.AsEnumerable().Reverse();
            if (limit.HasValue)
            {
                entries = entries.Take(limit.Value);
            }
            return entries.ToArray();
        }
    }

    public void Clear()
    {
        lock (_lock)
        {
            _entries.Clear();
        }
    }
}
