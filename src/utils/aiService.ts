import type { EventFormData, GeneratedPlan, AIPlanResponse, CopilotMessage } from '../types';
import { generateId } from './helpers';
import { demoTemplates } from './demoTemplates';

// ============================================================
// AI Service - routes through serverless function when deployed
// Falls back to demo mode when no key is configured
// ============================================================

const AI_ENDPOINT = '/api/ai'; // Netlify/Vercel serverless function

export interface AIServiceResult<T> {
  data: T | null;
  isDemo: boolean;
  error: string | null;
}

// ============================================================
// Generate event plan via AI or demo fallback
// ============================================================
export async function generateEventPlan(
  formData: EventFormData
): Promise<AIServiceResult<GeneratedPlan>> {
  try {
    const response = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generatePlan',
        payload: formData,
      }),
    });

    if (!response.ok) {
      // Server returned non-2xx, fall to demo
      throw new Error(`Server error: ${response.status}`);
    }

    const json = await response.json();

    if (json.demo || json.error) {
      // Server flagged demo mode or error
      return {
        data: buildDemoPlan(formData),
        isDemo: true,
        error: json.error ?? null,
      };
    }

    const validated = validateAIPlanResponse(json.data, formData);
    return { data: validated, isDemo: false, error: null };
  } catch {
    // Network error or no serverless function - use demo
    return {
      data: buildDemoPlan(formData),
      isDemo: true,
      error: null,
    };
  }
}

// ============================================================
// Send copilot message
// ============================================================
export async function sendCopilotMessage(
  userMessage: string,
  formData: EventFormData,
  history: CopilotMessage[]
): Promise<AIServiceResult<string>> {
  try {
    const response = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'copilot',
        payload: {
          message: userMessage,
          eventContext: formData,
          history: history.slice(-10).map((m) => ({ role: m.role, content: m.content })),
        },
      }),
    });

    if (!response.ok) throw new Error(`Server error: ${response.status}`);

    const json = await response.json();
    if (json.demo || json.error) {
      return {
        data: buildDemoCopilotResponse(userMessage, formData),
        isDemo: true,
        error: json.error ?? null,
      };
    }

    if (typeof json.data !== 'string') throw new Error('Invalid AI response format');
    return { data: json.data, isDemo: false, error: null };
  } catch {
    return {
      data: buildDemoCopilotResponse(userMessage, formData),
      isDemo: true,
      error: null,
    };
  }
}

// ============================================================
// Validate AI plan response against schema
// ============================================================
function validateAIPlanResponse(raw: unknown, formData: EventFormData): GeneratedPlan {
  const r = raw as Partial<AIPlanResponse>;

  const eventDate = new Date(formData.date + 'T00:00:00');
  const now = new Date();

  const tasks = (r.tasks ?? []).map((t) => {
    const dueDate = new Date(eventDate);
    dueDate.setDate(dueDate.getDate() - (t.daysBeforeEvent ?? 30));
    return {
      title: String(t.title ?? 'Task'),
      description: String(t.description ?? ''),
      dueDate: dueDate.toISOString().split('T')[0],
      status: 'pending' as const,
      category: String(t.category ?? 'General'),
      priority: (['high', 'medium', 'low'].includes(t.priority ?? '') ? t.priority : 'medium') as 'high' | 'medium' | 'low',
      isAiGenerated: true,
    };
  });

  // Enforce budget allocation in app code
  const totalBudget = formData.budget;
  const breakdown = (r.budgetBreakdown ?? []).map((b) => ({
    category: b.category ?? 'other',
    label: String(b.label ?? b.category),
    estimated: Math.round((b.percentage / 100) * totalBudget * 0.9), // 10% always reserved for contingency
    notes: String(b.notes ?? 'AI-suggested allocation'),
  }));
  
  // Add contingency
  const sumAllocated = breakdown.reduce((s, b) => s + b.estimated, 0);
  const contingency = totalBudget - sumAllocated;
  if (contingency > 0) {
    breakdown.push({ category: 'contingency', label: 'Contingency Reserve', estimated: contingency, notes: '10% buffer for unexpected costs' });
  }

  const schedule = (r.schedule ?? []).map((s) => ({
    id: generateId(),
    time: String(s.time ?? '12:00'),
    title: String(s.title ?? 'Event'),
    description: String(s.description ?? ''),
    duration: Number(s.duration) || 30,
  }));

  return {
    summary: String(r.summary ?? 'Your personalized event plan.'),
    themeRecommendations: (r.themeRecommendations ?? []).map(String),
    schedule,
    tasks,
    menuIdeas: (r.menuIdeas ?? []).map(String),
    decorationIdeas: (r.decorationIdeas ?? []).map(String),
    entertainmentSuggestions: (r.entertainmentSuggestions ?? []).map(String),
    budgetBreakdown: breakdown,
    tradeOffs: (r.tradeOffs ?? []).map(String),
    isDemo: false,
    generatedAt: now.toISOString(),
  };
}

