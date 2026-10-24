import React, { useState } from 'react';
import {
  Settings, Key, Shield, Trash2, HelpCircle, ExternalLink,
  ChevronDown, ChevronUp, CheckCircle, AlertTriangle, Sparkles,
  Info, Database
} from 'lucide-react';
import { useEventStore } from '../store/eventStore';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const FAQ = [
  {
    q: 'Is my event data secure?',
    a: 'All event data is stored entirely in your browser\'s localStorage. Nothing is sent to any server unless you explicitly use the AI features. You can delete all data at any time from this page.',
  },
  {
    q: 'How do I enable real AI responses?',
    a: 'Deploy the app with a Gemini API key set as GEMINI_API_KEY in your Vercel/Netlify environment variables. The key is used only server-side in the /api/ai serverless function — it is never exposed in your browser bundle.',
  },
  {
    q: 'What is Demo Mode?',
    a: 'When no AI key is configured (or the serverless function is unavailable), Planora AI uses pre-built template plans based on your event type. All demo content is clearly labelled and does not call any external API.',
  },
  {
    q: 'Are vendor prices real?',
    a: 'No. All vendor costs and budget estimates are illustrative examples based on typical market ranges. They do not represent actual quotes, guaranteed prices, or verified availability. Always get real quotes from local vendors.',
  },
  {
    q: 'Can I use this without an internet connection?',
    a: 'Yes! The core planning workspace — tasks, budget, vendors, timeline — works fully offline. Only AI Copilot and plan generation require a network connection (or fall back to demo mode).',
  },
  {
    q: 'How do I delete my data?',
    a: 'Use the "Clear All Data" button in Settings. This removes all events, tasks, vendors, and preferences from localStorage. This action cannot be undone.',
  },
  {
    q: 'Where is my Gemini API key stored?',
    a: 'Never in your browser. Your API key must be set as a server-side environment variable (GEMINI_API_KEY) in your deployment platform (Vercel or Netlify). The frontend communicates only with your own /api/ai endpoint.',
  },
];

