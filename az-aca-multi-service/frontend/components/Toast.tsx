import { useBoard } from '../context/BoardContext';

export function Toast() {
  const { state } = useBoard();

  if (!state.toast.visible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg text-sm animate-fade-in">
      {state.toast.message}
    </div>
  );
}
