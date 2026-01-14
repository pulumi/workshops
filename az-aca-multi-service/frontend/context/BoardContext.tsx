import React, { createContext, useContext, useReducer, useEffect, useCallback, useState } from 'react';
import { Item, Status, HistoryEvent, SourceType } from '../types';
import * as api from '../services/api';

type BoardState = {
  items: Item[];
  selectedItemId: string | null;
  searchQuery: string;
  isLoading: boolean;
  toast: { message: string; visible: boolean };
};

type BoardAction =
  | { type: 'SET_ITEMS'; items: Item[] }
  | { type: 'SELECT_ITEM'; id: string | null }
  | { type: 'SET_SEARCH'; query: string }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SHOW_TOAST'; message: string }
  | { type: 'HIDE_TOAST' };

const initialState: BoardState = {
  items: [],
  selectedItemId: null,
  searchQuery: '',
  isLoading: true,
  toast: { message: '', visible: false },
};

function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.items, isLoading: false };
    case 'SELECT_ITEM':
      return { ...state, selectedItemId: action.id };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.query };
    case 'SET_LOADING':
      return { ...state, isLoading: action.loading };
    case 'SHOW_TOAST':
      return { ...state, toast: { message: action.message, visible: true } };
    case 'HIDE_TOAST':
      return { ...state, toast: { ...state.toast, visible: false } };
    default:
      return state;
  }
}

type BoardContextType = {
  state: BoardState;
  selectedItem: Item | null;
  filteredItems: Item[];
  selectedItemHistory: HistoryEvent[];
  selectItem: (id: string | null) => void;
  setSearch: (query: string) => void;
  moveItem: (itemId: string, to: Status) => Promise<void>;
  simulateEvent: (title: string, sourceType: SourceType, externalId: string) => Promise<void>;
  resetBoard: () => Promise<void>;
};

const BoardContext = createContext<BoardContextType | null>(null);

export function BoardProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(boardReducer, initialState);
  const [historyCache, setHistoryCache] = useState<Record<string, HistoryEvent[]>>({});

  // Load initial data
  useEffect(() => {
    api.getBoard().then(board => {
      dispatch({ type: 'SET_ITEMS', items: board.items });
    }).catch(err => {
      console.error('Failed to load board:', err);
      dispatch({ type: 'SET_LOADING', loading: false });
      dispatch({ type: 'SHOW_TOAST', message: 'Failed to connect to backend' });
    });
  }, []);

  // Fetch history when selected item changes
  useEffect(() => {
    if (state.selectedItemId && !historyCache[state.selectedItemId]) {
      api.getItem(state.selectedItemId).then(result => {
        if (result) {
          setHistoryCache(prev => ({
            ...prev,
            [state.selectedItemId!]: result.history
          }));
        }
      }).catch(err => {
        console.error('Failed to load item history:', err);
      });
    }
  }, [state.selectedItemId, historyCache]);

  // Auto-hide toast
  useEffect(() => {
    if (state.toast.visible) {
      const timer = setTimeout(() => {
        dispatch({ type: 'HIDE_TOAST' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state.toast.visible]);

  const selectedItem = state.items.find(i => i.id === state.selectedItemId) || null;
  const selectedItemHistory = state.selectedItemId ? (historyCache[state.selectedItemId] || []) : [];

  const filteredItems = state.searchQuery
    ? state.items.filter(i =>
        i.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        i.source.display.toLowerCase().includes(state.searchQuery.toLowerCase())
      )
    : state.items;

  const selectItem = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT_ITEM', id });
  }, []);

  const setSearch = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH', query });
  }, []);

  const moveItem = useCallback(async (itemId: string, to: Status) => {
    const item = state.items.find(i => i.id === itemId);
    if (!item || item.status === to) return;

    await api.setStatus(itemId, to);
    const board = await api.getBoard();
    dispatch({ type: 'SET_ITEMS', items: board.items });
    dispatch({ type: 'SHOW_TOAST', message: `Moved "${item.title}" to ${to}` });
    // Invalidate history cache for this item
    setHistoryCache(prev => {
      const { [itemId]: _, ...rest } = prev;
      return rest;
    });
  }, [state.items]);

  const simulateEvent = useCallback(async (title: string, sourceType: SourceType, externalId: string) => {
    await api.fakeWebhook({ title, sourceType, externalId });
    const board = await api.getBoard();
    dispatch({ type: 'SET_ITEMS', items: board.items });
    dispatch({ type: 'SHOW_TOAST', message: `Created new item: "${title}"` });
  }, []);

  const resetBoard = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', loading: true });
    const board = await api.replay();
    dispatch({ type: 'SET_ITEMS', items: board.items });
    dispatch({ type: 'SELECT_ITEM', id: null });
    dispatch({ type: 'SET_SEARCH', query: '' });
    setHistoryCache({}); // Clear history cache on reset
    dispatch({ type: 'SHOW_TOAST', message: 'Board reset to initial state' });
  }, []);

  const value: BoardContextType = {
    state,
    selectedItem,
    filteredItems,
    selectedItemHistory,
    selectItem,
    setSearch,
    moveItem,
    simulateEvent,
    resetBoard,
  };

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
}

export function useBoard(): BoardContextType {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoard must be used within a BoardProvider');
  }
  return context;
}
