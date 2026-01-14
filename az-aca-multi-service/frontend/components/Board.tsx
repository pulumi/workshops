import { DndContext, DragEndEvent, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useState } from 'react';
import { COLUMNS, Status, Item } from '../types';
import { Column } from './Column';
import { useBoard } from '../context/BoardContext';

export function Board() {
  const { filteredItems, moveItem } = useBoard();
  const [activeItem, setActiveItem] = useState<Item | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const itemsByStatus = COLUMNS.reduce((acc, status) => {
    acc[status] = filteredItems.filter(item => item.status === status);
    return acc;
  }, {} as Record<Status, Item[]>);

  const handleDragStart = (event: { active: { id: string | number } }) => {
    const item = filteredItems.find(i => i.id === event.active.id);
    setActiveItem(item || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveItem(null);

    const { active, over } = event;
    if (!over) return;

    const itemId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a column
    if (COLUMNS.includes(overId as Status)) {
      moveItem(itemId, overId as Status);
      return;
    }

    // Check if dropped on another item
    const overItem = filteredItems.find(i => i.id === overId);
    if (overItem) {
      moveItem(itemId, overItem.status);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map(status => (
          <Column key={status} status={status} items={itemsByStatus[status]} />
        ))}
      </div>

      <DragOverlay>
        {activeItem && (
          <div className="bg-white rounded-lg border border-blue-500 p-3 shadow-xl opacity-90 w-56">
            <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
              {activeItem.title}
            </h3>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
