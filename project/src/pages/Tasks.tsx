import { useState, useEffect } from 'react';
import { Plus, X, Calendar, AlertCircle, CheckCircle2, Clock, Link2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Task } from '../types';
import { ProofLinks } from '../components/ProofLinks';

const STORAGE_KEY = 'pnx_tasks';

function loadFromLocalStorage(): Task[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveToLocalStorage(tasks: Task[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

interface TasksProps {
  selectedTaskId?: string;
}

export function Tasks({ selectedTaskId }: TasksProps) {
  const { organization } = useAuth();
  const { refresh } = useData();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    if (organization) {
      loadTasks();
    }
  }, [organization]);

  useEffect(() => {
    if (selectedTaskId && tasks.length > 0) {
      const task = tasks.find(t => t.id === selectedTaskId);
      if (task) {
        setSelectedTask(task);
      }
    }
  }, [selectedTaskId, tasks]);

  const loadTasks = () => {
    setLoading(true);
    const orgId = organization?.id || '1';
    const allTasks = loadFromLocalStorage();
    setTasks(allTasks.filter(t => t.organization_id === orgId));
    setLoading(false);
  };

  const updateTaskStatus = (taskId: string, newStatus: Task['status']) => {
    const allTasks = loadFromLocalStorage();
    const updatedTasks = allTasks.map(t =>
      t.id === taskId ? { ...t, status: newStatus, updated_at: new Date().toISOString() } : t
    );
    saveToLocalStorage(updatedTasks);
    loadTasks();
    refresh();
  };

  const deleteTask = (taskId: string) => {
    const allTasks = loadFromLocalStorage();
    const updatedTasks = allTasks.filter(t => t.id !== taskId);
    saveToLocalStorage(updatedTasks);
    loadTasks();
    setSelectedTask(null);
    refresh();
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-1">{tasks.length} total tasks</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="text-sm font-medium">Add Task</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading tasks...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TaskColumn
            title="To Do"
            tasks={pendingTasks}
            status="pending"
            icon={<AlertCircle className="w-5 h-5 text-gray-600" />}
            onTaskClick={setSelectedTask}
            onStatusChange={updateTaskStatus}
          />
          <TaskColumn
            title="In Progress"
            tasks={inProgressTasks}
            status="in_progress"
            icon={<Clock className="w-5 h-5 text-blue-600" />}
            onTaskClick={setSelectedTask}
            onStatusChange={updateTaskStatus}
          />
          <TaskColumn
            title="Completed"
            tasks={completedTasks}
            status="completed"
            icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
            onTaskClick={setSelectedTask}
            onStatusChange={updateTaskStatus}
          />
        </div>
      )}

      {showAddModal && (
        <AddTaskModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            loadTasks();
          }}
        />
      )}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={loadTasks}
          onDelete={deleteTask}
          onStatusChange={updateTaskStatus}
        />
      )}
    </div>
  );
}

interface TaskColumnProps {
  title: string;
  tasks: Task[];
  status: Task['status'];
  icon: React.ReactNode;
  onTaskClick: (task: Task) => void;
  onStatusChange: (taskId: string, status: Task['status']) => void;
}

function TaskColumn({ title, tasks, status, icon, onTaskClick, onStatusChange }: TaskColumnProps) {
  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getNextStatus = (): Task['status'] | null => {
    if (status === 'pending') return 'in_progress';
    if (status === 'in_progress') return 'completed';
    return null;
  };

  const nextStatus = getNextStatus();

  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="font-bold text-gray-900">{title}</h3>
        <span className="ml-auto text-sm text-gray-500">({tasks.length})</span>
      </div>

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <p className="text-center text-gray-500 py-8 text-sm">No tasks</p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onTaskClick(task)}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900 flex-1">{task.title}</h4>
                <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>

              {task.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
              )}

              {task.due_date && (
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                  <Calendar className="w-3 h-3" />
                  <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                </div>
              )}

              {(task.linked_bill_id || task.linked_case_id) && (
                <div className="flex items-center gap-1 text-xs text-blue-600 mb-2">
                  <Link2 className="w-3 h-3" />
                  <span>
                    {task.linked_bill_id && 'Linked to bill'}
                    {task.linked_bill_id && task.linked_case_id && ' & '}
                    {task.linked_case_id && 'Linked to case'}
                  </span>
                </div>
              )}

              <ProofLinks entityType="task" entityId={task.id} />

              {nextStatus && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange(task.id, nextStatus);
                  }}
                  className="w-full text-sm px-3 py-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                >
                  {nextStatus === 'in_progress' && 'Start Task'}
                  {nextStatus === 'completed' && 'Mark Complete'}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

