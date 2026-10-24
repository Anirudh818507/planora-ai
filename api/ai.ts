/**
 * Vercel Serverless Function: AI Proxy
 * Location: api/ai.ts
 *
 * This file is the Vercel equivalent of netlify/functions/ai.ts
 * It handles the same logic but using Vercel's function format.
 * The GEMINI_API_KEY is read from Vercel Environment Variables.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
type VercelReq = { method?: string; body?: any };
type VercelRes = {
  setHeader: (key: string, val: string) => void;
  status: (code: number) => VercelRes;
  json: (body: unknown) => void;
  end: () => void;
};

const requestLog: number[] = [];
const RATE_LIMIT = 30;
const RATE_WINDOW = 60 * 1000;

function checkRateLimit(): boolean {
  const now = Date.now();
  while (requestLog.length > 0 && requestLog[0] < now - RATE_WINDOW) {
    requestLog.shift();
  }
  if (requestLog.length >= RATE_LIMIT) return false;
  requestLog.push(now);
  return true;
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

function buildPlanPrompt(formData: Record<string, unknown>): string {
  return `You are an expert event planner. Generate a complete personalised event plan as valid JSON.

Event: ${formData.name} (${formData.type}), Date: ${formData.date}, Location: ${formData.location}, ${formData.guestCount} guests, ${formData.currency} ${formData.budget} budget, Theme: ${formData.theme || 'suggest one'}, Dietary: ${JSON.stringify(formData.dietaryPreferences)}, Accessibility: ${JSON.stringify(formData.accessibilityNeeds)}, Priorities: ${JSON.stringify(formData.priorities)}, Notes: ${formData.description || 'None'}

Return ONLY valid JSON (no markdown):
{"summary":"...","themeRecommendations":["..."],"schedule":[{"time":"HH:MM","title":"...","description":"...","duration":30}],"tasks":[{"title":"...","description":"...","daysBeforeEvent":30,"category":"...","priority":"high|medium|low"}],"menuIdeas":["..."],"decorationIdeas":["..."],"entertainmentSuggestions":["..."],"budgetBreakdown":[{"category":"venue|catering|decoration|entertainment|photography|transportation|attire|flowers|stationery|technology|other","label":"...","percentage":25,"notes":"estimate only"}],"tradeOffs":["..."]}

RULES: Budget percentages sum ~90 (app adds 10% contingency). Never invent real vendor prices or guaranteed availability. All estimates illustrative only.`;
}

function buildCopilotPrompt(message: string, ctx: Record<string, unknown>, history: { role: string; content: string }[]): string {
  return `Expert event planning assistant. Event: ${ctx.name} (${ctx.type}), ${ctx.guestCount} guests, ${ctx.currency} ${ctx.budget} budget.

History: ${history.map(m => `${m.role}: ${m.content}`).join('\n') || 'None'}

User: ${message}

Give helpful, specific, actionable advice. Never invent real vendor names or guaranteed prices.`;
}

export default async function handler(req: VercelReq, res: VercelRes) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!checkRateLimit()) return res.status(429).json({ error: 'Rate limit exceeded', demo: true });
  if (!GEMINI_API_KEY) return res.status(200).json({ demo: true });

  const { action, payload } = req.body ?? {};
  if (!action || !payload) return res.status(400).json({ error: 'Missing action or payload' });

  const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  const prompt = action === 'generatePlan'
    ? buildPlanPrompt(payload)
    : buildCopilotPrompt(payload.message, payload.eventContext, payload.history ?? []);

  try {
    const geminiRes = await fetch(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: action === 'generatePlan' ? 4096 : 1024 },
      }),
    });

    if (!geminiRes.ok) return res.status(200).json({ demo: true, error: `AI error: ${geminiRes.status}` });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const geminiData = await geminiRes.json() as any;
    const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text as string | undefined;
    if (!text) return res.status(200).json({ demo: true, error: 'Empty AI response' });

    if (action === 'generatePlan') {
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      try {
        return res.status(200).json({ data: JSON.parse(cleaned), demo: false });
      } catch {
        return res.status(200).json({ demo: true, error: 'Malformed AI JSON' });
      }
    } else {
      return res.status(200).json({ data: text, demo: false });
    }
  } catch {
    return res.status(200).json({ demo: true, error: 'Network error' });
  }
}
