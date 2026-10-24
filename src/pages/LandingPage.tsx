import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, ChevronRight, Star, Calendar, Users, DollarSign,
  CheckCircle, Zap, Shield, BarChart2, Clock, MessageSquare,
  ArrowRight, Heart, Music, Camera, Utensils
} from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'AI-Powered Planning',
    description: 'Generate complete event plans in seconds using Google Gemini. Get personalized schedules, menus, and vendor checklists tailored to your budget and vision.',
    gradient: 'from-coral-500 to-violet-500',
  },
  {
    icon: BarChart2,
    title: 'Smart Budget Intelligence',
    description: 'Category-level budget allocations with overflow warnings, contingency reserves, and realistic trade-off suggestions — calculations enforced in app code.',
    gradient: 'from-violet-500 to-blue-500',
  },
  {
    icon: Clock,
    title: 'Dynamic Timeline',
    description: 'Event-date-relative tasks with live overdue detection. Stay on track with colour-coded priorities and deadline alerts.',
    gradient: 'from-gold-500 to-coral-500',
  },
  {
    icon: MessageSquare,
    title: 'AI Copilot',
    description: 'Ask follow-up questions about cost reduction, guest scaling, or vendor alternatives. Context-aware responses based on your actual event data.',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Shield,
    title: 'Privacy-First Design',
    description: 'All event data stored locally in your browser. No account required. API keys handled server-side only — never in your frontend bundle.',
    gradient: 'from-blue-500 to-indigo-500',
  },
  {
    icon: CheckCircle,
    title: 'Vendor Organizer',
    description: 'Track vendors by category, status, cost, and contact details. Export everything to CSV for offline use. Works perfectly without an internet connection.',
    gradient: 'from-pink-500 to-rose-500',
  },
];