interface AddTaskModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function AddTaskModal({ onClose, onSuccess }: AddTaskModalProps) {
  const { organization } = useAuth();
  const { bills, cases } = useData();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [linkedBillId, setLinkedBillId] = useState('');
  const [linkedCaseId, setLinkedCaseId] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const allTasks = loadFromLocalStorage();
    const newTask: Task = {
      id: `task-${Date.now()}`,
      organization_id: organization?.id || '1',
      title,
      description,
      due_date: dueDate || undefined,
      priority,
      status: 'pending',
      linked_bill_id: linkedBillId || undefined,
      linked_case_id: linkedCaseId || undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    allTasks.push(newTask);
    saveToLocalStorage(allTasks);

    setSaving(false);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Add Task</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority *</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Task['priority'])}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Link to Bill</label>
              <select
                value={linkedBillId}
                onChange={(e) => setLinkedBillId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">None</option>
                {bills.map(bill => (
                  <option key={bill.id} value={bill.id}>{bill.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Link to Case</label>
              <select
                value={linkedCaseId}
                onChange={(e) => setLinkedCaseId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">None</option>
                {cases.map(caseItem => (
                  <option key={caseItem.id} value={caseItem.id}>{caseItem.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Adding...' : 'Add Task'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
  onUpdate: () => void;
  onDelete: (id: string) => void;
  onStatusChange: (taskId: string, status: Task['status']) => void;
}

function TaskDetailModal({ task, onClose, onUpdate, onDelete, onStatusChange }: TaskDetailModalProps) {
  const { bills, cases } = useData();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [dueDate, setDueDate] = useState(task.due_date || '');
  const [priority, setPriority] = useState(task.priority);
  const [linkedBillId, setLinkedBillId] = useState(task.linked_bill_id || '');
  const [linkedCaseId, setLinkedCaseId] = useState(task.linked_case_id || '');
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);

    const allTasks = loadFromLocalStorage();
    const updatedTasks = allTasks.map(t =>
      t.id === task.id
        ? {
            ...t,
            title,
            description,
            due_date: dueDate || undefined,
            priority,
            linked_bill_id: linkedBillId || undefined,
            linked_case_id: linkedCaseId || undefined,
            updated_at: new Date().toISOString(),
          }
        : t
    );

    saveToLocalStorage(updatedTasks);
    setSaving(false);
    setEditing(false);
    onUpdate();
  };

  const getPriorityColor = (p: Task['priority']) => {
    switch (p) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
    }
  };

  const getStatusColor = (s: Task['status']) => {
    switch (s) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      case 'pending':
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Task Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {editing ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Task['priority'])}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Link to Bill</label>
                  <select
                    value={linkedBillId}
                    onChange={(e) => setLinkedBillId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">None</option>
                    {bills.map(bill => (
                      <option key={bill.id} value={bill.id}>{bill.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Link to Case</label>
                  <select
                    value={linkedCaseId}
                    onChange={(e) => setLinkedCaseId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">None</option>
                    {cases.map(caseItem => (
                      <option key={caseItem.id} value={caseItem.id}>{caseItem.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setTitle(task.title);
                    setDescription(task.description);
                    setDueDate(task.due_date || '');
                    setPriority(task.priority);
                    setLinkedBillId(task.linked_bill_id || '');
                    setLinkedCaseId(task.linked_case_id || '');
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{task.title}</h3>
                {task.description && <p className="text-gray-600">{task.description}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-lg font-medium ${getStatusColor(task.status)}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Priority</p>
                  <span className={`inline-block px-3 py-1 rounded-lg font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
              </div>

              {task.due_date && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Due Date</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-900">{new Date(task.due_date).toLocaleDateString()}</span>
                  </div>
                </div>
              )}

              {(task.linked_bill_id || task.linked_case_id) && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Linked To</p>
                  <div className="flex flex-col gap-1">
                    {task.linked_bill_id && (
                      <div className="flex items-center gap-2 text-blue-600">
                        <Link2 className="w-4 h-4" />
                        <span>Bill: {bills.find(b => b.id === task.linked_bill_id)?.title || 'Unknown'}</span>
                      </div>
                    )}
                    {task.linked_case_id && (
                      <div className="flex items-center gap-2 text-blue-600">
                        <Link2 className="w-4 h-4" />
                        <span>Case: {cases.find(c => c.id === task.linked_case_id)?.title || 'Unknown'}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-4">
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Edit Task
                </button>

                {task.status === 'pending' && (
                  <button
                    onClick={() => {
                      onStatusChange(task.id, 'in_progress');
                      onClose();
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Start Task
                  </button>
                )}

                {task.status === 'in_progress' && (
                  <button
                    onClick={() => {
                      onStatusChange(task.id, 'completed');
                      onClose();
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Mark Complete
                  </button>
                )}

                {task.status === 'completed' && (
                  <button
                    onClick={() => {
                      onStatusChange(task.id, 'pending');
                      onClose();
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Reopen Task
                  </button>
                )}

                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this task?')) {
                      onDelete(task.id);
                    }
                  }}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Delete Task
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