// ============================================================
// Demo plan builder — deterministic, no API call
// ============================================================
function buildDemoPlan(formData: EventFormData): GeneratedPlan {
  const template = demoTemplates[formData.type] ?? demoTemplates['birthday'];
  const eventDate = new Date(formData.date + 'T00:00:00');
  const now = new Date();

  // Scale budget allocation to user's actual budget
  const totalBudget = formData.budget;
  const budgetBreakdown = template.budgetPercentages.map((b) => ({
    category: b.category,
    label: b.label,
    estimated: Math.round((b.percentage / 100) * totalBudget * 0.9),
    notes: b.notes,
  }));
  const allocated = budgetBreakdown.reduce((s, b) => s + b.estimated, 0);
  budgetBreakdown.push({
    category: 'contingency',
    label: 'Contingency Reserve',
    estimated: totalBudget - allocated,
    notes: '10% buffer — demo data',
  });

  const tasks = template.tasks.map((t) => {
    const dueDate = new Date(eventDate);
    dueDate.setDate(dueDate.getDate() - t.daysBeforeEvent);
    return {
      title: t.title,
      description: t.description,
      dueDate: dueDate.toISOString().split('T')[0],
      status: 'pending' as const,
      category: t.category,
      priority: t.priority as 'high' | 'medium' | 'low',
      isAiGenerated: true,
    };
  });

  const schedule = template.schedule.map((s) => ({ ...s, id: generateId() }));

  return {
    summary: template.summary
      .replace('{name}', formData.name)
      .replace('{guests}', String(formData.guestCount))
      .replace('{location}', formData.location || 'your chosen venue')
      .replace('{theme}', formData.theme || 'your selected theme'),
    themeRecommendations: template.themeRecommendations,
    schedule,
    tasks,
    menuIdeas: template.menuIdeas,
    decorationIdeas: template.decorationIdeas,
    entertainmentSuggestions: template.entertainmentSuggestions,
    budgetBreakdown,
    tradeOffs: template.tradeOffs,
    isDemo: true,
    generatedAt: now.toISOString(),
  };
}

