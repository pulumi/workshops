import { TopBar } from './TopBar';
import { Board } from './Board';
import { DetailsPanel } from './DetailsPanel';
import { Toast } from './Toast';
import { useBoard } from '../context/BoardContext';

export function Layout() {
  const { state } = useBoard();

  if (state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Kanban Board */}
        <div className="flex-1 overflow-auto p-6" style={{ width: '70%' }}>
          <Board />
        </div>

        {/* Right: Details Panel */}
        <div className="w-[30%] min-w-[320px] max-w-[480px] border-l border-gray-200 bg-white overflow-auto">
          <DetailsPanel />
        </div>
      </div>

      <Toast />
    </div>
  );
}
