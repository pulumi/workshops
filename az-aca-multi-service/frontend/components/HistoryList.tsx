import { formatDistanceToNow } from 'date-fns';
import { HistoryEvent, HistoryEventType } from '../types';

type Props = {
  events: HistoryEvent[];
};

const EVENT_ICONS: Record<HistoryEventType, string> = {
  ItemCreated: '+',
  StatusChanged: '→',
  Snoozed: '⏸',
  SourceUpdated: '↻',
  NoteAdded: '📝',
};

const EVENT_COLORS: Record<HistoryEventType, string> = {
  ItemCreated: 'bg-green-100 text-green-700',
  StatusChanged: 'bg-blue-100 text-blue-700',
  Snoozed: 'bg-yellow-100 text-yellow-700',
  SourceUpdated: 'bg-gray-100 text-gray-700',
  NoteAdded: 'bg-purple-100 text-purple-700',
};

export function HistoryList({ events }: Props) {
  if (events.length === 0) {
    return (
      <div className="text-sm text-gray-400 text-center py-4">
        No history events
      </div>
    );
  }

  // Show most recent first
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
  );

  return (
    <div className="space-y-2">
      {sortedEvents.map(event => (
        <div key={event.id} className="flex items-start gap-2">
          <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs flex-shrink-0 ${EVENT_COLORS[event.type]}`}>
            {EVENT_ICONS[event.type]}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-700">{event.summary}</p>
            <p className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(event.occurredAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
