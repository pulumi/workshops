import { Action, Item, Status } from '../types';
import { addDays } from 'date-fns';

type ParseResult = {
  actions: Action[];
  message: string;
};

function extractItemReference(message: string, items: Item[]): Item | undefined {
  // Try to find item names mentioned in the message
  for (const item of items) {
    const words = item.title.toLowerCase().split(/\s+/);
    // Check if any significant word from title appears in message
    for (const word of words) {
      if (word.length > 3 && message.toLowerCase().includes(word)) {
        return item;
      }
    }
  }
  return undefined;
}

export function parseCommand(
  message: string,
  selectedItemId: string | null,
  visibleItems: Item[]
): ParseResult {
  const lowerMessage = message.toLowerCase();
  const actions: Action[] = [];
  const messages: string[] = [];

  // Determine target item
  let targetItem: Item | undefined;

  // First, try to find a mentioned item
  targetItem = extractItemReference(message, visibleItems);

  // Fall back to selected item
  if (!targetItem && selectedItemId) {
    targetItem = visibleItems.find(i => i.id === selectedItemId);
  }

  // Fall back to first visible item
  if (!targetItem && visibleItems.length > 0) {
    targetItem = visibleItems[0];
  }

  if (!targetItem) {
    return { actions: [], message: "I couldn't find any items to act on." };
  }

  // Parse status changes
  let newStatus: Status | null = null;

  if (lowerMessage.includes('blocked') || lowerMessage.includes('block')) {
    newStatus = 'blocked';
  } else if (lowerMessage.includes('doing') || lowerMessage.includes('in progress') || lowerMessage.includes('start')) {
    newStatus = 'doing';
  } else if (lowerMessage.includes('done') || lowerMessage.includes('close') || lowerMessage.includes('complete') || lowerMessage.includes('finish')) {
    newStatus = 'done';
  } else if (lowerMessage.includes('inbox') || lowerMessage.includes('reopen')) {
    newStatus = 'inbox';
  } else if (lowerMessage.includes('snooze')) {
    // Handle snooze
    const snoozeUntil = addDays(new Date(), 2).toISOString();
    actions.push({ type: 'snooze', itemId: targetItem.id, until: snoozeUntil });
    messages.push(`Snoozed "${targetItem.title}" for 2 days.`);
  }

  if (newStatus && newStatus !== targetItem.status) {
    actions.push({ type: 'set_status', itemId: targetItem.id, to: newStatus });
    messages.push(`Moved "${targetItem.title}" to ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}.`);
  } else if (newStatus && newStatus === targetItem.status) {
    messages.push(`"${targetItem.title}" is already in ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}.`);
  }

  if (actions.length === 0 && messages.length === 0) {
    return {
      actions: [],
      message: `I understand you're asking about "${targetItem.title}". Try commands like "move to blocked", "mark as done", or "snooze".`,
    };
  }

  return {
    actions,
    message: messages.join(' '),
  };
}
