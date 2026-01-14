import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { formatDistanceToNow } from 'date-fns';
import { Item, SOURCE_COLORS } from '../types';
import { useBoard } from '../context/BoardContext';

type Props = {
  item: Item;
};

export function Card({ item }: Props) {
  const { state, selectItem } = useBoard();
  const isSelected = state.selectedItemId === item.id;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const timeAgo = formatDistanceToNow(new Date(item.updatedAt), { addSuffix: false });

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => selectItem(item.id)}
      className={`
        bg-white rounded-lg border p-3 cursor-grab active:cursor-grabbing
        hover:shadow-md transition-shadow
        ${isSelected ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'}
        ${isDragging ? 'opacity-50 shadow-lg' : ''}
      `}
    >
      <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
        {item.title}
      </h3>

      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-0.5 rounded-full ${SOURCE_COLORS[item.source.type]}`}>
          {item.source.type.charAt(0).toUpperCase() + item.source.type.slice(1)}
        </span>

        <span className="text-xs text-gray-500">{timeAgo}</span>
      </div>

      <div className="mt-1 text-xs text-gray-400 truncate">
        {item.source.display}
      </div>
    </div>
  );
}
