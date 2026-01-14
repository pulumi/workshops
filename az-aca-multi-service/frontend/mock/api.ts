import { Board, Item, HistoryEvent, Status, CommandResponse, COLUMNS, SourceType } from '../types';
import { initialItems, initialHistory } from './data';
import { parseCommand } from './commandParser';

// In-memory state
let items: Item[] = JSON.parse(JSON.stringify(initialItems));
let history: Record<string, HistoryEvent[]> = JSON.parse(JSON.stringify(initialHistory));
let nextItemId = 11;
let nextHistoryId = 100;

function generateId(prefix: string, num: number): string {
  return `${prefix}_${String(num).padStart(3, '0')}`;
}

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getBoard(): Promise<Board> {
  await delay(50);
  return {
    columns: COLUMNS,
    items: [...items],
  };
}

export async function getItem(id: string): Promise<{ item: Item; history: HistoryEvent[] } | null> {
  await delay(30);
  const item = items.find(i => i.id === id);
  if (!item) return null;
  return {
    item: { ...item },
    history: history[id] || [],
  };
}

export async function setStatus(itemId: string, to: Status): Promise<Item | null> {
  await delay(50);
  const item = items.find(i => i.id === itemId);
  if (!item) return null;

  const oldStatus = item.status;
  item.status = to;
  item.updatedAt = new Date().toISOString();

  // Clear snooze if moving out of snoozed
  if (to !== 'snoozed') {
    item.snoozeUntil = null;
  }

  // Add history event
  const historyEvent: HistoryEvent = {
    id: `h_${nextHistoryId++}`,
    type: 'StatusChanged',
    occurredAt: new Date().toISOString(),
    summary: `Status changed from ${oldStatus} to ${to}`,
  };

  if (!history[itemId]) {
    history[itemId] = [];
  }
  history[itemId].push(historyEvent);

  return { ...item };
}

export async function snoozeItem(itemId: string, until: string): Promise<Item | null> {
  await delay(50);
  const item = items.find(i => i.id === itemId);
  if (!item) return null;

  item.status = 'snoozed';
  item.snoozeUntil = until;
  item.updatedAt = new Date().toISOString();

  const historyEvent: HistoryEvent = {
    id: `h_${nextHistoryId++}`,
    type: 'Snoozed',
    occurredAt: new Date().toISOString(),
    summary: `Snoozed until ${new Date(until).toLocaleDateString()}`,
  };

  if (!history[itemId]) {
    history[itemId] = [];
  }
  history[itemId].push(historyEvent);

  return { ...item };
}

export async function fakeWebhook(payload: {
  title: string;
  sourceType: SourceType;
  externalId: string;
  status?: Status;
}): Promise<{ itemId: string }> {
  await delay(100);

  const newItem: Item = {
    id: generateId('item', nextItemId++),
    title: payload.title,
    status: payload.status || 'inbox',
    source: {
      type: payload.sourceType,
      externalId: payload.externalId,
      display: payload.externalId,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  items.unshift(newItem);

  const historyEvent: HistoryEvent = {
    id: `h_${nextHistoryId++}`,
    type: 'ItemCreated',
    occurredAt: new Date().toISOString(),
    summary: `Item created from ${payload.sourceType} webhook`,
  };

  history[newItem.id] = [historyEvent];

  return { itemId: newItem.id };
}

export async function executeCommand(
  message: string,
  selectedItemId: string | null,
  visibleItemIds: string[]
): Promise<CommandResponse> {
  await delay(100);

  const visibleItems = items.filter(i => visibleItemIds.includes(i.id));
  const { actions, message: assistantMessage } = parseCommand(message, selectedItemId, visibleItems);

  // Apply actions
  for (const action of actions) {
    if (action.type === 'set_status') {
      await setStatus(action.itemId, action.to);
    } else if (action.type === 'snooze') {
      await snoozeItem(action.itemId, action.until);
    }
  }

  return {
    assistantMessage,
    actions,
    board: {
      columns: COLUMNS,
      items: [...items],
    },
  };
}

export async function replay(): Promise<Board> {
  await delay(100);

  // Reset to initial state
  items = JSON.parse(JSON.stringify(initialItems));
  history = JSON.parse(JSON.stringify(initialHistory));
  nextItemId = 11;
  nextHistoryId = 100;

  return {
    columns: COLUMNS,
    items: [...items],
  };
}

// Export current state for context access
export function getCurrentItems(): Item[] {
  return [...items];
}

export function getHistoryForItem(itemId: string): HistoryEvent[] {
  return history[itemId] || [];
}
