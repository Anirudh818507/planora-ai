// ============================================================
// Core domain types for Planora AI
// ============================================================

export type EventType = 'wedding' | 'birthday' | 'college' | 'community' | 'corporate' | 'anniversary';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'INR' | 'CAD' | 'AUD' | 'SGD';

export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'overdue';

export type VendorStatus = 'considering' | 'contacted' | 'booked' | 'confirmed' | 'cancelled';

export type BudgetCategory =
  | 'venue'
  | 'catering'
  | 'decoration'
  | 'entertainment'
  | 'photography'
  | 'transportation'
  | 'attire'
  | 'flowers'
  | 'stationery'
  | 'technology'
  | 'contingency'
  | 'other';

export interface BudgetItem {
  id: string;
  category: BudgetCategory;
  label: string;
  estimated: number;
  actual: number;
  notes: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string; // ISO date string
  status: TaskStatus;
  category: string;
  priority: 'high' | 'medium' | 'low';
  isAiGenerated: boolean;
}

export interface Vendor {
  id: string;
  category: BudgetCategory;
  name: string;
  estimatedCost: number;
  actualCost: number;
  status: VendorStatus;
  notes: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  isDemo: boolean; // flag illustrative demo data
}

export interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  description: string;
  duration: number; // minutes
}

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isDemo: boolean;
}

export interface EventFormData {
  name: string;
  type: EventType;
  date: string; // ISO date string
  location: string;
  guestCount: number;
  budget: number;
  currency: Currency;
  theme: string;
  dietaryPreferences: string[];
  accessibilityNeeds: string[];
  priorities: string[];
  description: string;
}

export interface GeneratedPlan {
  summary: string;
  themeRecommendations: string[];
  schedule: ScheduleItem[];
  tasks: Omit<Task, 'id'>[];
  menuIdeas: string[];
  decorationIdeas: string[];
  entertainmentSuggestions: string[];
  budgetBreakdown: { category: BudgetCategory; label: string; estimated: number; notes: string }[];
  tradeOffs: string[];
  isDemo: boolean;
  generatedAt: string;
}

export interface PlanorEvent {
  id: string;
  formData: EventFormData;
  plan: GeneratedPlan | null;
  tasks: Task[];
  vendors: Vendor[];
  budgetItems: BudgetItem[];
  copilotHistory: CopilotMessage[];
  createdAt: string;
  updatedAt: string;
  isDuplicate?: boolean;
}

// ============================================================
// AI response schema
// ============================================================

export interface AIPlanResponse {
  summary: string;
  themeRecommendations: string[];
  schedule: {
    time: string;
    title: string;
    description: string;
    duration: number;
  }[];
  tasks: {
    title: string;
    description: string;
    daysBeforeEvent: number;
    category: string;
    priority: 'high' | 'medium' | 'low';
  }[];
  menuIdeas: string[];
  decorationIdeas: string[];
  entertainmentSuggestions: string[];
  budgetBreakdown: {
    category: BudgetCategory;
    label: string;
    percentage: number;
    notes: string;
  }[];
  tradeOffs: string[];
}

// ============================================================
// App state
// ============================================================

export interface AppSettings {
  demoMode: boolean; // true = AI key not configured
  currency: Currency;
  privacyAcknowledged: boolean;
}
