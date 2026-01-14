import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Status, Item, COLUMN_LABELS } from '../types';
import { Card } from './Card';

type Props = {
  status: Status;
  items: Item[];
};

const COLUMN_COLORS: Record<Status, string> = {
  inbox: 'bg-gray-50 border-gray-300',
  doing: 'bg-blue-50 border-blue-300',
  blocked: 'bg-red-50 border-red-300',
  done: 'bg-green-50 border-green-300',
  snoozed: 'bg-yellow-50 border-yellow-300',
};

const HEADER_COLORS: Record<Status, string> = {
  inbox: 'text-gray-700',
  doing: 'text-blue-700',
  blocked: 'text-red-700',
  done: 'text-green-700',
  snoozed: 'text-yellow-700',
};

export function Column({ status, items }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const itemIds = items.map(i => i.id);

  return (
    <div
      ref={setNodeRef}
      className={`
        flex flex-col rounded-xl border-2 min-h-[400px] w-56 flex-shrink-0
        ${COLUMN_COLORS[status]}
        ${isOver ? 'ring-2 ring-blue-400' : ''}
      `}
    >
      <div className="px-3 py-2 border-b border-inherit">
        <div className="flex items-center justify-between">
          <h2 className={`text-sm font-semibold ${HEADER_COLORS[status]}`}>
            {COLUMN_LABELS[status]}
          </h2>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-white ${HEADER_COLORS[status]}`}>
            {items.length}
          </span>
        </div>
      </div>

      <div className="flex-1 p-2 space-y-2 overflow-auto">
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {items.map(item => (
            <Card key={item.id} item={item} />
          ))}
        </SortableContext>

        {items.length === 0 && (
          <div className="text-center text-sm text-gray-400 py-8">
            No items
          </div>
        )}
      </div>
    </div>
  );
}
