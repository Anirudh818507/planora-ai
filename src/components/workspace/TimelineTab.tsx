import React from 'react';
import { Clock, CheckCircle, AlertCircle, Circle } from 'lucide-react';
import type { PlanorEvent } from '../../types';
import { daysUntilEvent, getEffectiveTaskStatus } from '../../utils/helpers';

interface TimelineTabProps {
  event: PlanorEvent;
}

const TimelineTab: React.FC<TimelineTabProps> = ({ event }) => {
  const { tasks, formData, plan } = event;

  // Merge tasks and schedule items into a unified timeline
  const eventDate = new Date(formData.date + 'T00:00:00');

  // Group tasks by relative time buckets
  const buckets = {
    overdue: [] as typeof tasks,
    thisWeek: [] as typeof tasks,
    thisMonth: [] as typeof tasks,
    later: [] as typeof tasks,
    completed: [] as typeof tasks,
  };

  tasks.forEach((task) => {
    const effectiveStatus = getEffectiveTaskStatus(task);
    if (effectiveStatus === 'completed') {
      buckets.completed.push(task);
    } else if (effectiveStatus === 'overdue') {
      buckets.overdue.push(task);
    } else {
      const days = daysUntilEvent(task.dueDate);
      if (days <= 7) buckets.thisWeek.push(task);
      else if (days <= 30) buckets.thisMonth.push(task);
      else buckets.later.push(task);
    }
  });

  // Sort each bucket by dueDate
  Object.values(buckets).forEach((b) =>
    b.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
  );

  const TaskItem: React.FC<{ task: (typeof tasks)[0] }> = ({ task }) => {
    const effectiveStatus = getEffectiveTaskStatus(task);
    const days = daysUntilEvent(task.dueDate);
    const daysText = days > 0 ? `in ${days} days` : days === 0 ? 'today' : `${Math.abs(days)} days ago`;

    const statusIcon = {
      completed: <CheckCircle size={18} className="text-emerald-400" />,
      overdue: <AlertCircle size={18} className="text-red-400" />,
      'in-progress': <Clock size={18} className="text-amber-400" />,
      pending: <Circle size={18} className="text-white/30" />,
    }[effectiveStatus] ?? <Circle size={18} className="text-white/30" />;

    const priorityColor = {
      high: 'bg-red-400',
      medium: 'bg-amber-400',
      low: 'bg-emerald-400',
    }[task.priority];

    return (
      <div className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 ${
        effectiveStatus === 'overdue'
          ? 'bg-red-500/5 border-red-500/20'
          : effectiveStatus === 'completed'
          ? 'bg-white/3 border-white/5 opacity-60'
          : 'bg-white/3 border-white/8 hover:bg-white/5'
      }`}>
        <div className="flex-shrink-0 mt-0.5">{statusIcon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm font-medium ${effectiveStatus === 'completed' ? 'line-through text-white/40' : 'text-white'}`}>
              {task.title}
            </p>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityColor}`} title={`${task.priority} priority`} />
              <span className="text-xs text-white/30 font-mono whitespace-nowrap">{daysText}</span>
            </div>
          </div>
          {task.description && (
            <p className="text-xs text-white/50 mt-1 leading-relaxed">{task.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded">{task.category}</span>
            <span className="text-xs text-white/30">
              Due: {new Date(task.dueDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            {task.isAiGenerated && <span className="badge-ai text-xs">AI</span>}
          </div>
        </div>
      </div>
    );
  };

  const BucketSection: React.FC<{
    title: string;
    tasks: typeof buckets.overdue;
    color: string;
    emptyText?: string;
  }> = ({ title, tasks, color, emptyText }) => {
    if (tasks.length === 0 && !emptyText) return null;
    return (
      <div>
        <h3 className={`text-sm font-semibold ${color} mb-3 flex items-center gap-2`}>
          <span className={`inline-block w-2 h-2 rounded-full ${color.replace('text-', 'bg-')}`} />
          {title}
          <span className="text-white/30 font-normal">({tasks.length})</span>
        </h3>
        {tasks.length === 0 && emptyText ? (
          <p className="text-white/30 text-xs pl-4">{emptyText}</p>
        ) : (
          <div className="space-y-2 pl-0">
            {tasks.map((task) => <TaskItem key={task.id} task={task} />)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 slide-in-up">
      {/* Event date banner */}
      <div className="card p-4 flex items-center gap-4 border border-violet-500/20">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-coral-500 flex flex-col items-center justify-center text-white flex-shrink-0">
          <span className="text-xs font-medium">
            {eventDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
          </span>
          <span className="text-2xl font-bold leading-none">{eventDate.getDate()}</span>
        </div>
        <div>
          <p className="text-white font-semibold">{formData.name}</p>
          <p className="text-white/50 text-sm">{eventDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p className="text-violet-300 text-xs mt-1">
            {daysUntilEvent(formData.date) > 0
              ? `${daysUntilEvent(formData.date)} days to go`
              : daysUntilEvent(formData.date) === 0
              ? '🎉 Event day!'
              : 'Event has passed'}
          </p>
        </div>
      </div>

      {/* Task buckets */}
      {tasks.length === 0 ? (
        <div className="empty-state">
          <Clock size={40} className="text-white/20 mb-4" />
          <p className="text-white/50 text-sm">No tasks in the timeline yet.</p>
          <p className="text-white/30 text-xs mt-1">Generate a plan or add tasks in the Checklist tab.</p>
        </div>
      ) : (
        <>
          <BucketSection title="Overdue" tasks={buckets.overdue} color="text-red-400" />
          <BucketSection title="This Week" tasks={buckets.thisWeek} color="text-amber-400" emptyText="No tasks due this week" />
          <BucketSection title="This Month" tasks={buckets.thisMonth} color="text-violet-400" />
          <BucketSection title="Upcoming" tasks={buckets.later} color="text-blue-400" />
          <BucketSection title="Completed" tasks={buckets.completed} color="text-emerald-400" />
        </>
      )}

      {/* Day-of schedule */}
      {plan && plan.schedule.length > 0 && (
        <div className="card p-5">
          <h3 className="font-display font-semibold text-white mb-4">Day-Of Schedule</h3>
          <div className="space-y-0 relative">
            <div className="absolute left-[22px] top-0 bottom-0 w-px bg-gradient-to-b from-violet-500/50 via-coral-500/30 to-transparent" aria-hidden="true" />
            {plan.schedule.map((item, i) => (
              <div key={item.id} className="flex gap-4 pb-5 last:pb-0">
                <div className="relative z-10 flex-shrink-0 w-11 h-11 rounded-full bg-[#1a1752] border border-violet-500/40 flex items-center justify-center text-xs font-bold text-violet-300">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="flex-1 pt-2">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-mono text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded">
                      {item.time}
                    </span>
                    <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                    <span className="text-xs text-white/30">{item.duration}m</span>
                  </div>
                  <p className="text-xs text-white/50">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineTab;
