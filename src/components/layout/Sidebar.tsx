import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Sparkles, LayoutDashboard, Plus, Settings, X,
  Calendar, ChevronRight
} from 'lucide-react';
import { useEventStore } from '../../store/eventStore';

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { events, settings } = useEventStore();

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'My Events' },
    { path: '/settings', icon: Settings, label: 'Settings & Help' },
  ];

  const recentEvents = events.slice(-4).reverse();

  return (
    <aside
      className="flex flex-col w-64 min-h-screen bg-[#1a1752] border-r border-white/10"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-coral-500 to-violet-500 flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <span className="font-display font-bold text-white text-base tracking-tight">Planora</span>
            <span className="gradient-text font-display font-bold text-base ml-1">AI</span>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="btn-ghost p-1"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Demo mode badge */}
      {settings.demoMode && (
        <div className="mx-4 mt-3 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <p className="text-amber-300 text-xs font-medium">⚡ Demo Mode Active</p>
          <p className="text-amber-400/60 text-xs mt-0.5">Configure AI key in Settings</p>
        </div>
      )}

      {/* Create Event CTA */}
      <div className="p-4">
        <button
          onClick={() => { navigate('/create'); onClose?.(); }}
          className="btn-primary w-full justify-center"
          aria-label="Create a new event"
        >
          <Plus size={16} />
          Create Event
        </button>
      </div>

      {/* Navigation */}
      <nav className="px-3 space-y-1">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            onClick={onClose}
            className={({ isActive }) =>
              isActive ? 'nav-item-active' : 'nav-item'
            }
            aria-label={label}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Recent events */}
      {recentEvents.length > 0 && (
        <div className="px-3 mt-6">
          <p className="text-xs font-semibold text-white/30 uppercase tracking-wider px-2 mb-2">
            Recent Events
          </p>
          <div className="space-y-1">
            {recentEvents.map((event) => (
              <NavLink
                key={event.id}
                to={`/event/${event.id}`}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-xl text-sm cursor-pointer transition-all duration-200 ${
                    isActive
                      ? 'bg-violet-500/20 text-white border border-violet-500/30'
                      : 'text-white/50 hover:text-white hover:bg-white/8'
                  }`
                }
              >
                <Calendar size={14} className="flex-shrink-0" />
                <span className="truncate flex-1">{event.formData.name}</span>
                <ChevronRight size={12} className="flex-shrink-0 opacity-50" />
              </NavLink>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto p-4 border-t border-white/10">
        <p className="text-xs text-white/20 text-center">
          Planora AI v1.0 · PromptWars R5C5
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
