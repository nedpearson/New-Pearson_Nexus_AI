import { DollarSign } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

interface NavigationState {
  selectedId?: string;
  view?: string;
}

interface UpcomingBillsWidgetProps {
  onNavigate: (route: string, state?: NavigationState) => void;
}

export function UpcomingBillsWidget({ onNavigate }: UpcomingBillsWidgetProps) {
  const { bills } = useData();
  const upcomingBills = bills
    .filter(b => b.status === 'upcoming')
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 3);

  return (
    <div className="glass-panel-hover rounded-xl p-6">
      <button
        onClick={() => onNavigate('financial', { view: 'bills' })}
        className="w-full flex items-center justify-between mb-4 hover:opacity-80 smooth-transition"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onNavigate('financial', { view: 'bills' });
          }
        }}
      >
        <h3 className="text-lg font-bold text-white">Upcoming Bills</h3>
        <DollarSign className="w-5 h-5 text-cyan-400" />
      </button>
      <div className="space-y-2.5">
        {upcomingBills.map((bill) => (
          <button
            key={bill.id}
            onClick={(e) => {
              e.stopPropagation();
              onNavigate('financial', { selectedId: bill.id, view: 'bills' });
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                onNavigate('financial', { selectedId: bill.id, view: 'bills' });
              }
            }}
            className="w-full flex items-center justify-between p-3 bg-gray-800/40 border border-gray-700/50 rounded-xl hover:bg-gray-800/60 hover:border-gray-600/50 smooth-transition cursor-pointer"
          >
            <div className="text-left">
              <p className="font-semibold text-white">{bill.title}</p>
              <p className="text-sm text-gray-400 mt-1">Due: {new Date(bill.due_date).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-cyan-300">${bill.amount.toFixed(2)}</span>
            </div>
          </button>
        ))}
      </div>
      {upcomingBills.length === 0 && (
        <p className="text-gray-400 text-sm">No upcoming bills</p>
      )}
    </div>
  );
}
