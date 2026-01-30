import { Lightbulb, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

interface NavigationState {
  selectedId?: string;
  view?: string;
}

interface RecommendationsWidgetProps {
  onNavigate: (route: string, state?: NavigationState) => void;
}

export function RecommendationsWidget({ onNavigate }: RecommendationsWidgetProps) {
  const { recommendations } = useData();
  const recs = Array.isArray(recommendations) ? recommendations : [];
  const newRecommendations = recs.filter(r => r.status === 'new').slice(0, 3);

  const getIcon = (type: string) => {
    switch (type) {
      case 'savings':
        return <TrendingDown className="w-4 h-4 text-green-600" />;
      case 'opportunity':
        return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      default:
        return <Lightbulb className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'savings':
        return 'bg-green-900/20 text-green-300 border border-green-500/30 hover:bg-green-900/30';
      case 'opportunity':
        return 'bg-cyan-900/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-900/30';
      case 'alert':
        return 'bg-orange-900/20 text-orange-300 border border-orange-500/30 hover:bg-orange-900/30';
      default:
        return 'bg-yellow-900/20 text-yellow-300 border border-yellow-500/30 hover:bg-yellow-900/30';
    }
  };

  const getNavigationRoute = (type: string) => {
    switch (type) {
      case 'savings':
        return 'financial';
      case 'alert':
        return 'calendar';
      default:
        return 'recommendations';
    }
  };

  return (
    <div className="glass-panel-hover rounded-xl p-6">
      <button
        onClick={() => onNavigate('recommendations')}
        className="w-full flex items-center justify-between mb-4 hover:opacity-70 transition-opacity"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onNavigate('recommendations');
          }
        }}
      >
        <h3 className="text-lg font-bold text-white">Recommendations</h3>
        <div className="flex items-center gap-2">
          {newRecommendations.length > 0 && (
            <span className="px-2 py-1 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-bold rounded-full shadow-lg shadow-cyan-500/30">
              {newRecommendations.length} New
            </span>
          )}
          <Lightbulb className="w-5 h-5 text-cyan-400" />
        </div>
      </button>
      <div className="space-y-3">
        {newRecommendations.map((rec) => (
          <button
            key={rec.id}
            onClick={(e) => {
              e.stopPropagation();
              const route = getNavigationRoute(rec.type);
              onNavigate(route);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                const route = getNavigationRoute(rec.type);
                onNavigate(route);
              }
            }}
            className={`w-full text-left p-3 rounded-xl smooth-transition backdrop-blur-sm cursor-pointer ${getTypeColor(rec.type)}`}
          >
            <div className="flex items-start gap-2">
              {getIcon(rec.type)}
              <div>
                <p className="font-medium text-sm">{rec.title}</p>
                <p className="text-xs mt-1 opacity-80">{rec.explanation}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
      {newRecommendations.length === 0 && (
        <p className="text-gray-400 text-sm">No new recommendations</p>
      )}
    </div>
  );
}
