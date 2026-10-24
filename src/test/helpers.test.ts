import { describe, it, expect } from 'vitest';
import {
  generateId,
  formatCurrency,
  calculateBudgetTotals,
  isBudgetOverflowing,
  daysUntilEvent,
  isTaskOverdue,
  getEffectiveTaskStatus,
  sanitizeText,
  isValidEmail,
  formatDateDisplay,
} from '../utils/helpers';

// ============================================================
// Helper Utility Tests
// ============================================================

describe('generateId', () => {
  it('generates a non-empty string', () => {
    expect(generateId()).toBeTruthy();
    expect(typeof generateId()).toBe('string');
  });

  it('generates unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});

describe('formatCurrency', () => {
  it('formats USD correctly', () => {
    expect(formatCurrency(1000, 'USD')).toContain('1,000');
  });

  it('formats zero', () => {
    expect(formatCurrency(0, 'USD')).toContain('0');
  });

  it('formats large amounts', () => {
    expect(formatCurrency(40000, 'USD')).toContain('40,000');
  });
});

describe('calculateBudgetTotals', () => {
  it('sums estimated and actual correctly', () => {
    const items = [
      { estimated: 1000, actual: 800 },
      { estimated: 2000, actual: 0 },
      { estimated: 500, actual: 500 },
    ];
    const { totalEstimated, totalActual } = calculateBudgetTotals(items);
    expect(totalEstimated).toBe(3500);
    expect(totalActual).toBe(1300);
  });

  it('handles empty array', () => {
    const { totalEstimated, totalActual } = calculateBudgetTotals([]);
    expect(totalEstimated).toBe(0);
    expect(totalActual).toBe(0);
  });
});

describe('isBudgetOverflowing', () => {
  it('returns true when over budget', () => {
    expect(isBudgetOverflowing(11000, 10000)).toBe(true);
  });

  it('returns false when under budget', () => {
    expect(isBudgetOverflowing(9000, 10000)).toBe(false);
  });

  it('returns false at exact budget', () => {
    expect(isBudgetOverflowing(10000, 10000)).toBe(false);
  });
});

describe('daysUntilEvent', () => {
  it('returns positive days for future date', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const dateStr = futureDate.toISOString().split('T')[0];
    const days = daysUntilEvent(dateStr);
    expect(days).toBeGreaterThan(0);
    expect(days).toBeLessThanOrEqual(31);
  });

  it('returns negative days for past date', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 10);
    const dateStr = pastDate.toISOString().split('T')[0];
    const days = daysUntilEvent(dateStr);
    expect(days).toBeLessThan(0);
  });

  it('returns 0 for today', () => {
    const today = new Date().toISOString().split('T')[0];
    const days = daysUntilEvent(today);
    expect(days).toBe(0);
  });
});

describe('isTaskOverdue', () => {
  it('returns false for completed tasks regardless of date', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);
    expect(isTaskOverdue(pastDate.toISOString().split('T')[0], 'completed')).toBe(false);
  });

  it('returns true for past due pending tasks', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);
    expect(isTaskOverdue(pastDate.toISOString().split('T')[0], 'pending')).toBe(true);
  });

  it('returns false for future pending tasks', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    expect(isTaskOverdue(futureDate.toISOString().split('T')[0], 'pending')).toBe(false);
  });
});

describe('getEffectiveTaskStatus', () => {
  it('returns completed for completed tasks', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);
    expect(getEffectiveTaskStatus({
      dueDate: futureDate.toISOString().split('T')[0],
      status: 'completed',
    })).toBe('completed');
  });

  it('returns overdue for past due pending tasks', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);
    expect(getEffectiveTaskStatus({
      dueDate: pastDate.toISOString().split('T')[0],
      status: 'pending',
    })).toBe('overdue');
  });

  it('returns pending for future pending tasks', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    expect(getEffectiveTaskStatus({
      dueDate: futureDate.toISOString().split('T')[0],
      status: 'pending',
    })).toBe('pending');
  });
});

describe('sanitizeText', () => {
  it('escapes angle brackets', () => {
    expect(sanitizeText('<script>alert(1)</script>')).not.toContain('<script>');
    expect(sanitizeText('<b>bold</b>')).toContain('&lt;');
  });

  it('escapes double quotes', () => {
    expect(sanitizeText('"quoted"')).not.toContain('"');
  });

  it('leaves plain text unchanged', () => {
    expect(sanitizeText('hello world')).toBe('hello world');
  });
});

describe('isValidEmail', () => {
  it('validates correct email', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('test.name+tag@domain.co.uk')).toBe(true);
  });

  it('rejects invalid email', () => {
    expect(isValidEmail('not-an-email')).toBe(false);
    expect(isValidEmail('@nodomain')).toBe(false);
    expect(isValidEmail('no@')).toBe(false);
  });
});

describe('formatDateDisplay', () => {
  it('returns TBD for empty string', () => {
    expect(formatDateDisplay('')).toBe('TBD');
  });

  it('returns formatted date for valid ISO date', () => {
    const result = formatDateDisplay('2026-12-25');
    expect(result).toContain('2026');
    expect(result).toContain('December');
  });
});

// ============================================================
// Budget calculation enforcement tests
// ============================================================

describe('Budget enforcement', () => {
  it('budget totals match individual items', () => {
    const items = [
      { estimated: 8000, actual: 7800 },
      { estimated: 12000, actual: 0 },
      { estimated: 3500, actual: 0 },
      { estimated: 4500, actual: 4500 },
      { estimated: 3740, actual: 0 }, // contingency
    ];
    const { totalEstimated } = calculateBudgetTotals(items);
    const manualSum = items.reduce((s, i) => s + i.estimated, 0);
    expect(totalEstimated).toBe(manualSum);
  });

  it('correctly identifies overflow at any amount', () => {
    expect(isBudgetOverflowing(40001, 40000)).toBe(true);
    expect(isBudgetOverflowing(40000, 40000)).toBe(false);
    expect(isBudgetOverflowing(39999, 40000)).toBe(false);
  });
});
