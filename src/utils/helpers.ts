import type { Currency, BudgetCategory } from '../types';

// UUID-based ID generation
export const generateId = (): string => {
  // Simple UUID-like generator without external dep
  return 'xxxx-xxxx-4xxx-yxxx-xxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Format currency
export const formatCurrency = (amount: number, currency: Currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Calculate budget totals
export const calculateBudgetTotals = (items: { estimated: number; actual: number }[]) => {
  const totalEstimated = items.reduce((sum, i) => sum + i.estimated, 0);
  const totalActual = items.reduce((sum, i) => sum + i.actual, 0);
  return { totalEstimated, totalActual };
};

// Budget overflow check
export const isBudgetOverflowing = (estimated: number, budgetLimit: number): boolean => {
  return estimated > budgetLimit;
};

// Category label map
export const categoryLabels: Record<BudgetCategory, string> = {
  venue: 'Venue',
  catering: 'Catering',
  decoration: 'Decoration',
  entertainment: 'Entertainment',
  photography: 'Photography',
  transportation: 'Transportation',
  attire: 'Attire',
  flowers: 'Flowers',
  stationery: 'Stationery',
  technology: 'Technology',
  contingency: 'Contingency',
  other: 'Other',
};

// Category colors
export const categoryColors: Record<BudgetCategory, string> = {
  venue: '#6366f1',
  catering: '#f59e0b',
  decoration: '#ec4899',
  entertainment: '#8b5cf6',
  photography: '#06b6d4',
  transportation: '#10b981',
  attire: '#f97316',
  flowers: '#ef4444',
  stationery: '#84cc16',
  technology: '#3b82f6',
  contingency: '#6b7280',
  other: '#9ca3af',
};

// Sanitize text to avoid XSS
export const sanitizeText = (text: string): string => {
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Validate email
export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Format date nicely
export const formatDateDisplay = (dateStr: string): string => {
  if (!dateStr) return 'TBD';
  try {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(dateStr + 'T00:00:00'));
  } catch {
    return dateStr;
  }
};

// Days until event
export const daysUntilEvent = (dateStr: string): number => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const eventDate = new Date(dateStr + 'T00:00:00');
  const diff = eventDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// Check if task is overdue
export const isTaskOverdue = (dueDate: string, status: string): boolean => {
  if (status === 'completed') return false;
  const days = daysUntilEvent(dueDate);
  return days < 0;
};

// Get task status with auto-overdue detection
export const getEffectiveTaskStatus = (task: { dueDate: string; status: string }): string => {
  if (task.status === 'completed') return 'completed';
  if (isTaskOverdue(task.dueDate, task.status)) return 'overdue';
  return task.status;
};

// Download CSV
export const downloadCSV = (data: Record<string, unknown>[], filename: string): void => {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((h) => {
      const val = row[h];
      const str = val === null || val === undefined ? '' : String(val);
      return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
    }).join(',')
  );
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

// Clamp number
export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

// Event type display names
export const eventTypeLabels: Record<string, string> = {
  wedding: '💍 Wedding',
  birthday: '🎂 Birthday',
  college: '🎓 College Event',
  community: '🏘️ Community',
  corporate: '💼 Corporate',
  anniversary: '💕 Anniversary',
};

// Event type gradients
export const eventTypeGradients: Record<string, string> = {
  wedding: 'from-rose-500 to-pink-600',
  birthday: 'from-yellow-500 to-orange-600',
  college: 'from-blue-500 to-indigo-600',
  community: 'from-green-500 to-teal-600',
  corporate: 'from-slate-500 to-zinc-600',
  anniversary: 'from-purple-500 to-pink-600',
};
