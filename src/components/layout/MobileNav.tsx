import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Sparkles, ArrowLeft } from 'lucide-react';

interface MobileNavProps {
  onMenuClick: () => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const canGoBack = location.pathname !== '/dashboard';

  return (
    <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#1a1752] border-b border-white/10 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        {canGoBack ? (
          <button
            onClick={() => navigate(-1)}
            className="btn-ghost p-1.5 -ml-1"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
        ) : (
          <button
            onClick={onMenuClick}
            className="btn-ghost p-1.5 -ml-1"
            aria-label="Open navigation menu"
          >
            <Menu size={20} />
          </button>
        )}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-coral-500 to-violet-500 flex items-center justify-center">
            <Sparkles size={14} className="text-white" />
          </div>
          <span className="font-display font-bold text-white text-sm">
            Planora <span className="gradient-text">AI</span>
          </span>
        </div>
      </div>
      <button
        onClick={onMenuClick}
        className="btn-ghost p-1.5"
        aria-label="Open navigation menu"
      >
        <Menu size={20} />
      </button>
    </header>
  );
};

export default MobileNav;