const SettingsPage: React.FC = () => {
  const { settings, updateSettings, events } = useEventStore();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [cleared, setCleared] = useState(false);

  const handleClearAllData = () => {
    localStorage.removeItem('planora-storage');
    setClearConfirm(false);
    setCleared(true);
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in">
      {/* Header */}
      <div>
        <h1 className="section-title text-2xl mb-1 flex items-center gap-2">
          <Settings size={22} className="text-violet-400" />
          Settings & Help
        </h1>
        <p className="section-subtitle">Configure AI, manage data, and learn how Planora AI works</p>
      </div>

      {/* AI Configuration */}
      <section aria-labelledby="ai-config-heading">
        <div className="card p-6 space-y-5">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
              <Key size={18} className="text-violet-400" />
            </div>
            <div>
              <h2 id="ai-config-heading" className="font-display font-semibold text-white">AI Configuration</h2>
              <p className="text-xs text-white/40">Current mode: {settings.demoMode ? 'Demo' : 'Live AI'}</p>
            </div>
          </div>

          {/* Mode indicator */}
          <div className={`flex items-start gap-3 p-4 rounded-xl border ${
            settings.demoMode
              ? 'bg-amber-500/10 border-amber-500/30'
              : 'bg-emerald-500/10 border-emerald-500/30'
          }`} role="status">
            {settings.demoMode ? (
              <>
                <AlertTriangle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-300 font-semibold text-sm">Demo Mode Active</p>
                  <p className="text-amber-400/70 text-xs mt-1 leading-relaxed">
                    Plans and Copilot responses use pre-built templates. No external AI API is called.
                    Content is clearly labelled as demo data.
                  </p>
                </div>
              </>
            ) : (
              <>
                <CheckCircle size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-emerald-300 font-semibold text-sm">Live AI Active</p>
                  <p className="text-emerald-400/70 text-xs mt-1">
                    Connected to Gemini AI via secure serverless function. API key is server-side only.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Setup instructions */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white">How to Enable Real AI Responses</h3>
            <ol className="space-y-3 text-sm text-white/60">
              {[
                <>Get a free Gemini API key at <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline inline-flex items-center gap-1">aistudio.google.com <ExternalLink size={11} /></a></>,
                <>Fork or clone the <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">planora-ai</code> repository to your GitHub account</>,
                <>Deploy to <strong className="text-white">Vercel</strong> or <strong className="text-white">Netlify</strong> — both have free tiers</>,
                <>Add <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">GEMINI_API_KEY=your_key_here</code> as an environment variable in your deployment dashboard</>,
                <>Redeploy — the <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">/api/ai</code> serverless function will now use your key for real AI responses</>,
                <><strong className="text-amber-300">Never</strong> put your API key in frontend code or commit it to your repository</>,
              ].map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">{i + 1}</span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-2 text-xs text-blue-300">
            <Info size={13} className="flex-shrink-0 mt-0.5" />
            <span>
              The <code className="bg-white/10 px-1 rounded">GEMINI_API_KEY</code> environment variable is read exclusively by the{' '}
              <code className="bg-white/10 px-1 rounded">netlify/functions/ai.ts</code> or <code className="bg-white/10 px-1 rounded">api/ai.ts</code> serverless function.
              It is never included in the frontend JavaScript bundle.
            </span>
          </div>
        </div>
      </section>

      {/* Privacy & Data */}
      <section aria-labelledby="privacy-heading">
        <div className="card p-6 space-y-5">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <Shield size={18} className="text-emerald-400" />
            </div>
            <div>
              <h2 id="privacy-heading" className="font-display font-semibold text-white">Privacy & Data</h2>
              <p className="text-xs text-white/40">Your data, your control</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: Database, title: 'Local Storage Only', desc: 'Event data lives in your browser. No account, no cloud sync, no third-party sharing.' },
              { icon: Shield, title: 'No Personal Data Sent', desc: 'Only your event context (type, budget, guests) is sent to AI. Never your name, email, or contact details.' },
              { icon: Key, title: 'API Keys Server-Side', desc: 'Gemini API key is an environment variable in your deployment — never in the browser.' },
              { icon: Sparkles, title: 'Demo Mode Default', desc: 'Without an API key configured, no external calls are made. 100% offline capability.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-3 p-3 rounded-xl bg-white/3">
                <Icon size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">{title}</p>
                  <p className="text-xs text-white/50 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Privacy acknowledgment */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={settings.privacyAcknowledged}
              onChange={(e) => updateSettings({ privacyAcknowledged: e.target.checked })}
              className="mt-1 w-4 h-4 accent-violet-500 cursor-pointer"
              aria-label="Acknowledge privacy policy"
            />
            <span className="text-sm text-white/60 leading-relaxed group-hover:text-white/80 transition-colors">
              I understand that event data is stored locally in my browser and that AI suggestions are illustrative,
              not guaranteed vendor quotes or financial advice.
            </span>
          </label>

          {/* Data stats */}
          <div className="divider" />
          <div className="flex items-center justify-between text-sm">
            <div className="text-white/50">
              <span className="font-medium text-white">{events.length}</span> events stored locally
            </div>
            <button
              onClick={() => setClearConfirm(true)}
              className="btn-danger text-xs gap-1.5"
              aria-label="Clear all stored data"
            >
              <Trash2 size={13} />
              Clear All Data
            </button>
          </div>

          {cleared && (
            <div className="flex items-center gap-2 text-emerald-400 text-sm" role="status">
              <CheckCircle size={14} /> All data cleared. Reloading...
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq-heading">
        <div className="card p-6 space-y-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-coral-500/20 border border-coral-500/30 flex items-center justify-center">
              <HelpCircle size={18} className="text-coral-400" />
            </div>
            <h2 id="faq-heading" className="font-display font-semibold text-white">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-2">
            {FAQ.map(({ q, a }, i) => (
              <div key={i} className="border border-white/10 rounded-xl overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-white/3 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                  aria-controls={`faq-answer-${i}`}
                >
                  <span className="text-sm font-medium text-white pr-4">{q}</span>
                  {openFaq === i
                    ? <ChevronUp size={16} className="text-violet-400 flex-shrink-0" />
                    : <ChevronDown size={16} className="text-white/30 flex-shrink-0" />
                  }
                </button>
                {openFaq === i && (
                  <div id={`faq-answer-${i}`} className="px-4 pb-4">
                    <p className="text-sm text-white/60 leading-relaxed">{a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App info */}
      <section>
        <div className="card p-5 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-coral-500 to-violet-500 flex items-center justify-center">
              <Sparkles size={15} className="text-white" />
            </div>
            <span className="font-display font-bold text-white">Planora AI</span>
          </div>
          <p className="text-white/40 text-xs">Version 1.0.0 · PromptWars Virtual Round 5, Challenge 5</p>
          <p className="text-white/30 text-xs">
            Built with React + Vite + TypeScript + Tailwind CSS + Zustand + Google Gemini
          </p>
          <p className="text-white/20 text-xs mt-2">
            All event suggestions are illustrative. Demo prices are not real vendor quotes.
          </p>
        </div>
      </section>

      <ConfirmDialog
        open={clearConfirm}
        title="Clear All Data"
        message="This will permanently delete ALL events, tasks, vendors, budget items, and preferences stored in your browser. This cannot be undone."
        confirmLabel="Clear Everything"
        confirmVariant="danger"
        onConfirm={handleClearAllData}
        onCancel={() => setClearConfirm(false)}
      />
    </div>
  );
};

export default SettingsPage;
