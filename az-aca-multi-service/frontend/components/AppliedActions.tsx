import { Action } from '../types';

type Props = {
  actions: Action[];
};

function formatAction(action: Action): string {
  if (action.type === 'set_status') {
    return `set_status ${action.itemId} → ${action.to}`;
  }
  if (action.type === 'snooze') {
    return `snooze ${action.itemId} until ${new Date(action.until).toLocaleDateString()}`;
  }
  return JSON.stringify(action);
}

export function AppliedActions({ actions }: Props) {
  if (actions.length === 0) return null;

  return (
    <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono text-gray-600">
      <div className="text-gray-400 mb-1">Applied actions:</div>
      {actions.map((action, i) => (
        <div key={i} className="text-gray-700">
          • {formatAction(action)}
        </div>
      ))}
    </div>
  );
}
