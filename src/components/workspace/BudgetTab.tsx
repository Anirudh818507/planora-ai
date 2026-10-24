import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Check, X, AlertTriangle, Info } from 'lucide-react';
import type { PlanorEvent, BudgetItem, BudgetCategory } from '../../types';
import { useEventStore } from '../../store/eventStore';
import { formatCurrency, categoryLabels, categoryColors } from '../../utils/helpers';
import ConfirmDialog from '../ui/ConfirmDialog';

const CATEGORIES: BudgetCategory[] = [
  'venue', 'catering', 'decoration', 'entertainment', 'photography',
  'transportation', 'attire', 'flowers', 'stationery', 'technology', 'contingency', 'other'
];

const emptyItem = (): Omit<BudgetItem, 'id'> => ({
  category: 'other',
  label: '',
  estimated: 0,
  actual: 0,
  notes: '',
});

interface BudgetTabProps {
  event: PlanorEvent;
}

const BudgetTab: React.FC<BudgetTabProps> = ({ event }) => {
  const { addBudgetItem, updateBudgetItem, deleteBudgetItem } = useEventStore();
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Omit<BudgetItem, 'id'>>(emptyItem());
  const [editDraft, setEditDraft] = useState<Partial<BudgetItem>>({});

  const { budgetItems, formData, plan } = event;
  const totalEstimated = budgetItems.reduce((s, b) => s + b.estimated, 0);
  const totalActual = budgetItems.reduce((s, b) => s + b.actual, 0);
  const totalBudget = formData.budget;
  const isOverBudget = totalEstimated > totalBudget;
  const remaining = totalBudget - totalEstimated;

  const handleAdd = () => {
    if (!draft.label.trim()) return;
    addBudgetItem(event.id, draft);
    setDraft(emptyItem());
    setAdding(false);
  };

  const handleEditSave = () => {
    if (editId) {
      updateBudgetItem(event.id, editId, editDraft);
      setEditId(null);
      setEditDraft({});
    }
  };

  const startEdit = (item: BudgetItem) => {
    setEditId(item.id);
    setEditDraft({ ...item });
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      deleteBudgetItem(event.id, deleteId);
      setDeleteId(null);
    }
  };

  // Group items by category for donut-style overview
  const categoryTotals = budgetItems.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] ?? 0) + item.estimated;
    return acc;
  }, {});

  return (
    <div className="space-y-5 slide-in-up">
      {/* Budget summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="text-xs text-white/40 mb-1">Total Budget</p>
          <p className="text-xl font-bold text-white">{formatCurrency(totalBudget, formData.currency)}</p>
        </div>
        <div className={`card p-4 text-center border ${isOverBudget ? 'border-amber-500/40' : 'border-transparent'}`}>
          <p className="text-xs text-white/40 mb-1">
            Estimated {isOverBudget && <AlertTriangle size={10} className="inline text-amber-400 ml-1" />}
          </p>
          <p className={`text-xl font-bold ${isOverBudget ? 'text-amber-400' : 'text-white'}`}>
            {formatCurrency(totalEstimated, formData.currency)}
          </p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xs text-white/40 mb-1">Actual Spent</p>
          <p className="text-xl font-bold text-emerald-400">{formatCurrency(totalActual, formData.currency)}</p>
        </div>
      </div>

      {/* Budget bar */}
      <div className="card p-5">
        <div className="flex justify-between text-sm text-white/60 mb-3">
          <span>Budget Allocation</span>
          <span className={remaining < 0 ? 'text-amber-400' : 'text-white/60'}>
            {remaining >= 0
              ? `${formatCurrency(remaining, formData.currency)} remaining`
              : `${formatCurrency(Math.abs(remaining), formData.currency)} over budget`}
          </span>
        </div>

        {/* Stacked bar */}
        <div className="h-8 rounded-xl overflow-hidden flex" role="img" aria-label="Budget allocation chart">
          {Object.entries(categoryTotals).map(([cat, amount]) => {
            const pct = totalBudget > 0 ? (amount / totalBudget) * 100 : 0;
            const color = categoryColors[cat as BudgetCategory] ?? '#8b5cf6';
            return (
              <div
                key={cat}
                style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }}
                title={`${categoryLabels[cat as BudgetCategory] ?? cat}: ${formatCurrency(amount, formData.currency)}`}
                className="transition-all duration-300 hover:opacity-80"
              />
            );
          })}
          {remaining > 0 && (
            <div
              style={{ width: `${(remaining / totalBudget) * 100}%` }}
              className="bg-white/5"
              title="Unallocated budget"
            />
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-3">
          {Object.entries(categoryTotals).map(([cat, amount]) => {
            const color = categoryColors[cat as BudgetCategory] ?? '#8b5cf6';
            return (
              <div key={cat} className="flex items-center gap-1.5 text-xs text-white/50">
                <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
                <span>{categoryLabels[cat as BudgetCategory] ?? cat}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Overflow warning + trade-offs */}
      {isOverBudget && (
        <div className="card p-5 border border-amber-500/30">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-amber-400" />
            <h3 className="font-semibold text-amber-300 text-sm">Budget Overflow — Suggested Trade-Offs</h3>
          </div>
          {plan?.tradeOffs && plan.tradeOffs.length > 0 ? (
            <ul className="space-y-2">
              {plan.tradeOffs.map((tip, i) => (
                <li key={i} className="text-xs text-white/60 flex items-start gap-2">
                  <span className="text-gold-400">💡</span>{tip}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-white/50">
              Consider reducing catering per-head costs, switching from live band to DJ, or booking a Sunday event date.
            </p>
          )}
        </div>
      )}

      {/* Budget note */}
      {plan?.isDemo && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
          <Info size={13} className="flex-shrink-0 mt-0.5" />
          Budget estimates are illustrative demo data. They do not represent actual vendor quotes or guaranteed prices.
        </div>
      )}

      {/* Items table */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="font-display font-semibold text-white">Budget Items</h3>
          <button
            onClick={() => { setAdding(true); setDraft(emptyItem()); }}
            className="btn-secondary text-xs gap-1.5"
            aria-label="Add budget item"
          >
            <Plus size={14} /> Add Item
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Budget items table">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 py-2.5 text-xs text-white/40 font-medium">Category</th>
                <th className="text-left px-4 py-2.5 text-xs text-white/40 font-medium">Label</th>
                <th className="text-right px-4 py-2.5 text-xs text-white/40 font-medium">Estimated</th>
                <th className="text-right px-4 py-2.5 text-xs text-white/40 font-medium">Actual</th>
                <th className="text-left px-4 py-2.5 text-xs text-white/40 font-medium">Notes</th>
                <th className="px-4 py-2.5 w-20" />
              </tr>
            </thead>
            <tbody>
              {budgetItems.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-white/5 hover:bg-white/3 transition-colors"
                >
                  {editId === item.id ? (
                    <>
                      <td className="px-4 py-2">
                        <select
                          className="select text-xs py-1.5"
                          value={editDraft.category ?? item.category}
                          onChange={(e) => setEditDraft((d) => ({ ...d, category: e.target.value as BudgetCategory }))}
                        >
                          {CATEGORIES.map((c) => <option key={c} value={c}>{categoryLabels[c]}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <input
                          className="input text-xs py-1.5"
                          value={editDraft.label ?? item.label}
                          onChange={(e) => setEditDraft((d) => ({ ...d, label: e.target.value }))}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          className="input text-xs py-1.5 text-right"
                          value={editDraft.estimated ?? item.estimated}
                          min={0}
                          onChange={(e) => setEditDraft((d) => ({ ...d, estimated: parseFloat(e.target.value) || 0 }))}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          className="input text-xs py-1.5 text-right"
                          value={editDraft.actual ?? item.actual}
                          min={0}
                          onChange={(e) => setEditDraft((d) => ({ ...d, actual: parseFloat(e.target.value) || 0 }))}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          className="input text-xs py-1.5"
                          value={editDraft.notes ?? item.notes}
                          onChange={(e) => setEditDraft((d) => ({ ...d, notes: e.target.value }))}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex gap-1 justify-end">
                          <button onClick={handleEditSave} className="btn-ghost p-1 text-emerald-400" aria-label="Save">
                            <Check size={14} />
                          </button>
                          <button onClick={() => setEditId(null)} className="btn-ghost p-1 text-red-400" aria-label="Cancel">
                            <X size={14} />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-2.5">
                        <span
                          className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-md"
                          style={{
                            backgroundColor: `${categoryColors[item.category]}25`,
                            color: categoryColors[item.category] ?? '#8b5cf6',
                          }}
                        >
                          {categoryLabels[item.category] ?? item.category}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-white text-sm">{item.label}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-sm text-white/80">
                        {formatCurrency(item.estimated, formData.currency)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-sm text-emerald-400">
                        {item.actual > 0 ? formatCurrency(item.actual, formData.currency) : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-white/40 max-w-[160px] truncate">{item.notes || '—'}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => startEdit(item)} className="btn-ghost p-1" aria-label={`Edit ${item.label}`}>
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => setDeleteId(item.id)} className="btn-ghost p-1 hover:text-red-400" aria-label={`Delete ${item.label}`}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}

              {/* Add new row */}
              {adding && (
                <tr className="border-b border-violet-500/20 bg-violet-500/5">
                  <td className="px-4 py-2">
                    <select className="select text-xs py-1.5" value={draft.category} onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value as BudgetCategory }))}>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{categoryLabels[c]}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <input
                      className="input text-xs py-1.5"
                      placeholder="Item name"
                      value={draft.label}
                      autoFocus
                      onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input type="number" className="input text-xs py-1.5 text-right" placeholder="0" min={0} value={draft.estimated || ''} onChange={(e) => setDraft((d) => ({ ...d, estimated: parseFloat(e.target.value) || 0 }))} />
                  </td>
                  <td className="px-4 py-2">
                    <input type="number" className="input text-xs py-1.5 text-right" placeholder="0" min={0} value={draft.actual || ''} onChange={(e) => setDraft((d) => ({ ...d, actual: parseFloat(e.target.value) || 0 }))} />
                  </td>
                  <td className="px-4 py-2">
                    <input className="input text-xs py-1.5" placeholder="Notes (optional)" value={draft.notes} onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))} />
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-1 justify-end">
                      <button onClick={handleAdd} className="btn-ghost p-1 text-emerald-400" aria-label="Add item">
                        <Check size={14} />
                      </button>
                      <button onClick={() => setAdding(false)} className="btn-ghost p-1 text-red-400" aria-label="Cancel">
                        <X size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-white/3">
                <td colSpan={2} className="px-4 py-3 text-sm font-semibold text-white">Total</td>
                <td className={`px-4 py-3 text-right text-sm font-bold font-mono ${isOverBudget ? 'text-amber-400' : 'text-white'}`}>
                  {formatCurrency(totalEstimated, formData.currency)}
                </td>
                <td className="px-4 py-3 text-right text-sm font-bold font-mono text-emerald-400">
                  {formatCurrency(totalActual, formData.currency)}
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>

        {budgetItems.length === 0 && !adding && (
          <div className="empty-state py-10">
            <p className="text-white/40 text-sm">No budget items yet.</p>
            <p className="text-white/30 text-xs mt-1">Generate a plan or add items manually.</p>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Budget Item"
        message="Remove this budget item? This cannot be undone."
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default BudgetTab;
