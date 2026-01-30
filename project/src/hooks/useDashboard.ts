import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUiMode } from '../state/uiMode';

export interface WidgetConfig {
  id: string;
  name: string;
  visible: boolean;
  simpleView?: boolean;
}

const defaultWidgets: WidgetConfig[] = [
  { id: 'upcoming-bills', name: 'Upcoming Bills', visible: true, simpleView: true },
  { id: 'tasks', name: 'Tasks', visible: true, simpleView: true },
  { id: 'calendar', name: 'Calendar', visible: true, simpleView: true },
  { id: 'financial-snapshot', name: 'Financial Snapshot', visible: true, simpleView: false },
  { id: 'recent-documents', name: 'Recent Documents', visible: true, simpleView: true },
  { id: 'funding', name: 'Funding Opportunities', visible: true, simpleView: false },
  { id: 'recommendations', name: 'Recommendations', visible: true, simpleView: true },
];

const STORAGE_KEY = 'pnx_dashboard_layout';

export function useDashboard() {
  const { user } = useAuth();
  const { mode } = useUiMode();
  const [widgets, setWidgets] = useState<WidgetConfig[]>(defaultWidgets);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardLayout();
  }, [user]);

  const loadDashboardLayout = () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${user.id}`);
      if (stored) {
        const data = JSON.parse(stored);
        const widgetOrder = data.widget_order as string[];
        const hiddenWidgets = data.hidden_widgets as string[];

        const orderedWidgets = widgetOrder.map(id => {
          const widget = defaultWidgets.find(w => w.id === id);
          return widget ? { ...widget, visible: !hiddenWidgets.includes(id) } : null;
        }).filter(Boolean) as WidgetConfig[];

        const newWidgets = defaultWidgets.filter(w => !widgetOrder.includes(w.id));
        setWidgets([...orderedWidgets, ...newWidgets]);
      }
    } catch (error) {
      console.error('Error loading dashboard layout:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveDashboardLayout = (updatedWidgets: WidgetConfig[]) => {
    if (!user) return;

    try {
      const widgetOrder = updatedWidgets.map(w => w.id);
      const hiddenWidgets = updatedWidgets.filter(w => !w.visible).map(w => w.id);

      localStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify({
        widget_order: widgetOrder,
        hidden_widgets: hiddenWidgets,
        updated_at: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Error saving dashboard layout:', error);
    }
  };

  const reorderWidgets = (fromIndex: number, toIndex: number) => {
    const newWidgets = [...widgets];
    const [movedWidget] = newWidgets.splice(fromIndex, 1);
    newWidgets.splice(toIndex, 0, movedWidget);
    setWidgets(newWidgets);
    saveDashboardLayout(newWidgets);
  };

  const toggleWidget = (id: string) => {
    const newWidgets = widgets.map(w => w.id === id ? { ...w, visible: !w.visible } : w);
    setWidgets(newWidgets);
    saveDashboardLayout(newWidgets);
  };

  const resetToDefault = () => {
    setWidgets(defaultWidgets);
    saveDashboardLayout(defaultWidgets);
  };

  const visibleWidgets = widgets.filter(w => {
    if (!w.visible) return false;
    if (mode === 'simple' && w.simpleView === false) return false;
    return true;
  });

  return {
    widgets,
    visibleWidgets,
    loading,
    reorderWidgets,
    toggleWidget,
    resetToDefault,
  };
}
