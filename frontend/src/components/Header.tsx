import React from 'react';
import { Sparkles, PhoneCall, BarChart3, RotateCcw, Menu, MapPin } from 'lucide-react';

interface HeaderProps {
  onOpenSummary: () => void;
  onOpenAdvisor: () => void;
  onOpenFloorPlans: () => void;
  onResetChat: () => void;
  onToggleMobileDrawer: () => void;
  isStreaming?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSummary,
  onOpenAdvisor,
  onResetChat,
  onToggleMobileDrawer,
}) => {
  return (
    <header className="bg-[#FCFAF8] border-b border-[#EAE6E1] sticky top-0 z-40 shrink-0">
      <div className="w-full max-w-screen-xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">

        {/* ── LEFT: hamburger (mobile) + brand ── */}
        <div className="flex items-center gap-2 min-w-0">
          {/* Mobile menu toggle */}
          <button
            id="mobile-drawer-toggle"
            onClick={onToggleMobileDrawer}
            aria-label="Open project details menu"
            className="lg:hidden p-2 -ml-1 text-[#1A1A1A] hover:bg-[#F0ECE6] rounded-xl transition-colors shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Brand identity */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] flex items-center justify-center text-[#E5D2B8] shadow-sm shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm sm:text-base tracking-tight text-[#1A1A1A] truncate">
                  Northstar AI
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EFECE6] text-[#735A3A] border border-[#E2DDD6] shrink-0">
                  Sales Assistant
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-[#737373]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="font-medium text-emerald-700">Online</span>
                <span className="hidden sm:inline text-[#C4C0B9]">•</span>
                <span className="hidden sm:inline-flex items-center gap-0.5 text-[#595959] truncate">
                  <MapPin className="w-3 h-3 text-[#735A3A] shrink-0" />
                  Northstar One, Sector 79
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: action buttons ── */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Advisor */}
          <button
            id="header-advisor-btn"
            onClick={onOpenAdvisor}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold bg-[#F5EFEB] text-[#735A3A] hover:bg-[#EBDDCF] border border-[#DFCBB9] transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span className="hidden xs:inline sm:hidden md:inline">Advisor</span>
          </button>

          {/* Summary */}
          <button
            id="header-summary-btn"
            onClick={onOpenSummary}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold bg-[#1A1A1A] text-white hover:bg-[#333333] transition-colors shadow-sm"
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#E5D2B8]" />
            <span className="hidden sm:inline">Summary</span>
          </button>

          {/* Reset */}
          <button
            id="header-reset-btn"
            onClick={onResetChat}
            aria-label="Reset conversation"
            className="p-2 text-[#737373] hover:text-[#1A1A1A] hover:bg-[#F0ECE6] rounded-full transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