const eventTypes = [
  { emoji: '💍', label: 'Weddings', color: 'from-rose-500/20 to-pink-500/20 border-rose-500/30' },
  { emoji: '🎂', label: 'Birthdays', color: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30' },
  { emoji: '🎓', label: 'College Events', color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30' },
  { emoji: '🏘️', label: 'Community', color: 'from-green-500/20 to-teal-500/20 border-green-500/30' },
  { emoji: '💼', label: 'Corporate', color: 'from-slate-500/20 to-zinc-500/20 border-slate-500/30' },
  { emoji: '💕', label: 'Anniversaries', color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30' },
];

const steps = [
  { num: '01', title: 'Describe Your Event', desc: 'Fill in your event type, date, location, guest count, and budget in our guided wizard.' },
  { num: '02', title: 'AI Generates Your Plan', desc: 'Gemini AI creates a personalised schedule, checklist, budget breakdown, and vendor list.' },
  { num: '03', title: 'Customise Everything', desc: 'Edit tasks, add vendors, adjust budget categories, and chat with the AI Copilot.' },
  { num: '04', title: 'Export & Celebrate', desc: 'Download your plan as CSV, print a summary, and execute your perfect event.' },
];

const testimonials = [
  { name: 'Sarah M.', role: 'Bride', text: 'Planora AI saved me 20+ hours of spreadsheet work. The budget alerts stopped me from overspending!', rating: 5 },
  { name: 'Dev T.', role: 'College Events Officer', text: 'Used it for our annual fest with 800 students. The task timeline kept our entire team aligned.', rating: 5 },
  { name: 'Priya K.', role: 'Community Organiser', text: 'The vendor tracker and AI Copilot are genuinely useful. Not just a fancy form — actual planning intelligence.', rating: 5 },
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);

  // Parallax subtle effect
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const scrollY = window.scrollY;
        heroRef.current.style.transform = `translateY(${scrollY * 0.1}px)`;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0f0d2e] overflow-x-hidden" id="landing-page">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#0f0d2e]/80 backdrop-blur-md border-b border-white/5" role="navigation" aria-label="Landing navigation">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-coral-500 to-violet-500 flex items-center justify-center shadow-glow-violet">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="font-display font-bold text-white text-xl tracking-tight">
            Planora <span className="gradient-text">AI</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-ghost text-sm"
            aria-label="Go to dashboard"
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate('/create')}
            className="btn-primary text-sm"
            aria-label="Start planning your event"
            id="hero-cta-nav"
          >
            Start Planning <ChevronRight size={14} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-24 pb-20 overflow-hidden" aria-label="Hero section">
        {/* Background orbs */}
        <div className="orb-violet w-96 h-96 -top-20 -left-20 opacity-60" aria-hidden="true" />
        <div className="orb-coral w-80 h-80 -bottom-10 -right-20 opacity-50" aria-hidden="true" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-violet-500/10 animate-spin-slow" aria-hidden="true" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-coral-500/10 animate-spin-slow" style={{ animationDirection: 'reverse' }} aria-hidden="true" />

        <div className="relative z-10 text-center max-w-4xl mx-auto" ref={heroRef}>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-sm font-medium mb-8 animate-in">
            <Sparkles size={14} className="animate-pulse-slow" />
            PromptWars Virtual Round 5 · Challenge 5
          </div>

          <h1 className="text-5xl md:text-7xl font-display font-bold text-white leading-tight mb-6 slide-in-up">
            Plan Your Perfect
            <br />
            <span className="gradient-text">Celebration</span>
            <br />
            with AI
          </h1>

          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 slide-in-up" style={{ animationDelay: '0.1s' }}>
            Planora AI turns your event vision into a detailed, actionable plan — complete with timelines, budgets, vendor checklists, and intelligent suggestions powered by Google Gemini.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 slide-in-up" style={{ animationDelay: '0.2s' }}>
            <button
              onClick={() => navigate('/create')}
              className="btn-primary text-base px-8 py-3.5"
              aria-label="Create your first event plan"
              id="hero-cta-main"
            >
              <Sparkles size={18} />
              Create Your Event Plan
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-secondary text-base px-8 py-3.5"
              aria-label="See a demo event"
              id="hero-demo-btn"
            >
              View Sample Event
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto mt-16 slide-in-up" style={{ animationDelay: '0.3s' }}>
            {[
              { icon: Calendar, value: '6', label: 'Event Types' },
              { icon: Users, value: '∞', label: 'Guests Supported' },
              { icon: DollarSign, value: '7', label: 'Currencies' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-2">
                  <Icon size={18} className="text-violet-400" />
                </div>
                <div className="text-2xl font-display font-bold gradient-text">{value}</div>
                <div className="text-xs text-white/40">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating sample plan card */}
        <div className="hidden xl:block absolute right-8 top-1/2 -translate-y-1/2 w-72 animate-float" aria-hidden="true">
          <div className="card p-5 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-white">Sample Wedding Plan</span>
              <span className="badge-ai">AI</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/50">
              <Heart size={12} className="text-coral-400" />
              <span>Emma & James · 120 guests</span>
            </div>
            <div className="divider" />
            <div className="space-y-2">
              {[
                { icon: CheckCircle, label: 'Venue booked', done: true },
                { icon: Camera, label: 'Photographer confirmed', done: true },
                { icon: Music, label: 'Book live band', done: false },
                { icon: Utensils, label: 'Finalise menu', done: false },
              ].map(({ icon: Icon, label, done }) => (
                <div key={label} className={`flex items-center gap-2 text-xs ${done ? 'text-emerald-400' : 'text-white/50'}`}>
                  <Icon size={12} />
                  <span className={done ? 'line-through opacity-60' : ''}>{label}</span>
                </div>
              ))}
            </div>
            <div className="divider" />
            <div>
              <div className="flex justify-between text-xs text-white/50 mb-1">
                <span>Budget Used</span>
                <span>$12,850 / $40,000</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill w-[32%] bg-gradient-to-r from-coral-500 to-violet-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Event Types */}
      <section className="py-20 px-6" aria-labelledby="event-types-heading">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 id="event-types-heading" className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              Plan Any Celebration
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              From intimate anniversaries to large-scale community festivals — Planora AI adapts its recommendations to your specific event type.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {eventTypes.map(({ emoji, label, color }) => (
              <button
                key={label}
                onClick={() => navigate('/create')}
                className={`flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br border transition-all duration-200 hover:scale-105 hover:shadow-glow-violet ${color}`}
                aria-label={`Plan a ${label} event`}
              >
                <span className="text-3xl" role="img" aria-hidden="true">{emoji}</span>
                <span className="font-semibold text-white text-sm">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-6 bg-[#1a1752]/30" aria-labelledby="how-it-works-heading">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 id="how-it-works-heading" className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              From Idea to <span className="gradient-text">Execution</span>
            </h2>
            <p className="text-white/50">Four simple steps to your perfect event</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map(({ num, title, desc }) => (
              <div key={num} className="relative">
                {/* Connector line */}
                {num !== '04' && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-violet-500/50 to-transparent -translate-y-1/2 z-0" aria-hidden="true" />
                )}
                <div className="card p-5 relative z-10 h-full">
                  <div className="text-4xl font-display font-bold gradient-text mb-3">{num}</div>
                  <h3 className="font-semibold text-white text-sm mb-2">{title}</h3>
                  <p className="text-white/40 text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6" aria-labelledby="features-heading">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 id="features-heading" className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              Everything You Need to <span className="gradient-text">Celebrate Right</span>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Production-grade planning tools built for real events, not just demos.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, description, gradient }) => (
              <div key={title} className="card-hover p-6 group">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-glow-violet group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={20} className="text-white" />
                </div>
                <h3 className="font-display font-semibold text-white text-base mb-2">{title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-[#1a1752]/30" aria-labelledby="testimonials-heading">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 id="testimonials-heading" className="text-3xl font-display font-bold text-white mb-4">
              Trusted by Event Planners
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map(({ name, role, text, rating }) => (
              <div key={name} className="card p-6">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} size={14} className="text-gold-400 fill-gold-400" aria-hidden="true" />
                  ))}
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-4">"{text}"</p>
                <div>
                  <p className="text-white text-sm font-semibold">{name}</p>
                  <p className="text-white/40 text-xs">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 relative overflow-hidden" aria-labelledby="cta-heading">
        <div className="orb-violet w-96 h-96 top-0 left-1/2 -translate-x-1/2 opacity-40" aria-hidden="true" />
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h2 id="cta-heading" className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
            Ready to plan your
            <br />
            <span className="gradient-text">perfect celebration?</span>
          </h2>
          <p className="text-white/50 text-lg mb-10">
            No account needed. Works entirely in your browser. Demo mode available without an AI key.
          </p>
          <button
            onClick={() => navigate('/create')}
            className="btn-primary text-lg px-10 py-4 shadow-glow-violet"
            aria-label="Get started with Planora AI"
            id="footer-cta"
          >
            <Sparkles size={20} />
            Get Started Free
          </button>
          <p className="text-white/30 text-xs mt-4">
            🔒 Your data stays in your browser. No signup required.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-6" role="contentinfo">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-coral-500 to-violet-500 flex items-center justify-center">
              <Sparkles size={13} className="text-white" />
            </div>
            <span className="text-white/70 text-sm">Planora AI · PromptWars Virtual Round 5, Challenge 5</span>
          </div>
          <p className="text-white/30 text-xs">
            Demo content is clearly labelled. All AI suggestions are illustrative and not verified vendor quotes.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
