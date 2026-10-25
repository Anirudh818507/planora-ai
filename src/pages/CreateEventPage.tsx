import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight, ChevronLeft, Sparkles, Calendar, Users,
  DollarSign, MapPin, Palette, Utensils, Accessibility, Star,
  AlertCircle, Loader2
} from 'lucide-react';
import { useEventStore } from '../store/eventStore';
import { generateEventPlan } from '../utils/aiService';
import type { EventFormData, EventType, Currency } from '../types';

const EVENT_TYPES: { value: EventType; label: string; emoji: string }[] = [
  { value: 'wedding', label: 'Wedding', emoji: '💍' },
  { value: 'birthday', label: 'Birthday', emoji: '🎂' },
  { value: 'college', label: 'College Event', emoji: '🎓' },
  { value: 'community', label: 'Community', emoji: '🏘️' },
  { value: 'corporate', label: 'Corporate', emoji: '💼' },
  { value: 'anniversary', label: 'Anniversary', emoji: '💕' },
];

const CURRENCIES: Currency[] = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'SGD'];

const DIETARY_OPTIONS = [
  'Vegetarian options', 'Vegan options', 'Gluten-free options',
  'Halal options', 'Kosher options', 'Nut-free options',
  'Dairy-free options', 'No dietary restrictions',
];

const ACCESSIBILITY_OPTIONS = [
  'Wheelchair accessible venue', 'Hearing loop / sign language',
  'Visual impairment accommodations', 'Quiet spaces needed',
  'Accessible parking required', 'No specific needs',
];

const PRIORITY_OPTIONS = [
  'Photography quality', 'Catering quality', 'Entertainment',
  'Décor & ambiance', 'Guest experience', 'Budget efficiency',
  'Venue prestige', 'Sustainability / eco-friendly',
];

const STEPS = ['Event Type', 'Event Details', 'Preferences', 'Review & Generate'];

const defaultForm: EventFormData = {
  name: '',
  type: 'wedding',
  date: '',
  location: '',
  guestCount: 50,
  budget: 5000,
  currency: 'USD',
  theme: '',
  dietaryPreferences: [],
  accessibilityNeeds: [],
  priorities: [],
  description: '',
};

