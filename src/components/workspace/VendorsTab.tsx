import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Check, X, ExternalLink, Info } from 'lucide-react';
import type { PlanorEvent, Vendor, VendorStatus, BudgetCategory } from '../../types';
import { useEventStore } from '../../store/eventStore';
import { formatCurrency, categoryLabels, categoryColors, isValidEmail } from '../../utils/helpers';
import ConfirmDialog from '../ui/ConfirmDialog';

const VENDOR_STATUSES: VendorStatus[] = ['considering', 'contacted', 'booked', 'confirmed', 'cancelled'];
const CATEGORIES: BudgetCategory[] = [
  'venue', 'catering', 'decoration', 'entertainment', 'photography',
  'transportation', 'attire', 'flowers', 'stationery', 'technology', 'other'
];

const statusColors: Record<VendorStatus, string> = {
  considering: 'text-white/40 bg-white/5 border-white/10',
  contacted: 'text-blue-300 bg-blue-500/10 border-blue-500/30',
  booked: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
  confirmed: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30',
  cancelled: 'text-red-300 bg-red-500/10 border-red-500/30',
};

const emptyVendor = (): Omit<Vendor, 'id'> => ({
  category: 'other',
  name: '',
  estimatedCost: 0,
  actualCost: 0,
  status: 'considering',
  notes: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  website: '',
  isDemo: false,
});

interface VendorsTabProps {
  event: PlanorEvent;
}

