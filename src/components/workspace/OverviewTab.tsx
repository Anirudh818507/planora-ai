import React from 'react';
import {
  Calendar, Users, DollarSign, CheckSquare,
  TrendingUp, Clock, AlertTriangle, Sparkles, ChevronRight,
  FileText, Star
} from 'lucide-react';
import type { PlanorEvent } from '../../types';
import { formatCurrency, daysUntilEvent, getEffectiveTaskStatus, categoryColors } from '../../utils/helpers';

interface OverviewTabProps {
  event: PlanorEvent;
  onTabChange: (tab: string) => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ event, onTabChange }) => {
  const { formData, plan, tasks, budgetItems } = event;
  const days = daysUntilEvent(formData.date);
  const totalBudget = formData.budget;
  const totalEstimated = budgetItems.reduce((s, b) => s + b.estimated, 0);
  const totalActual = budgetItems.reduce((s, b) => s + b.actual, 0);
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const overdueTasks = tasks.filter((t) => getEffectiveTaskStatus(t) === 'overdue').length;
  const upcomingTasks = tasks
    .filter((t) => getEffectiveTaskStatus(t) === 'pending')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);
  const isOverBudget = totalEstimated > totalBudget;

  return (
    <div className="space-y-6 slide-in-up">
      {/* Demo/AI banner */}
      {plan?.isDemo && (
        <div className="demo-banner">
          <Sparkles size={14} className="flex-shrink-0" />
          <span>
            <strong>Demo Plan</strong> — This plan was generated using pre-built templates, not a live AI model.
            Content is illustrative. Configure your Gemini API key in Settings to generate a real AI plan.
          </span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: Calendar,
            label: 'Days Away',
            value: days >= 0 ? days : '—',
            sub: days >= 0 ? (days === 0 ? 'Today!' : 'until event') : 'Event passed',
            color: 'text-violet-400',
            bg: 'bg-violet-500/10 border-violet-500/20',
          },
          {
            icon: Users,
            label: 'Guest Count',
            value: formData.guestCount,
            sub: 'invited',
            color: 'text-coral-400',
            bg: 'bg-coral-500/10 border-coral-500/20',
          },
          {
            icon: CheckSquare,
            label: 'Tasks Done',
            value: `${completedTasks}/${tasks.length}`,
            sub: overdueTasks > 0 ? `${overdueTasks} overdue` : 'on track',
            color: overdueTasks > 0 ? 'text-amber-400' : 'text-emerald-400',
            bg: overdueTasks > 0 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20',
          },
          {
            icon: DollarSign,
            label: 'Budget Spent',
            value: formatCurrency(totalActual, formData.currency),
            sub: `of ${formatCurrency(totalBudget, formData.currency)}`,
            color: isOverBudget ? 'text-amber-400' : 'text-gold-400',
            bg: isOverBudget ? 'bg-amber-500/10 border-amber-500/20' : 'bg-gold-500/10 border-gold-500/20',
          },
        ].map(({ icon: Icon, label, value, sub, color, bg }) => (
          <div key={label} className={`card border p-4 ${bg}`}>
            <div className="flex items-start justify-between mb-2">
              <Icon size={18} className={color} />
            </div>
            <div className={`text-2xl font-display font-bold ${color} mb-0.5`}>{value}</div>
            <div className="text-xs text-white/40">{label}</div>
            <div className={`text-xs ${color} opacity-70`}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Budget overview */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-white">Budget Overview</h2>
          <button onClick={() => onTabChange('budget')} className="btn-ghost text-xs gap-1">
            View Budget <ChevronRight size={12} />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4 text-center">
          <div>
            <p className="text-xs text-white/40 mb-1">Estimated</p>
            <p className={`text-lg font-bold ${isOverBudget ? 'text-amber-400' : 'text-white'}`}>
              {formatCurrency(totalEstimated, formData.currency)}
            </p>
          </div>
          <div>
            <p className="text-xs text-white/40 mb-1">Actual Spent</p>
            <p className="text-lg font-bold text-emerald-400">{formatCurrency(totalActual, formData.currency)}</p>
          </div>
          <div>
            <p className="text-xs text-white/40 mb-1">Remaining</p>
            <p className={`text-lg font-bold ${totalBudget - totalEstimated < 0 ? 'text-red-400' : 'text-white'}`}>
              {formatCurrency(totalBudget - totalEstimated, formData.currency)}
            </p>
          </div>
        </div>

        {/* Category bar chart */}
        {budgetItems.length > 0 && (
          <div className="space-y-2">
            {budgetItems.slice(0, 6).map((item) => {
              const pct = totalBudget > 0 ? Math.min((item.estimated / totalBudget) * 100, 100) : 0;
              const color = categoryColors[item.category] ?? '#8b5cf6';
              return (
                <div key={item.id}>
                  <div className="flex justify-between text-xs text-white/50 mb-1">
                    <span>{item.label}</span>
                    <span>{formatCurrency(item.estimated, formData.currency)}</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {isOverBudget && (
          <div className="flex items-center gap-2 mt-4 text-xs text-amber-400">
            <AlertTriangle size={12} />
            <span>Estimated spend exceeds budget by {formatCurrency(totalEstimated - totalBudget, formData.currency)}. Consider adjusting allocations.</span>
          </div>
        )}
      </div>

      {/* Two-column: Summary + Upcoming tasks */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Plan summary */}
        {plan && (
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-semibold text-white flex items-center gap-2">
                <FileText size={16} className="text-violet-400" />
                Plan Summary
              </h2>
              {plan.isDemo && <span className="badge-demo text-xs">Demo</span>}
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-4">{plan.summary}</p>

            {plan.themeRecommendations.length > 0 && (
              <div>
                <p className="text-xs text-white/40 mb-2 flex items-center gap-1">
                  <Star size={10} /> Theme Recommendations
                </p>
                <ul className="space-y-1.5">
                  {plan.themeRecommendations.slice(0, 3).map((theme, i) => (
                    <li key={i} className="text-xs text-white/60 flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-violet-500/20 text-violet-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                      {theme}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {plan.tradeOffs.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-white/40 mb-2 flex items-center gap-1">
                  <TrendingUp size={10} /> Cost-Saving Tips
                </p>
                <ul className="space-y-1.5">
                  {plan.tradeOffs.slice(0, 2).map((tip, i) => (
                    <li key={i} className="text-xs text-white/60 flex items-start gap-2">
                      <span className="text-gold-400 flex-shrink-0">💡</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Upcoming tasks */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-white flex items-center gap-2">
              <Clock size={16} className="text-coral-400" />
              Upcoming Tasks
            </h2>
            <button onClick={() => onTabChange('checklist')} className="btn-ghost text-xs gap-1">
              View All <ChevronRight size={12} />
            </button>
          </div>
          {upcomingTasks.length === 0 ? (
            <div className="empty-state py-8">
              <CheckSquare size={32} className="text-white/20 mb-3" />
              <p className="text-white/40 text-sm">No pending tasks</p>
              <p className="text-white/30 text-xs">All tasks completed or none added yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingTasks.map((task) => {
                const taskDays = daysUntilEvent(task.dueDate);
                return (
                  <div key={task.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      task.priority === 'high' ? 'bg-red-400' :
                      task.priority === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{task.title}</p>
                      <p className="text-xs text-white/40 mt-0.5">
                        {taskDays > 0 ? `Due in ${taskDays} days` : taskDays === 0 ? 'Due today' : `${Math.abs(taskDays)} days overdue`}
                        {' · '}{task.category}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Schedule preview */}
      {plan && plan.schedule.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-white">Day-Of Schedule</h2>
            <button onClick={() => onTabChange('timeline')} className="btn-ghost text-xs gap-1">
              Full Timeline <ChevronRight size={12} />
            </button>
          </div>
          <div className="space-y-0">
            {plan.schedule.slice(0, 6).map((item, i) => (
              <div key={item.id} className="flex gap-4 relative">
                {/* Timeline line */}
                {i < plan.schedule.slice(0, 6).length - 1 && (
                  <div className="absolute left-[28px] top-8 bottom-0 w-px bg-white/10" aria-hidden="true" />
                )}
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-xs text-violet-300 font-bold">
                    {i + 1}
                  </div>
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-mono text-violet-300">{item.time}</span>
                    <span className="text-sm font-medium text-white">{item.title}</span>
                  </div>
                  <p className="text-xs text-white/50">{item.description}</p>
                  <p className="text-xs text-white/30 mt-0.5">{item.duration} min</p>
                </div>
              </div>
            ))}
            {plan.schedule.length > 6 && (
              <button onClick={() => onTabChange('timeline')} className="text-xs text-violet-400 hover:text-violet-300 transition-colors ml-11">
                +{plan.schedule.length - 6} more items →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OverviewTab;
