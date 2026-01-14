import { format } from 'date-fns';
import { useBoard } from '../context/BoardContext';
import { COLUMNS, COLUMN_LABELS, SOURCE_COLORS, Status } from '../types';
import { HistoryList } from './HistoryList';

export function DetailsPanel() {
  const { selectedItem, selectedItemHistory, moveItem } = useBoard();

  if (!selectedItem) {
    return (
      <div className="p-6 h-full flex items-center justify-center">
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-2">📋</div>
          <p className="text-sm">Select an item to view details</p>
        </div>
      </div>
    );
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    moveItem(selectedItem.id, e.target.value as Status);
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          {selectedItem.title}
        </h2>

        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs px-2 py-0.5 rounded-full ${SOURCE_COLORS[selectedItem.source.type]}`}>
            {selectedItem.source.type.charAt(0).toUpperCase() + selectedItem.source.type.slice(1)}
          </span>
          <span className="text-xs text-gray-500">
            {selectedItem.source.display}
          </span>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
          <select
            value={selectedItem.status}
            onChange={handleStatusChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {COLUMNS.map(status => (
              <option key={status} value={status}>
                {COLUMN_LABELS[status]}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
          <div>
            <span className="font-medium">Created</span>
            <p>{format(new Date(selectedItem.createdAt), 'MMM d, yyyy h:mm a')}</p>
          </div>
          <div>
            <span className="font-medium">Updated</span>
            <p>{format(new Date(selectedItem.updatedAt), 'MMM d, yyyy h:mm a')}</p>
          </div>
        </div>

        {selectedItem.snoozeUntil && (
          <div className="mt-3 px-3 py-2 bg-yellow-50 rounded-lg text-xs text-yellow-700">
            Snoozed until {format(new Date(selectedItem.snoozeUntil), 'MMM d, yyyy')}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        <h3 className="text-sm font-medium text-gray-700 mb-2">History</h3>
        <HistoryList events={selectedItemHistory} />
      </div>
    </div>
  );
}
