import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import { UpcomingBillsWidget } from '../components/dashboard/UpcomingBillsWidget';
import { TasksWidget } from '../components/dashboard/TasksWidget';
import { CalendarWidget } from '../components/dashboard/CalendarWidget';
import { FinancialSnapshotWidget } from '../components/dashboard/FinancialSnapshotWidget';
import { RecentDocumentsWidget } from '../components/dashboard/RecentDocumentsWidget';
import { RecommendationsWidget } from '../components/dashboard/RecommendationsWidget';
import { brand } from '../branding/brand';
import { TopBar } from '../components/TopBar';

export default function MobileDashboard() {
  const navigate = useNavigate();
  const { visibleWidgets } = useDashboard();

  const handleNavigate = (route: string, state?: any) => {
    navigate(`/${route}`, { state });
  };

  const renderWidget = (widgetId: string) => {
    switch (widgetId) {
      case 'upcoming-bills':
        return <UpcomingBillsWidget onNavigate={handleNavigate} />;
      case 'tasks':
        return <TasksWidget onNavigate={handleNavigate} />;
      case 'calendar':
        return <CalendarWidget onNavigate={handleNavigate} />;
      case 'financial-snapshot':
        return <FinancialSnapshotWidget onNavigate={handleNavigate} />;
      case 'recent-documents':
        return <RecentDocumentsWidget onClick={() => navigate('/documents')} />;
      case 'recommendations':
        return <RecommendationsWidget onNavigate={handleNavigate} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <TopBar showMobileViewButton={false} showViewToggle={false} />

      <div className="bg-white border-b border-gray-200 sticky top-14 z-10 shadow-sm">
        <div className="px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            title="Back to desktop view"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-3 flex-1">
            <Home className="w-5 h-5 text-blue-600" />
            <div>
              <h1 className="text-lg font-bold text-gray-900">Mobile Dashboard</h1>
              <p className="text-xs text-gray-500">{brand.slogan}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        {visibleWidgets.map((widget) => (
          <div key={widget.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {renderWidget(widget.id)}
          </div>
        ))}
      </div>
    </div>
  );
}