// ============================================================
// Demo copilot responses — keyword-based
// ============================================================
function buildDemoCopilotResponse(message: string, formData: EventFormData): string {
  const lower = message.toLowerCase();
  const currency = formData.currency;
  const budget = formData.budget.toLocaleString();
  const guests = formData.guestCount;
  const eventType = formData.type;

  const NOTE = '\n\n*⚠️ Demo Mode: This response uses pre-built templates, not a live AI model. Configure your Gemini API key in Settings to enable real AI responses.*';

  if (lower.includes('cost') || lower.includes('reduc') || lower.includes('budget') || lower.includes('cheap') || lower.includes('save')) {
    return `Here are some smart cost-saving strategies for your ${eventType} with a ${currency} ${budget} budget and ${guests} guests:

**Top 3 Cost-Reduction Tactics:**
1. **Shift the date** — Weekday or Sunday events typically cost 20–35% less than Saturday events
2. **Reduce per-head catering** — Opt for a buffet or cocktail-style service instead of a sit-down dinner (~30% savings)
3. **DIY décor elements** — Candles, greenery, and fairy lights can replace expensive floral arrangements

**Vendor Alternatives:**
- Consider a DJ (~${currency} 800–1,200) instead of a live band (~${currency} 2,000–4,000)
- Book a talented photographer-videographer combo instead of separate contractors
- Use digital invitations to eliminate stationery costs entirely

**Realistic Trade-Off:** Cutting the entertainment budget by 50% frees up funds for upgrading catering quality — usually the detail guests remember most.${NOTE}`;
  }

  if (lower.includes('guest') || lower.includes('more people') || lower.includes('extra')) {
    const perHead = Math.round(formData.budget / guests);
    const additionalCost = 20 * perHead;
    return `Adding more guests to your ${eventType} requires careful budget adjustment:

**Current:** ${guests} guests at approximately ${currency} ${perHead}/head
**If adding 20 guests:** Budget increases by ~${currency} ${additionalCost.toLocaleString()}

**Strategies to Accommodate More Guests Without Increasing Budget:**
1. Switch to a buffet format (reduces per-head catering costs by ~25%)
2. Trim the entertainment budget slightly
3. Use a larger but less expensive venue — many community halls offer great value
4. Reduce the welcome drink selection to one signature cocktail

**Important:** Always check your venue's capacity before increasing the guest count. Overcapacity can create safety and compliance issues.${NOTE}`;
  }

  if (lower.includes('priorit') || lower.includes('most important') || lower.includes('focus')) {
    return `For a ${eventType}, here's how to prioritize your planning effort:

**Tier 1 — Book Immediately (3+ months out):**
- Venue (most likely to sell out)
- Photographer/videographer
- Catering company

**Tier 2 — Plan Next (2–3 months out):**
- Entertainment (band/DJ)
- Décor and florals
- Send invitations

**Tier 3 — Finalize (1 month out):**
- Confirm all vendors
- Finalize guest count and dietary requirements
- Create detailed day-of schedule

**Your top user priorities:** ${formData.priorities.join(', ')}

I'd recommend front-loading budget to those areas since they directly match what matters most to you.${NOTE}`;
  }

  if (lower.includes('weather') || lower.includes('outdoor') || lower.includes('rain') || lower.includes('backup')) {
    return `Great question about outdoor event planning! Here's your contingency framework:

**Weather Contingency Checklist:**
- ✅ Confirm venue has an indoor backup space included in the contract
- ✅ Rent a marquee/tent as a standalone cover option (~${currency} 500–2,000 depending on size)
- ✅ Have a rain decision protocol — set a go/no-go time (e.g., 48 hours before event)
- ✅ Brief all vendors and guests on the backup plan in your invitations

**Communication Plan:**
- Include backup location address on the invitation
- Set up a WhatsApp group or event page for real-time updates
- Assign someone to monitor the weather forecast from 72 hours out

Outdoor events are magical — just plan for both scenarios from the start!${NOTE}`;
  }

  if (lower.includes('timeline') || lower.includes('schedule') || lower.includes('when') || lower.includes('day of')) {
    return `Here's how to structure the day-of timeline for your ${eventType}:

**The Golden Rule:** Add 15-minute buffers between every major segment — events always run 10–20 minutes behind schedule.

**Recommended Structure:**
- **T-2 hours:** Venue opens for vendor setup
- **T-1 hour:** Personal preparation / photos
- **T-30 min:** Guest arrival and welcome
- **T-0:** Main event begins (ceremony / program)
- **Event + 30 min:** Reception / celebration opens
- **Event + 90 min:** Dinner or refreshments served
- **Event + 3 hours:** Special moments (cake, speeches, toasts)
- **Event + 4 hours:** Dancing / open entertainment
- **Event + 5 hours:** Wrap-up and farewell

Share this timeline with ALL vendors at least 2 weeks before the event so everyone is aligned.${NOTE}`;
  }

  // Default response
  return `Thank you for your question about your ${eventType}! Here's what I can help you with:

**Planning Areas I Can Assist With:**
- 💰 **Budget optimization** — Ask me how to reduce costs or reallocate funds
- 👥 **Guest management** — I can advise on scaling your event up or down
- 📅 **Timeline planning** — Get a detailed day-of schedule
- 🎨 **Theme ideas** — Explore alternative themes for your budget and style
- 🌦️ **Contingency planning** — Weather backups and vendor alternatives
- ✅ **Prioritization** — What to book first and what can wait

Your ${eventType} sounds wonderful. What specific aspect would you like to dig into?${NOTE}`;
}
