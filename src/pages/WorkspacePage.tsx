import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, DollarSign, Clock, CheckSquare,
  Store, MessageSquare, ArrowLeft, AlertTriangle,
  Download, Printer
} from 'lucide-react';
import { useEventStore } from '../store/eventStore';
import { formatCurrency, daysUntilEvent, eventTypeLabels, downloadCSV } from '../utils/helpers';
import OverviewTab from '../components/workspace/OverviewTab';
import BudgetTab from '../components/workspace/BudgetTab';
import TimelineTab from '../components/workspace/TimelineTab';
import ChecklistTab from '../components/workspace/ChecklistTab';
import VendorsTab from '../components/workspace/VendorsTab';
import CopilotPanel from '../components/workspace/CopilotPanel';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'budget', label: 'Budget', icon: DollarSign },
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'checklist', label: 'Checklist', icon: CheckSquare },
  { id: 'vendors', label: 'Vendors', icon: Store },
  { id: 'copilot', label: 'AI Copilot', icon: MessageSquare },
];

const WorkspacePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { events, setCurrentEvent } = useEventStore();
  const [activeTab, setActiveTab] = useState('overview');

  const event = events.find((e) => e.id === id);

  useEffect(() => {
    if (id) setCurrentEvent(id);
  }, [id, setCurrentEvent]);

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-xl font-display font-semibold text-white mb-2">Event Not Found</h2>
        <p className="text-white/50 text-sm mb-6">This event may have been deleted or the link is invalid.</p>
        <button onClick={() => navigate('/dashboard')} className="btn-primary">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>
    );
  }

  const days = daysUntilEvent(event.formData.date);
  const totalEstimated = event.budgetItems.reduce((s, b) => s + b.estimated, 0);
  const _totalActual = event.budgetItems.reduce((s, b) => s + b.actual, 0);
  const isOverBudget = totalEstimated > event.formData.budget;
  const completedTasks = event.tasks.filter((t) => t.status === 'completed').length;

  const handleExportCSV = () => {
    const budgetRows = event.budgetItems.map((b) => ({
      Type: 'Budget',
      Category: b.category,
      Label: b.label,
      Estimated: b.estimated,
      Actual: b.actual,
      Notes: b.notes,
    }));
    const taskRows = event.tasks.map((t) => ({
      Type: 'Task',
      Category: t.category,
      Label: t.title,
      DueDate: t.dueDate,
      Status: t.status,
      Priority: t.priority,
    }));
    downloadCSV([...budgetRows, ...taskRows], `${event.formData.name.replace(/\s+/g, '_')}_plan.csv`);
  };

  const handlePrint = () => window.print();

  return (
    <div className="max-w-6xl mx-auto animate-in">
      {/* Event Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-ghost p-2 mt-0.5 flex-shrink-0"
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-white/40 text-sm">{eventTypeLabels[event.formData.type]}</span>
              {event.plan?.isDemo && <span className="badge-demo">⚡ Demo Plan</span>}
              {event.plan && !event.plan.isDemo && <span className="badge-ai">✨ AI Generated</span>}
            </div>
            <h1 className="text-2xl font-display font-bold text-white leading-tight">
              {event.formData.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-white/50">
              <span>📍 {event.formData.location}</span>
              <span>👥 {event.formData.guestCount} guests</span>
              <span className={days >= 0 ? 'text-violet-300' : 'text-amber-400'}>
                📅 {days > 0 ? `${days} days away` : days === 0 ? 'Today!' : `${Math.abs(days)} days ago`}
              </span>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="card px-4 py-2.5 text-center">
            <p className="text-xs text-white/40 mb-0.5">Budget</p>
            <p className={`text-sm font-bold ${isOverBudget ? 'text-amber-400' : 'text-white'}`}>
              {formatCurrency(event.formData.budget, event.formData.currency)}
            </p>
          </div>
          <div className="card px-4 py-2.5 text-center">
            <p className="text-xs text-white/40 mb-0.5">Tasks Done</p>
            <p className="text-sm font-bold text-emerald-400">
              {completedTasks}/{event.tasks.length}
            </p>
          </div>
          <div className="flex gap-1 no-print">
            <button onClick={handleExportCSV} className="btn-ghost p-2" title="Export to CSV" aria-label="Export plan to CSV">
              <Download size={16} />
            </button>
            <button onClick={handlePrint} className="btn-ghost p-2" title="Print plan" aria-label="Print event plan">
              <Printer size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Budget overflow warning */}
      {isOverBudget && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 mb-5" role="alert" aria-live="polite">
          <AlertTriangle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-300 text-sm font-semibold">Budget Overflow Detected</p>
            <p className="text-amber-400/70 text-xs mt-0.5">
              Estimated spend ({formatCurrency(totalEstimated, event.formData.currency)}) exceeds your budget of {formatCurrency(event.formData.budget, event.formData.currency)} by{' '}
              {formatCurrency(totalEstimated - event.formData.budget, event.formData.currency)}.
              Visit the Budget tab to adjust allocations or see trade-off suggestions.
            </p>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1 no-print" role="tablist" aria-label="Event workspace sections">
        {TABS.map(({ id: tabId, label, icon: Icon }) => (
          <button
            key={tabId}
            role="tab"
            aria-selected={activeTab === tabId}
            aria-controls={`tab-panel-${tabId}`}
            onClick={() => setActiveTab(tabId)}
            className={activeTab === tabId ? 'tab-active flex items-center gap-2' : 'tab flex items-center gap-2'}
            id={`tab-${tabId}`}
          >
            <Icon size={15} aria-hidden="true" />
            <span>{label}</span>
            {tabId === 'copilot' && (
              <span className="badge-ai text-xs px-1.5 py-0">AI</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div id={`tab-panel-${activeTab}`} role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
        {activeTab === 'overview' && <OverviewTab event={event} onTabChange={setActiveTab} />}
        {activeTab === 'budget' && <BudgetTab event={event} />}
        {activeTab === 'timeline' && <TimelineTab event={event} />}
        {activeTab === 'checklist' && <ChecklistTab event={event} />}
        {activeTab === 'vendors' && <VendorsTab event={event} />}
        {activeTab === 'copilot' && <CopilotPanel event={event} />}
      </div>
    </div>
  );
};

export default WorkspacePage;
