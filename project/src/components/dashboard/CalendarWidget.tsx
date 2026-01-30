import { Calendar as CalendarIcon, Link2 } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

interface NavigationState {
  selectedId?: string;
  view?: string;
}

interface CalendarWidgetProps {
  onNavigate: (route: string, state?: NavigationState) => void;
}

export function CalendarWidget({ onNavigate }: CalendarWidgetProps) {
  const { events } = useData();
  const today = new Date().toISOString().split('T')[0];
  const upcomingEvents = events
    .filter(e => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  return (
    <div className="glass-panel-hover rounded-xl p-6">
      <button
        onClick={() => onNavigate('calendar')}
        className="w-full flex items-center justify-between mb-4 hover:opacity-70 transition-opacity"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onNavigate('calendar');
          }
        }}
      >
        <h3 className="text-lg font-bold text-white">Upcoming Events</h3>
        <CalendarIcon className="w-5 h-5 text-cyan-400" />
      </button>
      <div className="space-y-3">
        {upcomingEvents.map((event) => {
          const hasSource = event.source_bill_id || event.source_case_id;

          return (
            <button
              key={event.id}
              onClick={(e) => {
                e.stopPropagation();
                onNavigate('calendar', { selectedId: event.id });
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  onNavigate('calendar', { selectedId: event.id });
                }
              }}
              className="w-full text-left p-3 bg-gray-800/40 border border-gray-700/50 rounded-xl hover:bg-gray-800/60 hover:border-gray-600/50 smooth-transition cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="font-semibold text-white">{event.title}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {new Date(event.date).toLocaleDateString()}
                    {event.time && ` at ${event.time}`}
                  </p>
                  {event.location && (
                    <p className="text-sm text-gray-400 mt-1">{event.location}</p>
                  )}
                </div>
                {hasSource && (
                  <Link2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                )}
              </div>
            </button>
          );
        })}
      </div>
      {upcomingEvents.length === 0 && (
        <p className="text-gray-500 text-sm">No upcoming events</p>
      )}
    </div>
  );
}
