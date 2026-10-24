import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  PlanorEvent,
  EventFormData,
  Task,
  Vendor,
  BudgetItem,
  CopilotMessage,
  GeneratedPlan,
  AppSettings,
} from '../types';
import { generateId } from '../utils/helpers';
import { sampleEvent } from '../data/sampleData';

interface EventStore {
  events: PlanorEvent[];
  currentEventId: string | null;
  settings: AppSettings;

  // Event CRUD
  createEvent: (formData: EventFormData) => PlanorEvent;
  updateEvent: (id: string, updates: Partial<PlanorEvent>) => void;
  deleteEvent: (id: string) => void;
  duplicateEvent: (id: string) => PlanorEvent;
  setCurrentEvent: (id: string | null) => void;
  getCurrentEvent: () => PlanorEvent | null;

  // Plan
  setPlan: (eventId: string, plan: GeneratedPlan) => void;

  // Tasks
  addTask: (eventId: string, task: Omit<Task, 'id'>) => void;
  updateTask: (eventId: string, taskId: string, updates: Partial<Task>) => void;
  deleteTask: (eventId: string, taskId: string) => void;
  toggleTaskStatus: (eventId: string, taskId: string) => void;

  // Vendors
  addVendor: (eventId: string, vendor: Omit<Vendor, 'id'>) => void;
  updateVendor: (eventId: string, vendorId: string, updates: Partial<Vendor>) => void;
  deleteVendor: (eventId: string, vendorId: string) => void;

  // Budget
  addBudgetItem: (eventId: string, item: Omit<BudgetItem, 'id'>) => void;
  updateBudgetItem: (eventId: string, itemId: string, updates: Partial<BudgetItem>) => void;
  deleteBudgetItem: (eventId: string, itemId: string) => void;

  // Copilot
  addCopilotMessage: (eventId: string, message: Omit<CopilotMessage, 'id'>) => void;
  clearCopilotHistory: (eventId: string) => void;

  // Settings
  updateSettings: (updates: Partial<AppSettings>) => void;
}

export const useEventStore = create<EventStore>()(
  persist(
    (set, get) => ({
      events: [sampleEvent],
      currentEventId: null,
      settings: {
        demoMode: true,
        currency: 'USD',
        privacyAcknowledged: false,
      },

      createEvent: (formData) => {
        const newEvent: PlanorEvent = {
          id: generateId(),
          formData,
          plan: null,
          tasks: [],
          vendors: [],
          budgetItems: [],
          copilotHistory: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((s) => ({ events: [...s.events, newEvent] }));
        return newEvent;
      },

      updateEvent: (id, updates) => {
        set((s) => ({
          events: s.events.map((e) =>
            e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
          ),
        }));
      },

      deleteEvent: (id) => {
        set((s) => ({
          events: s.events.filter((e) => e.id !== id),
          currentEventId: s.currentEventId === id ? null : s.currentEventId,
        }));
      },

      duplicateEvent: (id) => {
        const event = get().events.find((e) => e.id === id);
        if (!event) throw new Error('Event not found');
        const copy: PlanorEvent = {
          ...event,
          id: generateId(),
          formData: { ...event.formData, name: `${event.formData.name} (Copy)` },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isDuplicate: true,
          tasks: event.tasks.map((t) => ({ ...t, id: generateId() })),
          vendors: event.vendors.map((v) => ({ ...v, id: generateId() })),
          budgetItems: event.budgetItems.map((b) => ({ ...b, id: generateId() })),
          copilotHistory: [],
        };
        set((s) => ({ events: [...s.events, copy] }));
        return copy;
      },

      setCurrentEvent: (id) => set({ currentEventId: id }),

      getCurrentEvent: () => {
        const { events, currentEventId } = get();
        return events.find((e) => e.id === currentEventId) ?? null;
      },

      setPlan: (eventId, plan) => {
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId ? { ...e, plan, updatedAt: new Date().toISOString() } : e
          ),
        }));
      },

      addTask: (eventId, task) => {
        const newTask: Task = { ...task, id: generateId() };
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId
              ? { ...e, tasks: [...e.tasks, newTask], updatedAt: new Date().toISOString() }
              : e
          ),
        }));
      },

      updateTask: (eventId, taskId, updates) => {
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId
              ? {
                  ...e,
                  tasks: e.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
                  updatedAt: new Date().toISOString(),
                }
              : e
          ),
        }));
      },

      deleteTask: (eventId, taskId) => {
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId
              ? {
                  ...e,
                  tasks: e.tasks.filter((t) => t.id !== taskId),
                  updatedAt: new Date().toISOString(),
                }
              : e
          ),
        }));
      },

      toggleTaskStatus: (eventId, taskId) => {
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId
              ? {
                  ...e,
                  tasks: e.tasks.map((t) =>
                    t.id === taskId
                      ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' }
                      : t
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : e
          ),
        }));
      },

      addVendor: (eventId, vendor) => {
        const newVendor: Vendor = { ...vendor, id: generateId() };
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId
              ? { ...e, vendors: [...e.vendors, newVendor], updatedAt: new Date().toISOString() }
              : e
          ),
        }));
      },

      updateVendor: (eventId, vendorId, updates) => {
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId
              ? {
                  ...e,
                  vendors: e.vendors.map((v) => (v.id === vendorId ? { ...v, ...updates } : v)),
                  updatedAt: new Date().toISOString(),
                }
              : e
          ),
        }));
      },

      deleteVendor: (eventId, vendorId) => {
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId
              ? {
                  ...e,
                  vendors: e.vendors.filter((v) => v.id !== vendorId),
                  updatedAt: new Date().toISOString(),
                }
              : e
          ),
        }));
      },

      addBudgetItem: (eventId, item) => {
        const newItem: BudgetItem = { ...item, id: generateId() };
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId
              ? {
                  ...e,
                  budgetItems: [...e.budgetItems, newItem],
                  updatedAt: new Date().toISOString(),
                }
              : e
          ),
        }));
      },

      updateBudgetItem: (eventId, itemId, updates) => {
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId
              ? {
                  ...e,
                  budgetItems: e.budgetItems.map((b) =>
                    b.id === itemId ? { ...b, ...updates } : b
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : e
          ),
        }));
      },

      deleteBudgetItem: (eventId, itemId) => {
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId
              ? {
                  ...e,
                  budgetItems: e.budgetItems.filter((b) => b.id !== itemId),
                  updatedAt: new Date().toISOString(),
                }
              : e
          ),
        }));
      },

      addCopilotMessage: (eventId, message) => {
        const newMsg: CopilotMessage = { ...message, id: generateId() };
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId
              ? {
                  ...e,
                  copilotHistory: [...e.copilotHistory, newMsg],
                  updatedAt: new Date().toISOString(),
                }
              : e
          ),
        }));
      },

      clearCopilotHistory: (eventId) => {
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId
              ? { ...e, copilotHistory: [], updatedAt: new Date().toISOString() }
              : e
          ),
        }));
      },

      updateSettings: (updates) => {
        set((s) => ({ settings: { ...s.settings, ...updates } }));
      },
    }),
    {
      name: 'planora-storage',
      version: 1,
    }
  )
);
