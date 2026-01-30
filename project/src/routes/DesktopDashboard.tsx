import { useState, useEffect } from 'react';
import { TopBar } from '../components/TopBar';
import { Dashboard } from '../pages/Dashboard';

interface NavigationState {
  selectedId?: string;
  view?: string;
  filter?: string;
}

interface DesktopDashboardProps {
  onNavigate: (route: string, state?: NavigationState) => void;
}

export function DesktopDashboard({ onNavigate }: DesktopDashboardProps) {
  const [viewMode, setViewMode] = useState<'simple' | 'advanced'>(() => {
    const saved = localStorage.getItem('viewMode');
    return (saved === 'simple' || saved === 'advanced') ? saved : 'simple';
  });

  useEffect(() => {
    localStorage.setItem('viewMode', viewMode);
  }, [viewMode]);

  return (
    <div>
      <TopBar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showMobileViewButton={true}
        showViewToggle={true}
      />
      <div className="pt-6">
        <Dashboard onNavigate={onNavigate} />
      </div>
    </div>
  );
}
