export type ActivityEntry = {
  id: number;
  at: string;
  source: string;
  message: string;
  detail?: Record<string, unknown>;
};

export class ActivityLog {
  private entries: ActivityEntry[] = [];
  private nextId = 1;

  constructor(private readonly capacity = 200) {}

  record(source: string, message: string, detail?: Record<string, unknown>): ActivityEntry {
    const entry: ActivityEntry = {
      id: this.nextId++,
      at: new Date().toISOString(),
      source,
      message,
      detail,
    };
    this.entries.push(entry);
    if (this.entries.length > this.capacity) {
      this.entries.splice(0, this.entries.length - this.capacity);
    }
    return entry;
  }

  list(limit?: number): ActivityEntry[] {
    const slice = limit ? this.entries.slice(-limit) : this.entries.slice();
    return slice.slice().reverse();
  }

  clear(): void {
    this.entries = [];
  }
}
