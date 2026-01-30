import { CheckSquare, AlertCircle, Link2 } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

interface NavigationState {
  selectedId?: string;
  view?: string;
}

interface TasksWidgetProps {
  onNavigate: (route: string, state?: NavigationState) => void;
}

export function TasksWidget({ onNavigate }: TasksWidgetProps) {
  const { tasks } = useData();
  const today = new Date().toISOString().split('T')[0];
  const activeTasks = tasks
    .filter(t => t.status !== 'completed')
    .sort((a, b) => {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return a.due_date.localeCompare(b.due_date);
    })
    .slice(0, 4);

  const overdueTasks = activeTasks.filter(t => t.due_date && t.due_date < today);

  return (
    <div className="glass-panel-hover rounded-xl p-6">
      <button
        onClick={() => onNavigate('tasks')}
        className="w-full flex items-center justify-between mb-4 hover:opacity-80 smooth-transition"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onNavigate('tasks');
          }
        }}
      >
        <h3 className="text-lg font-bold text-white">Tasks</h3>
        <CheckSquare className="w-5 h-5 text-cyan-400" />
      </button>
      {overdueTasks.length > 0 && (
        <div className="mb-3 p-3 bg-red-900/30 border border-red-500/50 rounded-xl flex items-center gap-2 backdrop-blur-sm">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span className="text-sm font-semibold text-red-300">{overdueTasks.length} overdue</span>
        </div>
      )}
      <div className="space-y-2">
        {activeTasks.map((task) => {
          const isOverdue = task.due_date && task.due_date < today;
          const hasLinks = task.linked_bill_id || task.linked_case_id;

          return (
            <button
              key={task.id}
              onClick={(e) => {
                e.stopPropagation();
                onNavigate('tasks', { selectedId: task.id });
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  onNavigate('tasks', { selectedId: task.id });
                }
              }}
              className={`w-full text-left p-3 rounded-xl border smooth-transition cursor-pointer ${isOverdue ? 'bg-red-900/20 border-red-500/40 hover:bg-red-900/30 hover:border-red-500/60' : 'bg-gray-800/40 border-gray-700/50 hover:bg-gray-800/60 hover:border-gray-600/50'}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className={`font-semibold ${isOverdue ? 'text-red-300' : 'text-white'}`}>{task.title}</p>
                  {task.due_date && (
                    <p className={`text-sm mt-1 ${isOverdue ? 'text-red-400' : 'text-gray-400'}`}>
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {hasLinks && (
                  <Link2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                )}
              </div>
            </button>
          );
        })}
      </div>
      {activeTasks.length === 0 && (
        <p className="text-gray-400 text-sm">No active tasks</p>
      )}
    </div>
  );
}
