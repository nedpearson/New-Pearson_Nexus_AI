import { Award, Calendar, TrendingUp, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FundingOpportunity } from '../../types';

const STORAGE_KEY_OPPORTUNITIES = 'pnx_funding_opportunities';

function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

interface FundingWidgetProps {
  onNavigate: (route: string, opportunityId?: string) => void;
}

export function FundingWidget({ onNavigate }: FundingWidgetProps) {
  const [opportunities, setOpportunities] = useState<FundingOpportunity[]>([]);

  useEffect(() => {
    loadOpportunities();
  }, []);

  const loadOpportunities = () => {
    const opps = loadFromLocalStorage<FundingOpportunity[]>(STORAGE_KEY_OPPORTUNITIES, []);
    const relevantOpps = opps.filter(
      opp => opp.status === 'in_progress' || opp.status === 'new'
    );
    const sorted = relevantOpps.sort((a, b) =>
      new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    );
    setOpportunities(sorted.slice(0, 3));
  };

  const daysUntilDeadline = (deadline: string) => {
    return Math.ceil(
      (new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  return (
    <div className="glass-panel-hover rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white">Funding Opportunities</h2>
        </div>
        <button
          onClick={() => onNavigate('funding')}
          className="text-sm text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
        >
          <span>View all</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {opportunities.length === 0 ? (
        <div className="text-center py-8">
          <Award className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No active opportunities</p>
        </div>
      ) : (
        <div className="space-y-3">
          {opportunities.map(opp => {
            const days = daysUntilDeadline(opp.deadline);
            return (
              <div
                key={opp.id}
                onClick={() => onNavigate('funding', opp.id)}
                className="border border-gray-700/50 bg-gray-800/40 rounded-xl p-3 hover:bg-gray-800/60 hover:border-gray-600/50 cursor-pointer smooth-transition"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-sm mb-1">{opp.title}</h3>
                    <p className="text-xs text-gray-400">{opp.provider}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded flex-shrink-0 ml-2 ${
                    opp.status === 'in_progress' ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-500/30' : 'bg-cyan-900/30 text-cyan-300 border border-cyan-500/30'
                  }`}>
                    {opp.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-gray-600" />
                    <span className={days <= 7 ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                      {days} days left
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-green-600" />
                    <span className="text-green-600 font-semibold">{opp.match_score}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
