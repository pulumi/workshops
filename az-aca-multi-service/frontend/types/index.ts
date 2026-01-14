export type Status = 'inbox' | 'doing' | 'blocked' | 'done' | 'snoozed';

export type SourceType = 'github' | 'jira' | 'custom';

export type Item = {
  id: string;
  title: string;
  status: Status;
  source: {
    type: SourceType;
    externalId: string;
    display: string;
  };
  updatedAt: string;
  createdAt: string;
  snoozeUntil?: string | null;
  tags?: string[];
};

export type HistoryEventType =
  | 'ItemCreated'
  | 'StatusChanged'
  | 'Snoozed'
  | 'SourceUpdated'
  | 'NoteAdded';

export type HistoryEvent = {
  id: string;
  type: HistoryEventType;
  occurredAt: string;
  summary: string;
};

export type Board = {
  columns: Status[];
  items: Item[];
};

export const COLUMNS: Status[] = ['inbox', 'doing', 'blocked', 'done', 'snoozed'];

export const COLUMN_LABELS: Record<Status, string> = {
  inbox: 'Inbox',
  doing: 'Doing',
  blocked: 'Blocked',
  done: 'Done',
  snoozed: 'Snoozed',
};

export const SOURCE_COLORS: Record<SourceType, string> = {
  github: 'bg-gray-800 text-white',
  jira: 'bg-blue-600 text-white',
  custom: 'bg-purple-600 text-white',
};

export type Action =
  | { type: 'set_status'; itemId: string; to: Status }
  | { type: 'snooze'; itemId: string; until: string };

export type CommandResponse = {
  assistantMessage: string;
  actions: Action[];
  board: Board;
};