const VendorsTab: React.FC<VendorsTabProps> = ({ event }) => {
  const { addVendor, updateVendor, deleteVendor } = useEventStore();
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Omit<Vendor, 'id'>>(emptyVendor());
  const [editDraft, setEditDraft] = useState<Partial<Vendor>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [filterStatus, setFilterStatus] = useState<VendorStatus | 'all'>('all');

  const { vendors, formData } = event;

  const validateDraft = (d: typeof draft): boolean => {
    const e: typeof errors = {};
    if (!d.name.trim()) e.name = 'Vendor name required';
    if (d.contactEmail && !isValidEmail(d.contactEmail)) e.contactEmail = 'Invalid email';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAdd = () => {
    if (!validateDraft(draft)) return;
    addVendor(event.id, draft);
    setDraft(emptyVendor());
    setAdding(false);
    setErrors({});
  };

  const handleEditSave = () => {
    if (editId) {
      updateVendor(event.id, editId, editDraft);
      setEditId(null);
      setEditDraft({});
    }
  };

  const filtered = filterStatus === 'all'
    ? vendors
    : vendors.filter((v) => v.status === filterStatus);

  const totalEstimated = vendors.reduce((s, v) => s + v.estimatedCost, 0);
  const totalActual = vendors.reduce((s, v) => s + v.actualCost, 0);
  const confirmedCount = vendors.filter((v) => v.status === 'confirmed' || v.status === 'booked').length;

  return (
    <div className="space-y-5 slide-in-up">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="text-xs text-white/40 mb-1">Total Vendors</p>
          <p className="text-2xl font-bold text-white">{vendors.length}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xs text-white/40 mb-1">Confirmed/Booked</p>
          <p className="text-2xl font-bold text-emerald-400">{confirmedCount}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xs text-white/40 mb-1">Total Estimated</p>
          <p className="text-xl font-bold text-white">{formatCurrency(totalEstimated, formData.currency)}</p>
        </div>
      </div>

      {/* Demo data notice */}
      {vendors.some((v) => v.isDemo) && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
          <Info size={13} className="flex-shrink-0 mt-0.5" />
          Some vendors are marked as <strong>Demo</strong> — they are illustrative examples only and do not represent real businesses, actual pricing, or confirmed availability.
        </div>
      )}

      {/* Filters + Add */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto">
          {(['all', ...VENDOR_STATUSES] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                filterStatus === s
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              {s === 'all' ? `All (${vendors.length})` : `${s} (${vendors.filter(v => v.status === s).length})`}
            </button>
          ))}
        </div>
        <button
          onClick={() => { setAdding(true); setDraft(emptyVendor()); }}
          className="btn-secondary text-xs gap-1.5 flex-shrink-0"
          aria-label="Add vendor"
        >
          <Plus size={14} /> Add Vendor
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div className="card p-5 border border-violet-500/30 bg-violet-500/5 space-y-4 slide-in-up">
          <h4 className="font-semibold text-white">New Vendor</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 md:col-span-1">
              <label className="label text-xs">Vendor Name *</label>
              <input className={`input text-sm ${errors.name ? 'border-red-500/50' : ''}`} placeholder="Business name" value={draft.name} autoFocus onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="label text-xs">Category</label>
              <select className="select text-sm" value={draft.category} onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value as BudgetCategory }))}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{categoryLabels[c]}</option>)}
              </select>
            </div>
            <div>
              <label className="label text-xs">Status</label>
              <select className="select text-sm" value={draft.status} onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value as VendorStatus }))}>
                {VENDOR_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label text-xs">Estimated Cost</label>
              <input type="number" className="input text-sm" min={0} value={draft.estimatedCost || ''} placeholder="0" onChange={(e) => setDraft((d) => ({ ...d, estimatedCost: parseFloat(e.target.value) || 0 }))} />
            </div>
            <div>
              <label className="label text-xs">Actual Cost</label>
              <input type="number" className="input text-sm" min={0} value={draft.actualCost || ''} placeholder="0" onChange={(e) => setDraft((d) => ({ ...d, actualCost: parseFloat(e.target.value) || 0 }))} />
            </div>
            <div>
              <label className="label text-xs">Contact Name</label>
              <input className="input text-sm" placeholder="Contact person" value={draft.contactName} onChange={(e) => setDraft((d) => ({ ...d, contactName: e.target.value }))} />
            </div>
            <div>
              <label className="label text-xs">Contact Phone</label>
              <input className="input text-sm" placeholder="+1 555-0100" value={draft.contactPhone} onChange={(e) => setDraft((d) => ({ ...d, contactPhone: e.target.value }))} />
            </div>
            <div>
              <label className="label text-xs">Email</label>
              <input className={`input text-sm ${errors.contactEmail ? 'border-red-500/50' : ''}`} type="email" placeholder="vendor@example.com" value={draft.contactEmail} onChange={(e) => setDraft((d) => ({ ...d, contactEmail: e.target.value }))} />
              {errors.contactEmail && <p className="text-red-400 text-xs mt-1">{errors.contactEmail}</p>}
            </div>
            <div className="col-span-2">
              <label className="label text-xs">Notes</label>
              <textarea className="input text-sm resize-none" rows={2} placeholder="Package details, contract terms, etc." value={draft.notes} onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => { setAdding(false); setErrors({}); }} className="btn-ghost text-xs"><X size={12} /> Cancel</button>
            <button onClick={handleAdd} className="btn-primary text-xs"><Check size={12} /> Add Vendor</button>
          </div>
        </div>
      )}

      {/* Vendor cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((vendor) => {
          const catColor = categoryColors[vendor.category] ?? '#8b5cf6';
          const isEditing = editId === vendor.id;

          return (
            <div key={vendor.id} className={`card p-4 ${vendor.isDemo ? 'border-amber-500/20' : ''}`}>
              {vendor.isDemo && (
                <div className="text-xs text-amber-400/70 mb-2 flex items-center gap-1">
                  <Info size={10} /> Illustrative demo data
                </div>
              )}
              {isEditing ? (
                <div className="space-y-3">
                  <input className="input text-sm" value={editDraft.name ?? vendor.name} onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))} />
                  <div className="grid grid-cols-2 gap-2">
                    <select className="select text-sm" value={editDraft.status ?? vendor.status} onChange={(e) => setEditDraft((d) => ({ ...d, status: e.target.value as VendorStatus }))}>
                      {VENDOR_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <input type="number" className="input text-sm" placeholder="Estimated" value={editDraft.estimatedCost ?? vendor.estimatedCost} onChange={(e) => setEditDraft((d) => ({ ...d, estimatedCost: parseFloat(e.target.value) || 0 }))} />
                  </div>
                  <textarea className="input text-sm resize-none" rows={2} value={editDraft.notes ?? vendor.notes} onChange={(e) => setEditDraft((d) => ({ ...d, notes: e.target.value }))} />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditId(null)} className="btn-ghost text-xs"><X size={12} /> Cancel</button>
                    <button onClick={handleEditSave} className="btn-primary text-xs"><Check size={12} /> Save</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-white text-sm">{vendor.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: `${catColor}20`, color: catColor }}>
                          {categoryLabels[vendor.category] ?? vendor.category}
                        </span>
                        <span className={`badge border text-xs ${statusColors[vendor.status]}`}>
                          {vendor.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditId(vendor.id); setEditDraft({ ...vendor }); }} className="btn-ghost p-1" aria-label={`Edit ${vendor.name}`}>
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => setDeleteId(vendor.id)} className="btn-ghost p-1 hover:text-red-400" aria-label={`Delete ${vendor.name}`}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-white/50 mb-3">
                    <div>
                      <span className="text-white/30">Estimated: </span>
                      <span className="text-white/70">{formatCurrency(vendor.estimatedCost, formData.currency)}</span>
                    </div>
                    <div>
                      <span className="text-white/30">Actual: </span>
                      <span className="text-emerald-400">{vendor.actualCost > 0 ? formatCurrency(vendor.actualCost, formData.currency) : '—'}</span>
                    </div>
                    {vendor.contactName && (
                      <div className="col-span-2">
                        <span className="text-white/30">Contact: </span>
                        <span>{vendor.contactName}</span>
                      </div>
                    )}
                    {vendor.contactPhone && (
                      <div>
                        <a href={`tel:${vendor.contactPhone}`} className="text-violet-400 hover:underline">{vendor.contactPhone}</a>
                      </div>
                    )}
                    {vendor.contactEmail && (
                      <div>
                        <a href={`mailto:${vendor.contactEmail}`} className="text-violet-400 hover:underline truncate block max-w-[140px]">{vendor.contactEmail}</a>
                      </div>
                    )}
                  </div>

                  {vendor.notes && (
                    <p className="text-xs text-white/40 bg-white/3 rounded-lg p-2 leading-relaxed">{vendor.notes}</p>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && !adding && (
        <div className="empty-state py-12">
          <div className="text-5xl mb-4">🏪</div>
          <p className="text-white/40 text-sm">No vendors {filterStatus !== 'all' ? `with "${filterStatus}" status` : 'yet'}</p>
          <p className="text-white/30 text-xs mt-1">Add vendors manually to track contacts and costs.</p>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Vendor"
        message="Remove this vendor from your plan? This cannot be undone."
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={() => { if (deleteId) { deleteVendor(event.id, deleteId); setDeleteId(null); } }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default VendorsTab;
