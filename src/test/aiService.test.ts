import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateEventPlan, sendCopilotMessage } from '../utils/aiService';
import type { EventFormData } from '../types';

const mockFormData: EventFormData = {
  name: 'Test Birthday Party',
  type: 'birthday',
  date: '2027-06-15',
  location: 'New York, NY',
  guestCount: 50,
  budget: 5000,
  currency: 'USD',
  theme: 'Tropical Paradise',
  dietaryPreferences: ['Vegetarian options'],
  accessibilityNeeds: [],
  priorities: ['Catering quality', 'Entertainment'],
  description: 'A fun tropical birthday party',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockFetch = (globalThis as any);

describe('AI Service — Demo Mode Fallback', () => {
  beforeEach(() => {
    mockFetch.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
  });

  it('falls back to demo plan when network fails', async () => {
    const result = await generateEventPlan(mockFormData);
    expect(result.isDemo).toBe(true);
    expect(result.data).not.toBeNull();
    expect(result.error).toBeNull();
  });

  it('demo plan has required fields', async () => {
    const result = await generateEventPlan(mockFormData);
    const plan = result.data!;
    expect(plan.summary).toBeTruthy();
    expect(Array.isArray(plan.tasks)).toBe(true);
    expect(Array.isArray(plan.schedule)).toBe(true);
    expect(Array.isArray(plan.budgetBreakdown)).toBe(true);
    expect(Array.isArray(plan.themeRecommendations)).toBe(true);
    expect(Array.isArray(plan.menuIdeas)).toBe(true);
    expect(Array.isArray(plan.decorationIdeas)).toBe(true);
  });

  it('demo plan budget does not exceed total budget', async () => {
    const result = await generateEventPlan(mockFormData);
    const plan = result.data!;
    const totalAllocated = plan.budgetBreakdown.reduce((s, b) => s + b.estimated, 0);
    expect(totalAllocated).toBeLessThanOrEqual(mockFormData.budget * 1.01);
  });

  it('demo plan summary is non-empty', async () => {
    const result = await generateEventPlan(mockFormData);
    expect(result.data!.summary.length).toBeGreaterThan(20);
  });
});

describe('AI Service — Server Error Fallback', () => {
  it('falls back to demo when server returns 500', async () => {
    mockFetch.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    });
    const result = await generateEventPlan(mockFormData);
    expect(result.isDemo).toBe(true);
    expect(result.data).not.toBeNull();
  });

  it('falls back to demo when server returns demo:true', async () => {
    mockFetch.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ demo: true, data: null }),
    });
    const result = await generateEventPlan(mockFormData);
    expect(result.isDemo).toBe(true);
  });
});

describe('AI Service — Copilot Demo Mode', () => {
  beforeEach(() => {
    mockFetch.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
  });

  it('returns demo response for cost reduction question', async () => {
    const result = await sendCopilotMessage('How can I reduce costs?', mockFormData, []);
    expect(result.isDemo).toBe(true);
    expect(result.data).toBeTruthy();
    expect(typeof result.data).toBe('string');
    expect(result.data!.length).toBeGreaterThan(50);
  });

  it('returns demo response for guest question', async () => {
    const result = await sendCopilotMessage('How do I handle more guests?', mockFormData, []);
    expect(result.isDemo).toBe(true);
    expect(result.data).toBeTruthy();
  });

  it('returns demo response for unknown question', async () => {
    const result = await sendCopilotMessage('Tell me something random', mockFormData, []);
    expect(result.isDemo).toBe(true);
    expect(result.data).toBeTruthy();
  });

  it('demo response includes demo mode disclosure', async () => {
    const result = await sendCopilotMessage('What should I prioritise?', mockFormData, []);
    expect(result.data).toContain('Demo Mode');
  });
});

describe('AI Service — Live AI Success Path', () => {
  it('parses valid AI JSON plan response', async () => {
    const mockPlan = {
      summary: 'A great birthday party',
      themeRecommendations: ['Tropical', 'Garden'],
      schedule: [{ time: '18:00', title: 'Guests arrive', description: 'Welcome', duration: 30 }],
      tasks: [{ title: 'Book venue', description: 'Reserve space', daysBeforeEvent: 30, category: 'Venue', priority: 'high' }],
      menuIdeas: ['Canapés', 'Cocktails'],
      decorationIdeas: ['Balloons', 'Fairy lights'],
      entertainmentSuggestions: ['DJ'],
      budgetBreakdown: [
        { category: 'venue', label: 'Venue', percentage: 30, notes: 'estimate' },
        { category: 'catering', label: 'Catering', percentage: 40, notes: 'estimate' },
        { category: 'entertainment', label: 'Entertainment', percentage: 20, notes: 'estimate' },
      ],
      tradeOffs: ['Use a DJ instead of live band'],
    };

    mockFetch.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: mockPlan, demo: false }),
    });

    const result = await generateEventPlan(mockFormData);
    expect(result.isDemo).toBe(false);
    expect(result.data).not.toBeNull();
    expect(result.data!.summary).toBe('A great birthday party');
  });
});
