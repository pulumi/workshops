import { useState } from 'react';
import { useBoard } from '../context/BoardContext';
import { SimulateEventModal } from './SimulateEventModal';
import { API_BASE_URL } from '../config';

export function TopBar() {
  const { state, setSearch, resetBoard } = useBoard();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Unified Inbox</h1>

          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search items..."
              value={state.searchQuery}
              onChange={e => setSearch(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />

            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Simulate Event
            </button>

            <button
              onClick={resetBoard}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Replay
            </button>

            <a
              href={`${API_BASE_URL}/swagger`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              API Docs
            </a>

            <a
              href={`${API_BASE_URL}/api/logs`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              title={API_BASE_URL === '' ? 'Backend logs (via BFF proxy)' : 'Backend logs'}
            >
              API Logs {API_BASE_URL === '' && <span className="text-blue-500">→ Backend</span>}
            </a>

            {API_BASE_URL === '' && (
              <div
                className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded border border-blue-200"
                title="Browser → Frontend Container (BFF) → Backend Container"
              >
                BFF Proxy
              </div>
            )}
          </div>
        </div>
      </header>

      {showModal && <SimulateEventModal onClose={() => setShowModal(false)} />}
    </>
  );
}
