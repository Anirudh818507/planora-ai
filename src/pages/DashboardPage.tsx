import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Calendar, Users, DollarSign, Trash2, Copy,
  TrendingUp, CheckSquare, Clock, Sparkles, AlertTriangle
} from 'lucide-react';
import { useEventStore } from '../store/eventStore';
import { formatCurrency, daysUntilEvent, eventTypeLabels, eventTypeGradients } from '../utils/helpers';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { events, deleteEvent, duplicateEvent, setCurrentEvent } = useEventStore();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleOpen = (id: string) => {
    setCurrentEvent(id);
    navigate(`/event/${id}`);
  };

  const handleDuplicate = (id: string) => {
    const copy = duplicateEvent(id);
    navigate(`/event/${copy.id}`);
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      deleteEvent(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-title text-2xl md:text-3xl">My Events</h1>
          <p className="section-subtitle">
            {events.length === 0
              ? 'No events yet — create your first celebration'
              : `${events.length} event${events.length !== 1 ? 's' : ''} · All data stored locally`}
          </p>
        </div>
        <button
          onClick={() => navigate('/create')}
          className="btn-primary"
          aria-label="Create new event"
          id="dashboard-create-btn"
        >
          <Plus size={16} />
          New Event
        </button>
      </div>

      {/* Empty state */}
      {events.length === 0 && (
        <div className="empty-state">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-coral-500/20 to-violet-500/20 border border-violet-500/20 flex items-center justify-center mb-6">
            <Sparkles size={36} className="text-violet-400" />
          </div>
          <h2 className="text-xl font-display font-semibold text-white mb-3">
            Start Planning Your First Event
          </h2>
          <p className="text-white/50 text-sm max-w-sm mb-8">
            Create an AI-powered event plan for weddings, birthdays, college events, and more.
          </p>
          <button
            onClick={() => navigate('/create')}
            className="btn-primary"
            id="empty-state-cta"
          >
            <Plus size={16} />
            Create My First Event
          </button>
        </div>
      )}

      {/* Event Cards Grid */}
      {events.length > 0 && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {events.map((event) => {
            const days = daysUntilEvent(event.formData.date);
            const totalBudget = event.formData.budget;
            const spent = event.budgetItems.reduce((s, b) => s + b.actual, 0);
            const estimated = event.budgetItems.reduce((s, b) => s + b.estimated, 0);
            const spentPct = totalBudget > 0 ? Math.min((spent / totalBudget) * 100, 100) : 0;
            const estPct = totalBudget > 0 ? Math.min((estimated / totalBudget) * 100, 100) : 0;
            const completedTasks = event.tasks.filter((t) => t.status === 'completed').length;
            const totalTasks = event.tasks.length;
            const taskPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            const isOverBudget = estimated > totalBudget;
            const gradient = eventTypeGradients[event.formData.type] || 'from-violet-500 to-coral-500';
            const typeLabel = eventTypeLabels[event.formData.type] || event.formData.type;

            return (
              <article
                key={event.id}
                className="card-hover p-5 flex flex-col gap-4 cursor-pointer group"
                onClick={() => handleOpen(event.id)}
                role="article"
                aria-label={`Event: ${event.formData.name}`}
              >
                {/* Card header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r ${gradient} bg-opacity-20 text-white text-xs font-medium mb-2`}>
                      <span>{typeLabel}</span>
                    </div>
                    <h2 className="font-display font-semibold text-white text-base leading-tight truncate">
                      {event.formData.name}
                    </h2>
                  </div>
                  <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDuplicate(event.id); }}
                      className="btn-ghost p-1.5"
                      title="Duplicate event"
                      aria-label={`Duplicate ${event.formData.name}`}
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteId(event.id); }}
                      className="btn-ghost p-1.5 hover:text-red-400"
                      title="Delete event"
                      aria-label={`Delete ${event.formData.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Meta */}
                <div className="grid grid-cols-2 gap-2 text-xs text-white/50">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={12} className="text-violet-400 flex-shrink-0" />
                    <span className="truncate">
                      {days > 0 ? `${days} days away` : days === 0 ? 'Today!' : `${Math.abs(days)} days ago`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users size={12} className="text-coral-400 flex-shrink-0" />
                    <span>{event.formData.guestCount} guests</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <DollarSign size={12} className="text-gold-400 flex-shrink-0" />
                    <span>{formatCurrency(totalBudget, event.formData.currency)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} className="text-emerald-400 flex-shrink-0" />
                    <span>{new Date(event.formData.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>

                <div className="divider !my-0" />

                {/* Budget progress */}
                <div>
                  <div className="flex justify-between text-xs text-white/40 mb-1.5">
                    <span className="flex items-center gap-1">
                      <TrendingUp size={11} />
                      Budget Used
                      {isOverBudget && (
                        <AlertTriangle size={11} className="text-amber-400 ml-1" />
                      )}
                    </span>
                    <span className={isOverBudget ? 'text-amber-400' : ''}>
                      {formatCurrency(spent, event.formData.currency)} / {formatCurrency(totalBudget, event.formData.currency)}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className={`progress-fill ${isOverBudget ? 'bg-amber-500' : 'bg-gradient-to-r from-violet-500 to-coral-500'}`}
                      style={{ width: `${spentPct}%` }}
                    />
                  </div>
                </div>

                {/* Task progress */}
                <div>
                  <div className="flex justify-between text-xs text-white/40 mb-1.5">
                    <span className="flex items-center gap-1">
                      <CheckSquare size={11} />
                      Tasks
                    </span>
                    <span>{completedTasks}/{totalTasks} done ({taskPct}%)</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill bg-emerald-500"
                      style={{ width: `${taskPct}%` }}
                    />
                  </div>
                </div>

                {/* Plan status */}
                <div className="flex items-center justify-between text-xs">
                  <span className={event.plan ? 'badge-ai' : 'badge text-white/40 bg-white/5 border-white/10'}>
                    {event.plan
                      ? (event.plan.isDemo ? '⚡ Demo Plan' : '✨ AI Plan')
                      : '○ No plan yet'}
                  </span>
                  <span className="text-white/30">
                    Updated {new Date(event.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </article>
            );
          })}

          {/* Add new card */}
          <button
            onClick={() => navigate('/create')}
            className="card border-dashed border-2 border-white/10 hover:border-violet-500/40 flex flex-col items-center justify-center gap-3 min-h-[200px] text-white/30 hover:text-violet-400 transition-all duration-200 group"
            aria-label="Create a new event"
          >
            <div className="w-12 h-12 rounded-2xl border-2 border-dashed border-current flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus size={24} />
            </div>
            <span className="text-sm font-medium">New Event</span>
          </button>
        </div>
      )}

      {/* Confirm delete dialog */}
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Event"
        message="Are you sure you want to delete this event? All tasks, budget items, and vendor data will be permanently removed. This cannot be undone."
        confirmLabel="Delete Event"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default DashboardPage;
