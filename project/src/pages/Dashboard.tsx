import { useState, DragEvent } from 'react';
import { Settings, Eye, EyeOff, GripVertical } from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import { UpcomingBillsWidget } from '../components/dashboard/UpcomingBillsWidget';
import { TasksWidget } from '../components/dashboard/TasksWidget';
import { CalendarWidget } from '../components/dashboard/CalendarWidget';
import { FinancialSnapshotWidget } from '../components/dashboard/FinancialSnapshotWidget';
import { RecentDocumentsWidget } from '../components/dashboard/RecentDocumentsWidget';
import { FundingWidget } from '../components/dashboard/FundingWidget';
import { RecommendationsWidget } from '../components/dashboard/RecommendationsWidget';
import { brand } from '../branding/brand';

interface NavigationState {
  selectedId?: string;
  view?: string;
  filter?: string;
}

interface DashboardProps {
  onNavigate: (route: string, state?: NavigationState) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { widgets, visibleWidgets, reorderWidgets, toggleWidget, resetToDefault } = useDashboard();
  const [showSettings, setShowSettings] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      reorderWidgets(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const renderWidget = (widgetId: string) => {
    switch (widgetId) {
      case 'upcoming-bills':
        return <UpcomingBillsWidget onNavigate={onNavigate} />;
      case 'tasks':
        return <TasksWidget onNavigate={onNavigate} />;
      case 'calendar':
        return <CalendarWidget onNavigate={onNavigate} />;
      case 'financial-snapshot':
        return <FinancialSnapshotWidget onNavigate={onNavigate} />;
      case 'recent-documents':
        return <RecentDocumentsWidget onClick={() => onNavigate('documents')} />;
      case 'funding':
        return <FundingWidget onNavigate={(route, opportunityId) => onNavigate(route, opportunityId ? { selectedId: opportunityId } : undefined)} />;
      case 'recommendations':
        return <RecommendationsWidget onNavigate={onNavigate} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">{brand.appName}</h1>
          <p className="hidden lg:block text-gray-400">{brand.slogan}</p>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-2 px-5 py-3 glass-panel-hover rounded-xl smooth-transition"
        >
          <Settings className="w-5 h-5 text-cyan-400" />
          <span className="text-sm font-semibold text-gray-200">Customize</span>
        </button>
      </div>

      {showSettings && (
        <div className="mb-8 glass-panel rounded-2xl p-6 shadow-2xl neural-glow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-xl text-white">Widget Settings</h3>
            <button
              onClick={resetToDefault}
              className="text-sm text-cyan-400 hover:text-cyan-300 font-semibold smooth-transition"
            >
              Reset to Default
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {widgets.map((widget) => (
              <button
                key={widget.id}
                onClick={() => toggleWidget(widget.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border smooth-transition ${
                  widget.visible
                    ? 'bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border-cyan-500/50 text-cyan-300 shadow-lg shadow-cyan-500/20'
                    : 'bg-gray-800/40 border-gray-700/50 text-gray-400 hover:border-gray-600/50'
                }`}
              >
                {widget.visible ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
                <span className="text-sm font-semibold">{widget.name}</span>
              </button>
            ))}
          </div>
          <p className="mt-4 text-xs text-gray-400">
            Drag and drop widgets to reorder them. Click to show/hide.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {visibleWidgets.map((widget, index) => (
          <div
            key={widget.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`relative group ${draggedIndex === index ? 'opacity-50' : ''}`}
          >
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10">
              <GripVertical className="w-5 h-5 text-gray-400" />
            </div>
            {renderWidget(widget.id)}
          </div>
        ))}
      </div>

      {visibleWidgets.length === 0 && (
        <div className="text-center py-16 glass-panel rounded-2xl">
          <p className="text-gray-400 mb-6 text-lg">No widgets visible. Click Customize to show widgets.</p>
          <button
            onClick={() => setShowSettings(true)}
            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-semibold hover:from-cyan-500 hover:to-blue-500 smooth-transition shadow-xl shadow-cyan-500/30"
          >
            Show Widgets
          </button>
        </div>
      )}
    </div>
  );
}
