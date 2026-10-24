import React, { useState } from 'react';
import { Plus, Check, X, Edit2, Trash2, CheckSquare, Square, AlertCircle } from 'lucide-react';
import type { PlanorEvent, Task, TaskStatus } from '../../types';
import { useEventStore } from '../../store/eventStore';
import { getEffectiveTaskStatus, daysUntilEvent } from '../../utils/helpers';
import ConfirmDialog from '../ui/ConfirmDialog';

const PRIORITIES = ['high', 'medium', 'low'] as const;
const STATUSES: TaskStatus[] = ['pending', 'in-progress', 'completed', 'overdue'];

const emptyTask = (): Omit<Task, 'id'> => ({
  title: '',
  description: '',
  dueDate: '',
  status: 'pending',
  category: 'General',
  priority: 'medium',
  isAiGenerated: false,
});

interface ChecklistTabProps {
  event: PlanorEvent;
}

const ChecklistTab: React.FC<ChecklistTabProps> = ({ event }) => {
  const { addTask, updateTask, deleteTask, toggleTaskStatus } = useEventStore();
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Omit<Task, 'id'>>(emptyTask());
  const [editDraft, setEditDraft] = useState<Partial<Task>>({});
  const [filter, setFilter] = useState<'all' | TaskStatus>('all');

  const { tasks } = event;
  const today = new Date().toISOString().split('T')[0];

  const filtered = tasks.filter((t) => {
    if (filter === 'all') return true;
    const effective = getEffectiveTaskStatus(t);
    return effective === filter || t.status === filter;
  });

  const counts = {
    all: tasks.length,
    pending: tasks.filter((t) => getEffectiveTaskStatus(t) === 'pending').length,
    'in-progress': tasks.filter((t) => t.status === 'in-progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    overdue: tasks.filter((t) => getEffectiveTaskStatus(t) === 'overdue').length,
  };

  const handleAdd = () => {
    if (!draft.title.trim() || !draft.dueDate) return;
    addTask(event.id, draft);
    setDraft(emptyTask());
    setAdding(false);
  };

  const handleEditSave = () => {
    if (editId && editDraft.title?.trim()) {
      updateTask(event.id, editId, editDraft);
      setEditId(null);
      setEditDraft({});
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      deleteTask(event.id, deleteId);
      setDeleteId(null);
    }
  };

  const completedPct = tasks.length > 0 ? Math.round((counts.completed / tasks.length) * 100) : 0;

  const priorityDot = { high: 'bg-red-400', medium: 'bg-amber-400', low: 'bg-emerald-400' };
  const statusBadge: Record<string, string> = {
    completed: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30',
    overdue: 'text-red-300 bg-red-500/10 border-red-500/30',
    'in-progress': 'text-amber-300 bg-amber-500/10 border-amber-500/30',
    pending: 'text-white/40 bg-white/5 border-white/10',
  };

  return (
    <div className="space-y-5 slide-in-up">
      {/* Progress */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-display font-semibold text-white">Task Progress</h3>
            <p className="text-xs text-white/40 mt-0.5">
              {counts.completed}/{tasks.length} tasks completed
              {counts.overdue > 0 && (
                <span className="text-red-400 ml-2">· {counts.overdue} overdue</span>
              )}
            </p>
          </div>
          <span className="text-3xl font-display font-bold gradient-text">{completedPct}%</span>
        </div>
        <div className="progress-bar h-3">
          <div
            className="progress-fill h-full bg-gradient-to-r from-emerald-500 to-teal-400"
            style={{ width: `${completedPct}%` }}
          />
        </div>
      </div>

      {/* Filter tabs + Add button */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto" role="tablist" aria-label="Filter tasks">
          {(['all', 'pending', 'in-progress', 'overdue', 'completed'] as const).map((f) => (
            <button
              key={f}
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                filter === f
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              {f === 'all' ? 'All' : f.replace('-', ' ')}
              <span className={`ml-1 ${filter === f ? 'text-violet-400' : 'text-white/20'}`}>
                ({counts[f] ?? 0})
              </span>
            </button>
          ))}
        </div>
        <button
          onClick={() => { setAdding(true); setDraft(emptyTask()); }}
          className="btn-secondary text-xs gap-1.5 flex-shrink-0"
          aria-label="Add new task"
        >
          <Plus size={14} /> Add Task
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {/* Add new task form */}
        {adding && (
          <div className="card p-4 border border-violet-500/30 bg-violet-500/5 space-y-3 slide-in-up">
            <h4 className="text-sm font-semibold text-white">New Task</h4>
            <input
              className="input"
              placeholder="Task title *"
              value={draft.title}
              autoFocus
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
            />
            <input
              className="input"
              placeholder="Description (optional)"
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
            />
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label text-xs">Due Date *</label>
                <input
                  type="date"
                  className="input text-sm"
                  value={draft.dueDate}
                  min={today}
                  onChange={(e) => setDraft((d) => ({ ...d, dueDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="label text-xs">Priority</label>
                <select className="select text-sm" value={draft.priority} onChange={(e) => setDraft((d) => ({ ...d, priority: e.target.value as Task['priority'] }))}>
                  {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="label text-xs">Category</label>
                <input className="input text-sm" placeholder="e.g. Venue" value={draft.category} onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setAdding(false)} className="btn-ghost text-xs gap-1"><X size={12} /> Cancel</button>
              <button onClick={handleAdd} className="btn-primary text-xs gap-1" disabled={!draft.title.trim() || !draft.dueDate}>
                <Check size={12} /> Add Task
              </button>
            </div>
          </div>
        )}

        {filtered.length === 0 && !adding && (
          <div className="empty-state py-12">
            <CheckSquare size={40} className="text-white/20 mb-4" />
            <p className="text-white/40 text-sm">No tasks {filter !== 'all' ? `with "${filter}" status` : 'yet'}</p>
            <p className="text-white/30 text-xs mt-1">Generate a plan or add tasks manually.</p>
          </div>
        )}

        {filtered.map((task) => {
          const effectiveStatus = getEffectiveTaskStatus(task);
          const days = daysUntilEvent(task.dueDate);
          const isEditing = editId === task.id;

          return (
            <div
              key={task.id}
              className={`card p-4 transition-all duration-200 ${
                effectiveStatus === 'overdue' ? 'border-red-500/20' :
                effectiveStatus === 'completed' ? 'opacity-70' : ''
              }`}
            >
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    className="input"
                    value={editDraft.title ?? task.title}
                    onChange={(e) => setEditDraft((d) => ({ ...d, title: e.target.value }))}
                    autoFocus
                  />
                  <input
                    className="input"
                    placeholder="Description"
                    value={editDraft.description ?? task.description}
                    onChange={(e) => setEditDraft((d) => ({ ...d, description: e.target.value }))}
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <input type="date" className="input text-sm" value={editDraft.dueDate ?? task.dueDate} onChange={(e) => setEditDraft((d) => ({ ...d, dueDate: e.target.value }))} />
                    <select className="select text-sm" value={editDraft.priority ?? task.priority} onChange={(e) => setEditDraft((d) => ({ ...d, priority: e.target.value as Task['priority'] }))}>
                      {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <select className="select text-sm" value={editDraft.status ?? task.status} onChange={(e) => setEditDraft((d) => ({ ...d, status: e.target.value as TaskStatus }))}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditId(null)} className="btn-ghost text-xs gap-1"><X size={12} /> Cancel</button>
                    <button onClick={handleEditSave} className="btn-primary text-xs gap-1"><Check size={12} /> Save</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleTaskStatus(event.id, task.id)}
                    className="flex-shrink-0 mt-0.5 text-white/40 hover:text-emerald-400 transition-colors"
                    aria-label={effectiveStatus === 'completed' ? 'Mark as pending' : 'Mark as completed'}
                    aria-pressed={effectiveStatus === 'completed'}
                  >
                    {effectiveStatus === 'completed'
                      ? <CheckSquare size={18} className="text-emerald-400" />
                      : <Square size={18} />
                    }
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 justify-between">
                      <p className={`text-sm font-medium ${effectiveStatus === 'completed' ? 'line-through text-white/40' : 'text-white'}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityDot[task.priority]}`} title={`${task.priority} priority`} />
                        <button onClick={() => { setEditId(task.id); setEditDraft({ ...task }); }} className="btn-ghost p-1" aria-label={`Edit ${task.title}`}>
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => setDeleteId(task.id)} className="btn-ghost p-1 hover:text-red-400" aria-label={`Delete ${task.title}`}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {task.description && (
                      <p className="text-xs text-white/50 mt-1">{task.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className={`badge border text-xs ${statusBadge[effectiveStatus] ?? statusBadge.pending}`}>
                        {effectiveStatus}
                      </span>
                      <span className="text-xs text-white/30">{task.category}</span>
                      <span className="text-xs text-white/30">
                        Due: {new Date(task.dueDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {effectiveStatus !== 'completed' && (
                          <span className={days < 0 ? 'text-red-400 ml-1' : days <= 7 ? 'text-amber-400 ml-1' : 'ml-1'}>
                            ({days >= 0 ? `in ${days}d` : `${Math.abs(days)}d late`})
                          </span>
                        )}
                      </span>
                      {task.isAiGenerated && <span className="badge-ai text-xs">AI</span>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Task"
        message="Are you sure you want to remove this task? This cannot be undone."
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default ChecklistTab;