const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();
  const { createEvent, setPlan, addTask, addBudgetItem } = useEventStore();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<EventFormData>(defaultForm);
  const [errors, setErrors] = useState<Partial<Record<keyof EventFormData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  const update = <K extends keyof EventFormData>(key: K, value: EventFormData[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const toggleArray = (key: 'dietaryPreferences' | 'accessibilityNeeds' | 'priorities', val: string) => {
    setForm((f) => {
      const arr = f[key] as string[];
      return { ...f, [key]: arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val] };
    });
  };

  // Validation per step
  const validateStep = (): boolean => {
    const e: typeof errors = {};
    if (step === 0) {
      if (!form.type) e.type = 'Please select an event type';
    }
    if (step === 1) {
      if (!form.name.trim()) e.name = 'Event name is required';
      if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
      if (!form.date) e.date = 'Event date is required';
      if (!form.location.trim()) e.location = 'Location is required';
      if (!form.guestCount || form.guestCount < 1) e.guestCount = 'Guest count must be at least 1' as any;
      if (form.guestCount > 10000) e.guestCount = 'Guest count seems too high' as any;
      if (!form.budget || form.budget < 100) e.budget = 'Budget must be at least 100' as any;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (validateStep()) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const handleGenerate = async () => {
    if (!validateStep()) return;
    setLoading(true);
    setGenError(null);

    try {
      const newEvent = createEvent(form);
      const result = await generateEventPlan(form);

      if (result.data) {
        setPlan(newEvent.id, result.data);

        // Hydrate tasks from plan
        result.data.tasks.forEach((t) => addTask(newEvent.id, t));

        // Hydrate budget items from plan
        result.data.budgetBreakdown.forEach((b) => {
          addBudgetItem(newEvent.id, {
            category: b.category,
            label: b.label,
            estimated: b.estimated,
            actual: 0,
            notes: b.notes,
          });
        });
      }

      navigate(`/event/${newEvent.id}`);
    } catch {
      setGenError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-2xl mx-auto animate-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="section-title text-2xl mb-1">Create New Event</h1>
        <p className="section-subtitle">Generate your AI-powered event plan in minutes</p>
      </div>

      {/* Step progress */}
      <div className="flex items-center gap-2 mb-8" role="progressbar" aria-valuenow={step + 1} aria-valuemax={STEPS.length} aria-label="Form progress">
        {STEPS.map((label, i) => (
          <React.Fragment key={label}>
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                i < step ? 'bg-emerald-500 text-white' :
                i === step ? 'bg-gradient-to-br from-coral-500 to-violet-500 text-white' :
                'bg-white/10 text-white/30'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-xs hidden sm:inline transition-colors duration-200 ${i === step ? 'text-white font-medium' : 'text-white/30'}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px transition-all duration-300 ${i < step ? 'bg-emerald-500/50' : 'bg-white/10'}`} aria-hidden="true" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step content */}
      <div className="card p-6 md:p-8 slide-in-up">
        {/* Step 0: Event Type */}
        {step === 0 && (
          <div>
            <h2 className="text-xl font-display font-semibold text-white mb-2">What are you celebrating?</h2>
            <p className="text-white/50 text-sm mb-6">Choose the event type to get tailored AI recommendations.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3" role="radiogroup" aria-label="Event type">
              {EVENT_TYPES.map(({ value, label, emoji }) => (
                <button
                  key={value}
                  role="radio"
                  aria-checked={form.type === value}
                  onClick={() => update('type', value)}
                  className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 text-left ${
                    form.type === value
                      ? 'border-violet-500/60 bg-violet-500/15 text-white shadow-glow-violet'
                      : 'border-white/10 bg-white/3 text-white/60 hover:border-white/20 hover:text-white'
                  }`}
                  id={`type-${value}`}
                >
                  <span className="text-2xl" aria-hidden="true">{emoji}</span>
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
            {errors.type && (
              <p className="text-red-400 text-xs mt-3 flex items-center gap-1" role="alert">
                <AlertCircle size={12} /> {errors.type}
              </p>
            )}
          </div>
        )}

        {/* Step 1: Event Details */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-display font-semibold text-white mb-1">Event Details</h2>
              <p className="text-white/50 text-sm mb-6">The AI uses these details to personalise your plan.</p>
            </div>

            {/* Event Name */}
            <div>
              <label className="label" htmlFor="event-name">Event Name *</label>
              <input
                id="event-name"
                type="text"
                className={`input ${errors.name ? 'border-red-500/50' : ''}`}
                placeholder={form.type === 'wedding' ? "Emma & James's Wedding" : "My Awesome Event"}
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                maxLength={100}
                aria-required="true"
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && <p id="name-error" className="text-red-400 text-xs mt-1 flex items-center gap-1" role="alert"><AlertCircle size={12} /> {errors.name}</p>}
            </div>

            {/* Date */}
            <div>
              <label className="label" htmlFor="event-date">
                <Calendar size={13} className="inline mr-1" />Event Date *
              </label>
              <input
                id="event-date"
                type="date"
                className={`input ${errors.date ? 'border-red-500/50' : ''}`}
                value={form.date}
                min={today}
                onChange={(e) => update('date', e.target.value)}
                aria-required="true"
                aria-describedby={errors.date ? 'date-error' : undefined}
              />
              {errors.date && <p id="date-error" className="text-red-400 text-xs mt-1 flex items-center gap-1" role="alert"><AlertCircle size={12} /> {errors.date}</p>}
            </div>

            {/* Location */}
            <div>
              <label className="label" htmlFor="event-location">
                <MapPin size={13} className="inline mr-1" />Location *
              </label>
              <input
                id="event-location"
                type="text"
                className={`input ${errors.location ? 'border-red-500/50' : ''}`}
                placeholder="City, Venue, or Address"
                value={form.location}
                onChange={(e) => update('location', e.target.value)}
                maxLength={200}
                aria-required="true"
              />
              {errors.location && <p className="text-red-400 text-xs mt-1 flex items-center gap-1" role="alert"><AlertCircle size={12} /> {errors.location}</p>}
            </div>

            {/* Guest Count + Budget */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="guest-count">
                  <Users size={13} className="inline mr-1" />Guests *
                </label>
                <input
                  id="guest-count"
                  type="number"
                  className={`input ${errors.guestCount ? 'border-red-500/50' : ''}`}
                  value={form.guestCount}
                  min={1}
                  max={10000}
                  onChange={(e) => update('guestCount', parseInt(e.target.value) || 0)}
                  aria-required="true"
                />
                {errors.guestCount && <p className="text-red-400 text-xs mt-1" role="alert">{errors.guestCount as string}</p>}
              </div>
              <div>
                <label className="label" htmlFor="currency">Currency</label>
                <select
                  id="currency"
                  className="select"
                  value={form.currency}
                  onChange={(e) => update('currency', e.target.value as Currency)}
                >
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="label" htmlFor="budget">
                <DollarSign size={13} className="inline mr-1" />Total Budget ({form.currency}) *
              </label>
              <input
                id="budget"
                type="number"
                className={`input ${errors.budget ? 'border-red-500/50' : ''}`}
                value={form.budget}
                min={100}
                onChange={(e) => update('budget', parseInt(e.target.value) || 0)}
                aria-required="true"
              />
              <p className="text-white/30 text-xs mt-1">AI will allocate categories within this budget with a 10% contingency reserve.</p>
              {errors.budget && <p className="text-red-400 text-xs mt-1" role="alert">{errors.budget as string}</p>}
            </div>

            {/* Theme */}
            <div>
              <label className="label" htmlFor="theme">
                <Palette size={13} className="inline mr-1" />Theme or Style (optional)
              </label>
              <input
                id="theme"
                type="text"
                className="input"
                placeholder="e.g. Garden Elegance, Tropical Paradise, Modern Minimalist"
                value={form.theme}
                onChange={(e) => update('theme', e.target.value)}
                maxLength={100}
              />
            </div>

            {/* Description */}
            <div>
              <label className="label" htmlFor="description">Additional Notes (optional)</label>
              <textarea
                id="description"
                className="input min-h-[80px] resize-none"
                placeholder="Any specific requirements, wishes, or context for the AI..."
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                maxLength={500}
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Step 2: Preferences */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-display font-semibold text-white mb-1">Preferences & Priorities</h2>
              <p className="text-white/50 text-sm mb-2">Help the AI understand your specific needs.</p>
            </div>

            {/* Dietary */}
            <div>
              <label className="label">
                <Utensils size={13} className="inline mr-1" />Dietary Preferences
              </label>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Dietary preferences">
                {DIETARY_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleArray('dietaryPreferences', opt)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 ${
                      form.dietaryPreferences.includes(opt)
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                        : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20 hover:text-white'
                    }`}
                    aria-pressed={form.dietaryPreferences.includes(opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Accessibility */}
            <div>
              <label className="label">
                <Accessibility size={13} className="inline mr-1" />Accessibility Needs
              </label>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Accessibility needs">
                {ACCESSIBILITY_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleArray('accessibilityNeeds', opt)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 ${
                      form.accessibilityNeeds.includes(opt)
                        ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                        : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20 hover:text-white'
                    }`}
                    aria-pressed={form.accessibilityNeeds.includes(opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Priorities */}
            <div>
              <label className="label">
                <Star size={13} className="inline mr-1" />Top Priorities (select up to 3)
              </label>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Event priorities">
                {PRIORITY_OPTIONS.map((opt) => {
                  const selected = form.priorities.includes(opt);
                  const maxReached = form.priorities.length >= 3 && !selected;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => !maxReached && toggleArray('priorities', opt)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 ${
                        selected
                          ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                          : maxReached
                          ? 'bg-white/3 border-white/5 text-white/20 cursor-not-allowed'
                          : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20 hover:text-white'
                      }`}
                      aria-pressed={selected}
                      disabled={maxReached}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              <p className="text-white/30 text-xs mt-2">
                {form.priorities.length}/3 selected — priorities guide budget allocation
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Review & Generate */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-display font-semibold text-white mb-1">Review & Generate Plan</h2>
              <p className="text-white/50 text-sm">Confirm your details, then let AI build your complete event plan.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Event', value: `${EVENT_TYPES.find(t => t.value === form.type)?.emoji} ${form.name || '(unnamed)'}` },
                { label: 'Date', value: form.date ? new Date(form.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Not set' },
                { label: 'Location', value: form.location || 'Not set' },
                { label: 'Guests', value: `${form.guestCount} people` },
                { label: 'Budget', value: `${form.currency} ${form.budget.toLocaleString()}` },
                { label: 'Theme', value: form.theme || 'AI will suggest' },
              ].map(({ label, value }) => (
                <div key={label} className="card-elevated p-3 rounded-xl">
                  <p className="text-white/40 text-xs mb-0.5">{label}</p>
                  <p className="text-white text-sm font-medium truncate">{value}</p>
                </div>
              ))}
            </div>

            {form.priorities.length > 0 && (
              <div>
                <p className="text-white/40 text-xs mb-2">Top Priorities</p>
                <div className="flex flex-wrap gap-2">
                  {form.priorities.map((p) => (
                    <span key={p} className="badge-ai">{p}</span>
                  ))}
                </div>
              </div>
            )}

            {form.dietaryPreferences.length > 0 && (
              <div>
                <p className="text-white/40 text-xs mb-2">Dietary Preferences</p>
                <div className="flex flex-wrap gap-2">
                  {form.dietaryPreferences.map((d) => (
                    <span key={d} className="badge-success text-xs px-2 py-0.5">{d}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="demo-banner">
              <Sparkles size={14} className="flex-shrink-0" />
              <p>
                <strong>AI Note:</strong> If no Gemini API key is configured, a detailed demo plan will be generated using pre-built templates. The plan will be clearly labelled as demo content.
              </p>
            </div>

            {genError && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm" role="alert">
                <AlertCircle size={14} />
                {genError}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between mt-6">
        <button
          onClick={step === 0 ? () => navigate('/dashboard') : prev}
          className="btn-secondary"
          disabled={loading}
        >
          <ChevronLeft size={16} />
          {step === 0 ? 'Cancel' : 'Back'}
        </button>

        {step < STEPS.length - 1 ? (
          <button onClick={next} className="btn-primary">
            Next
            <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleGenerate}
            className="btn-primary"
            disabled={loading}
            id="generate-plan-btn"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Generating Plan...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Generate My Plan
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default CreateEventPage;
