# 🎉 Planora AI — Smart Celebration & Event Planner

> **PromptWars Virtual Round 5 · Challenge 5: Celebration & Event Planner**

Planora AI is a production-quality, GenAI-powered event planning assistant for **weddings, birthdays, college events, anniversaries, corporate events, and community celebrations**. It generates personalised plans using your budget, date, guest count, location, preferences, and priorities — powered by Google Gemini, with a fully functional demo mode when no API key is configured.

---

## 🎯 Problem Statement

Planning a celebration is overwhelming: juggling vendors, budgets, timelines, dietary needs, and accessibility requirements across dozens of spreadsheets and notes. **Planora AI** consolidates everything into a single, intelligent workspace.

---

## 👥 Target Users

- Couples planning weddings · Families organising birthday parties
- College societies planning campus events · Community group organisers
- Corporate event managers · Anyone overwhelmed by event logistics

---

## ✨ Key Features

| Feature | Details |
|---------|---------|
| **AI Plan Generation** | Complete plan: schedule, tasks, menu, décor, budget via Gemini |
| **Budget Intelligence** | Category allocations, overflow warnings, trade-off suggestions |
| **Dynamic Timeline** | Overdue/upcoming/completed task buckets, day-of schedule |
| **Vendor Organizer** | Status tracking, contacts, cost tracking, demo data disclosure |
| **AI Copilot** | Context-aware chat using your actual event data |
| **Export** | CSV download for budget+tasks, browser print |
| **Demo Mode** | Fully functional without an API key — clearly labelled |
| **Local-First** | All data in localStorage, no account required |

---

## 🏗️ Architecture

```
planora-ai/
├── src/
│   ├── components/
│   │   ├── layout/          # Sidebar, MobileNav, Layout
│   │   ├── ui/              # ConfirmDialog
│   │   └── workspace/       # OverviewTab, BudgetTab, TimelineTab,
│   │                        # ChecklistTab, VendorsTab, CopilotPanel
│   ├── data/sampleData.ts   # Pre-loaded sample wedding event
│   ├── pages/               # LandingPage, Dashboard, CreateEvent,
│   │                        # Workspace, Settings
│   ├── store/eventStore.ts  # Zustand + localStorage persist
│   ├── types/index.ts       # All domain TypeScript types
│   └── utils/
│       ├── aiService.ts     # AI proxy calls + demo fallback
│       ├── demoTemplates.ts # Pre-built plans for all 6 event types
│       └── helpers.ts       # Budget math, dates, CSV export
├── netlify/functions/ai.ts  # Netlify serverless AI proxy
├── api/ai.ts                # Vercel serverless AI proxy
├── netlify.toml             # Netlify config
├── .env.example             # Placeholder vars only
└── .gitignore               # Excludes secrets, node_modules, dist
```

### Data Flow
```
Browser (React) → POST /api/ai → Serverless Function → Gemini API
                                  ↑ GEMINI_API_KEY (env var only)
                                  ↓ demo fallback on any error
localStorage ← Zustand persist middleware
```

---

## 🚀 Tech Stack

React 19 · Vite 8 · TypeScript 6 · Tailwind CSS 3 · Zustand 5 · React Router 6 · date-fns · Lucide React · Google Gemini 1.5 Flash · Vitest · Netlify/Vercel

---

## 🔧 Local Setup

```bash
git clone https://github.com/YOUR_USERNAME/planora-ai.git
cd planora-ai
npm install
npm run dev          # Opens on http://localhost:5173
```

The app runs in **demo mode** — no API key needed.

---

## 🔑 Environment Variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `GEMINI_API_KEY` | **Server-side only** (Netlify/Vercel env) | Gemini authentication |

> ⚠️ **Never** use `VITE_GEMINI_API_KEY` — that exposes the key in the browser bundle. The key is read only by the serverless function.

---

## 🤖 AI Integration

**Live mode:** React → `POST /api/ai` → serverless reads `GEMINI_API_KEY` → calls Gemini 1.5 Flash → validates JSON → budget math enforced in app code → returns plan.

**Demo mode:** Network error or missing key → `buildDemoPlan()` uses event-type templates → clearly labelled `isDemo: true`.

**Schema safety:** AI JSON validated against `AIPlanResponse` type. Malformed output falls back to demo gracefully.

---

## 🧪 Testing

```bash
npm run test          # 39 tests — 2 test files
npm run typecheck     # TypeScript type check
npm run lint          # oxlint
npm run build         # Production build
```

| File | Tests |
|------|-------|
| `helpers.test.ts` | 28 — ID gen, currency, budget math, dates, status, sanitization, email |
| `aiService.test.ts` | 11 — demo fallback, server errors, live AI parsing, copilot responses |

---

## 🌐 Deployment

### Netlify
1. Fork repo → Netlify → New site from GitHub → select `planora-ai`
2. Build: `npm run build` · Publish: `dist` (auto from `netlify.toml`)
3. Site settings → Environment variables → add `GEMINI_API_KEY`
4. Deploy → `/api/ai` auto-redirects to `/.netlify/functions/ai`

### Vercel
1. Fork repo → Vercel → New Project → import `planora-ai`
2. Settings → Environment Variables → add `GEMINI_API_KEY`
3. Deploy → `api/ai.ts` auto-served as serverless function

**Both platforms:** App works in demo mode without the API key.

---

## 🔒 Security & Privacy

- No authentication — local-first prototype (events in localStorage)
- API key **never** in the frontend bundle
- User inputs sanitized — no `dangerouslySetInnerHTML`
- Only event context sent to AI — no personal identifying information
- Rate limiting: 30 req/min in serverless function
- All AI vendor suggestions labelled as illustrative estimates

---

## ⚠️ Known Limitations

1. No multi-device sync (localStorage only)
2. Vendor prices are illustrative — not real quotes
3. Rate limiting is in-memory (resets on cold start)
4. No real vendor booking integration

---

## 🎬 Demo Video Script (3–5 min)

1. **[0:00–0:30]** Landing page — hero, event types, features
2. **[0:30–1:30]** Create Event wizard — fill form, generate plan
3. **[1:30–2:30]** Workspace Overview — KPIs, budget bar, upcoming tasks
4. **[2:30–3:00]** Checklist — complete task, see overdue badge; Timeline — day-of schedule
5. **[3:00–3:30]** Budget tab — stacked bar, add item, trigger overflow warning
6. **[3:30–4:00]** Vendors — demo labels, add new vendor
7. **[4:00–4:30]** AI Copilot — quick prompt, demo disclosure
8. **[4:30–5:00]** Settings — AI config instructions, CSV export, dashboard

---

## 📄 License

MIT License

---

*Built for PromptWars Virtual Round 5, Challenge 5 · Powered by Google Gemini*
