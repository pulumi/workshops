export const STATUSES = ["inbox", "doing", "blocked", "done"] as const;
export const SOURCE_TYPES = ["github", "jira", "slack", "custom"] as const;
export const HISTORY_TYPES = ["itemCreated", "statusChanged", "externalEvent"] as const;

export type Status = (typeof STATUSES)[number];
export type SourceType = (typeof SOURCE_TYPES)[number];
export type HistoryType = (typeof HISTORY_TYPES)[number];

export type Source = {
  type: SourceType;
  externalId: string;
  display: string;
};

export type Item = {
  id: string;
  title: string;
  status: Status;
  source: Source;
  createdAt: string;
  updatedAt: string;
};

export type HistoryEvent = {
  id: string;
  type: HistoryType;
  occurredAt: string;
  summary: string;
};

export type BoardState = {
  items: Item[];
  history: Record<string, HistoryEvent[]>;
  nextItemId: number;
  nextHistoryId: number;
  version: number;
  lastModified: string;
};

export type RecentActivityEntry = {
  id: string;
  itemId: string;
  itemTitle: string;
  type: HistoryType;
  occurredAt: string;
  summary: string;
};

export type BoardView = {
  columns: Status[];
  items: Item[];
  queueDepth: number;
  deadLetterCount: number;
  mode: "local-file" | "aws-basic" | "aws-private" | "aws-final";
  recentActivity: RecentActivityEntry[];
};

export type ExternalEventPayload = {
  title: string;
  sourceType: SourceType;
  externalId: string;
  status?: Status;
};

export type QueueMessage = {
  id: string;
  payload: ExternalEventPayload;
  attempts: number;
  availableAt: string;
  lastError?: string;
};

export type QueueState = {
  messages: QueueMessage[];
};

export type DeadLetterEntry = QueueMessage & {
  failedAt: string;
};
