import { Board, Item, HistoryEvent, Status, SourceType } from '../types';
import { API_BASE_URL } from '../config';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

export async function getBoard(): Promise<Board> {
  return fetchJson<Board>('/api/board');
}

export async function getItem(id: string): Promise<{ item: Item; history: HistoryEvent[] } | null> {
  try {
    return await fetchJson<{ item: Item; history: HistoryEvent[] }>(`/api/items/${id}`);
  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      return null;
    }
    throw error;
  }
}

export async function setStatus(itemId: string, to: Status): Promise<Item | null> {
  try {
    return await fetchJson<Item>(`/api/items/${itemId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status: to }),
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      return null;
    }
    throw error;
  }
}

export async function snoozeItem(itemId: string, until: string): Promise<Item | null> {
  try {
    return await fetchJson<Item>(`/api/items/${itemId}/snooze`, {
      method: 'POST',
      body: JSON.stringify({ until }),
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      return null;
    }
    throw error;
  }
}

export async function fakeWebhook(payload: {
  title: string;
  sourceType: SourceType;
  externalId: string;
  status?: Status;
}): Promise<{ itemId: string }> {
  return fetchJson<{ itemId: string }>('/api/items', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function replay(): Promise<Board> {
  return fetchJson<Board>('/api/board/reset', {
    method: 'POST',
  });
}

// For compatibility with existing code that calls getCurrentItems
export function getCurrentItems(): Item[] {
  // This is synchronous in the mock but we can't do that with real API
  // Return empty array - the board context should use getBoard() instead
  console.warn('getCurrentItems() is deprecated - use getBoard() instead');
  return [];
}

export function getHistoryForItem(_itemId: string): HistoryEvent[] {
  // This is synchronous in the mock but we can't do that with real API
  // Return empty array - the context should fetch via getItem() instead
  console.warn('getHistoryForItem() is deprecated - use getItem() instead');
  return [];
}
