import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Trash2, RotateCcw, User, Bot, Loader2 } from 'lucide-react';
import type { PlanorEvent } from '../../types';
import { useEventStore } from '../../store/eventStore';
import { sendCopilotMessage } from '../../utils/aiService';

const QUICK_PROMPTS = [
  'How can I reduce costs?',
  'What should I prioritise first?',
  'How do I handle more guests?',
  'What\'s a good day-of timeline?',
  'Suggest outdoor contingency plans',
  'What are the top vendor tips?',
];

interface CopilotPanelProps {
  event: PlanorEvent;
}

const CopilotPanel: React.FC<CopilotPanelProps> = ({ event }) => {
  const { addCopilotMessage, clearCopilotHistory } = useEventStore();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { copilotHistory, formData } = event;

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [copilotHistory]);

  const handleSend = async (message?: string) => {
    const text = (message ?? input).trim();
    if (!text || loading) return;

    setInput('');
    setError(null);
    setLoading(true);

    // Add user message immediately
    addCopilotMessage(event.id, {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      isDemo: false,
    });

    try {
      const result = await sendCopilotMessage(text, formData, copilotHistory);

      addCopilotMessage(event.id, {
        role: 'assistant',
        content: result.data ?? 'Sorry, I could not generate a response. Please try again.',
        timestamp: new Date().toISOString(),
        isDemo: result.isDemo,
      });

      if (result.error) {
        setError(result.error);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
      addCopilotMessage(event.id, {
        role: 'assistant',
        content: 'I encountered an error. Please try rephrasing your question or check your connection.',
        timestamp: new Date().toISOString(),
        isDemo: true,
      });
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    clearCopilotHistory(event.id);
    setError(null);
  };

  // Format markdown-ish response text safely (no dangerouslySetInnerHTML)
  const renderMessage = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <strong key={i} className="text-white font-semibold block mt-2">{line.slice(2, -2)}</strong>;
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <div key={i} className="flex gap-2 mt-1">
            <span className="text-violet-400 flex-shrink-0">•</span>
            <span>{formatInline(line.slice(2))}</span>
          </div>
        );
      }
      if (/^\d+\.\s/.test(line)) {
        const [num, ...rest] = line.split('. ');
        return (
          <div key={i} className="flex gap-2 mt-1">
            <span className="text-coral-400 font-bold flex-shrink-0">{num}.</span>
            <span>{formatInline(rest.join('. '))}</span>
          </div>
        );
      }
      if (line.trim() === '') return <br key={i} />;
      return <p key={i} className="mt-1 leading-relaxed">{formatInline(line)}</p>;
    });
  };

  // Format inline bold (**text**) safely
  const formatInline = (text: string): React.ReactNode => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) =>
      i % 2 === 1 ? <strong key={i} className="text-white font-semibold">{part}</strong> : part
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-280px)] min-h-[500px] slide-in-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-coral-500 flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-white">AI Copilot</h2>
            <p className="text-xs text-white/40">Context-aware event planning assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge-demo text-xs">
            {copilotHistory.some((m) => !m.isDemo) ? '✨ AI Mode' : '⚡ Demo Mode'}
          </span>
          {copilotHistory.length > 0 && (
            <button
              onClick={handleClear}
              className="btn-ghost text-xs gap-1"
              aria-label="Clear conversation history"
            >
              <Trash2 size={13} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Event context banner */}
      <div className="flex items-start gap-3 p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 mb-4 text-xs text-violet-300">
        <Sparkles size={13} className="flex-shrink-0 mt-0.5" />
        <span>
          AI has context on <strong>{formData.name}</strong> — {formData.type}, {formData.guestCount} guests,{' '}
          {formData.currency} {formData.budget.toLocaleString()} budget, at {formData.location}. Ask anything about your event.
        </span>
      </div>

      {/* Messages area */}
      <div
        className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4"
        role="log"
        aria-live="polite"
        aria-label="Conversation history"
      >
        {copilotHistory.length === 0 && (
          <div className="empty-state py-10">
            <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
              <Sparkles size={28} className="text-violet-400" />
            </div>
            <p className="text-white/50 text-sm mb-2">Your AI Copilot is ready</p>
            <p className="text-white/30 text-xs max-w-sm text-center">
              Ask about cost reduction, vendor tips, guest logistics, day-of timeline, or any planning question.
            </p>
          </div>
        )}

        {copilotHistory.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === 'user'
                ? 'bg-coral-500/20 border border-coral-500/30'
                : 'bg-violet-500/20 border border-violet-500/30'
            }`}>
              {msg.role === 'user'
                ? <User size={14} className="text-coral-400" />
                : <Bot size={14} className="text-violet-400" />
              }
            </div>

            {/* Bubble */}
            <div className={`max-w-[80%] space-y-1 ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
              <div className={`rounded-2xl px-4 py-3 text-sm ${
                msg.role === 'user'
                  ? 'bg-coral-500/15 border border-coral-500/20 text-white rounded-tr-sm'
                  : 'bg-[#221e66] border border-white/10 text-white/80 rounded-tl-sm'
              }`}>
                {msg.role === 'assistant' ? renderMessage(msg.content) : msg.content}
              </div>

              <div className="flex items-center gap-2 px-1">
                {msg.isDemo && msg.role === 'assistant' && (
                  <span className="text-xs text-amber-400/60">⚡ Demo response</span>
                )}
                <span className="text-xs text-white/20">
                  {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
              <Bot size={14} className="text-violet-400" />
            </div>
            <div className="bg-[#221e66] border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 mb-3 flex items-center gap-2">
          <RotateCcw size={11} />
          {error} Response may still have been generated below.
        </div>
      )}

      {/* Quick prompts */}
      {copilotHistory.length === 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSend(prompt)}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all duration-150 disabled:opacity-40"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="flex gap-3 items-end">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about cost reduction, vendor tips, guest logistics..."
          rows={2}
          className="input flex-1 resize-none min-h-[52px] max-h-[120px]"
          aria-label="Message input"
          disabled={loading}
          maxLength={1000}
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          className="btn-primary h-[52px] px-4 flex-shrink-0"
          aria-label="Send message"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>
      <p className="text-xs text-white/20 mt-2 text-center">
        Press Enter to send · Shift+Enter for new line · Responses use your actual event data
      </p>
    </div>
  );
};

export default CopilotPanel;
