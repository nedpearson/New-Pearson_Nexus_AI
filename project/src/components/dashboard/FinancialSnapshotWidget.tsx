import { TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

interface NavigationState {
  selectedId?: string;
  view?: string;
}

interface FinancialSnapshotWidgetProps {
  onNavigate: (route: string, state?: NavigationState) => void;
}

export function FinancialSnapshotWidget({ onNavigate }: FinancialSnapshotWidgetProps) {
  const { transactions } = useData();

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
  const monthlyIncome = monthlyTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpenses = monthlyTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netCashFlow = monthlyIncome - monthlyExpenses;

  return (
    <button
      onClick={() => onNavigate('financial', { view: 'overview' })}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onNavigate('financial', { view: 'overview' });
        }
      }}
      className="w-full text-left glass-panel-hover rounded-xl p-6 smooth-transition cursor-pointer"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Financial Snapshot</h3>
        <TrendingUp className="w-5 h-5 text-cyan-400" />
      </div>
      <div className="space-y-4">
        <div className="p-4 bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border border-cyan-500/30 rounded-xl backdrop-blur-sm">
          <p className="text-sm text-gray-300 mb-1">Net Cash Flow (This Month)</p>
          <p className={`text-2xl font-bold ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${netCashFlow.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-1 mb-1">
              <ArrowUpRight className="w-4 h-4 text-green-600" />
              <p className="text-xs text-gray-600">Monthly Income</p>
            </div>
            <p className="text-lg font-bold text-white">${monthlyIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-1 mb-1">
              <ArrowDownRight className="w-4 h-4 text-red-600" />
              <p className="text-xs text-gray-600">Monthly Expenses</p>
            </div>
            <p className="text-lg font-bold text-white">${monthlyExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>
    </button>
  );
}
