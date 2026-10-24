/**
 * Netlify Edge/Serverless Function: AI Proxy
 * Location: netlify/functions/ai.ts
 *
 * This function is the ONLY place that reads the GEMINI_API_KEY.
 * It is never exposed to the frontend bundle.
 *
 * Rate limiting: rudimentary in-memory (per cold start).
 * For production, use a KV store (Netlify Blobs, Upstash).
 */

type Handler = (event: NetlifyEvent, context: unknown) => Promise<NetlifyResponse>;
type NetlifyEvent = { httpMethod: string; body: string | null };
type NetlifyResponse = { statusCode: number; headers: Record<string, string>; body: string };

// Simple in-memory rate limiter (resets on cold start)
const requestLog: number[] = [];
const RATE_LIMIT = 30; // max requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute in ms

function checkRateLimit(): boolean {
  const now = Date.now();
  // Remove entries older than 1 minute
  while (requestLog.length > 0 && requestLog[0] < now - RATE_WINDOW) {
    requestLog.shift();
  }
  if (requestLog.length >= RATE_LIMIT) return false;
  requestLog.push(now);
  return true;
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Build the Gemini prompt for plan generation
function buildPlanPrompt(formData: Record<string, unknown>): string {
  return `You are an expert event planner. Generate a complete, personalised event plan as valid JSON.

Event Details:
- Name: ${formData.name}
- Type: ${formData.type}
- Date: ${formData.date}
- Location: ${formData.location}
- Guest Count: ${formData.guestCount}
- Budget: ${formData.currency} ${formData.budget} (TOTAL BUDGET - allocations must not exceed this)
- Theme: ${formData.theme || 'To be suggested'}
- Dietary Preferences: ${JSON.stringify(formData.dietaryPreferences)}
- Accessibility Needs: ${JSON.stringify(formData.accessibilityNeeds)}
- User Priorities: ${JSON.stringify(formData.priorities)}
- Additional Notes: ${formData.description || 'None'}

Return ONLY a valid JSON object with this exact schema (no markdown fences):
{
  "summary": "2-3 sentence overview",
  "themeRecommendations": ["theme 1", "theme 2", "theme 3"],
  "schedule": [
    {"time": "HH:MM", "title": "...", "description": "...", "duration": <minutes>}
  ],
  "tasks": [
    {"title": "...", "description": "...", "daysBeforeEvent": <number>, "category": "...", "priority": "high|medium|low"}
  ],
  "menuIdeas": ["item 1", ...],
  "decorationIdeas": ["idea 1", ...],
  "entertainmentSuggestions": ["suggestion 1", ...],
  "budgetBreakdown": [
    {"category": "venue|catering|decoration|entertainment|photography|transportation|attire|flowers|stationery|technology|other", "label": "...", "percentage": <number>, "notes": "..."}
  ],
  "tradeOffs": ["tip 1", "tip 2", "tip 3"]
}

CRITICAL RULES:
1. Budget percentages must sum to approximately 90 (10% is always reserved for contingency by the app)
2. All costs are ESTIMATES only - clearly label them as such in notes
3. Do not invent real vendor names, guaranteed prices, or actual availability
4. Respect dietary preferences and accessibility needs in recommendations
5. Align suggestions with user priorities`;
}

// Build Gemini prompt for copilot
function buildCopilotPrompt(message: string, eventContext: Record<string, unknown>, history: { role: string; content: string }[]): string {
  const ctx = `Event: ${eventContext.name} (${eventContext.type}), Date: ${eventContext.date}, Location: ${eventContext.location}, ${eventContext.guestCount} guests, ${eventContext.currency} ${eventContext.budget} budget, Theme: ${eventContext.theme || 'TBD'}, Priorities: ${JSON.stringify(eventContext.priorities)}.`;
  
  const historyStr = history
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n');

  return `You are an expert event planning AI assistant called Planora Copilot.

Event Context: ${ctx}

Previous conversation:
${historyStr || 'None'}

User: ${message}

Provide a helpful, specific, actionable response. Use your knowledge of event planning best practices. Do NOT invent real vendor names, guaranteed prices, or claim availability. Keep responses concise and practical. Format with bullet points for lists. Always consider the user's budget and guest count constraints.`;
}

export const handler: Handler = async (event: NetlifyEvent, _context: unknown): Promise<NetlifyResponse> => {
  // CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // Check rate limit
  if (!checkRateLimit()) {
    return {
      statusCode: 429,
      headers,
      body: JSON.stringify({ error: 'Rate limit exceeded. Please try again in a minute.', demo: true }),
    };
  }

  // Check API key
  if (!GEMINI_API_KEY) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ demo: true, data: null }),
    };
  }

  let body: { action: string; payload: Record<string, unknown> };
  try {
    body = JSON.parse(event.body ?? '{}');
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const { action, payload } = body;
  if (!action || !payload) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing action or payload' }) };
  }

  try {
    const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    let prompt: string;
    if (action === 'generatePlan') {
      prompt = buildPlanPrompt(payload);
    } else if (action === 'copilot') {
      prompt = buildCopilotPrompt(
        payload.message as string,
        payload.eventContext as Record<string, unknown>,
        (payload.history as { role: string; content: string }[]) ?? []
      );
    } else {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unknown action' }) };
    }

    const geminiResponse = await fetch(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: action === 'generatePlan' ? 0.7 : 0.8,
          maxOutputTokens: action === 'generatePlan' ? 4096 : 1024,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      }),
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error('Gemini API error:', geminiResponse.status, errText);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ demo: true, error: `AI service error: ${geminiResponse.status}` }),
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const geminiData = await geminiResponse.json() as any;
    const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text as string | undefined;

    if (!text) {
      return { statusCode: 200, headers, body: JSON.stringify({ demo: true, error: 'Empty AI response' }) };
    }

    if (action === 'generatePlan') {
      // Parse JSON response
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      try {
        const parsed = JSON.parse(cleaned);
        return { statusCode: 200, headers, body: JSON.stringify({ data: parsed, demo: false }) };
      } catch {
        console.error('Failed to parse AI JSON:', cleaned.slice(0, 200));
        return { statusCode: 200, headers, body: JSON.stringify({ demo: true, error: 'Malformed AI response' }) };
      }
    } else {
      // Copilot: return text response
      return { statusCode: 200, headers, body: JSON.stringify({ data: text, demo: false }) };
    }
  } catch (err) {
    console.error('AI function error:', err);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ demo: true, error: 'Network or service error' }),
    };
  }
};
