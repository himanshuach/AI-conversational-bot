import React from 'react';
import { LeadProfile } from '../types';
import { Sparkles, CalendarCheck2 } from 'lucide-react';

interface LeadSummaryCardProps {
  lead: LeadProfile;
  onOpenSummary: () => void;
}

export const LeadSummaryCard: React.FC<LeadSummaryCardProps> = ({ lead, onOpenSummary }) => {
  const isCustomized =
    lead.configuration !== 'Not provided' ||
    lead.budget !== 'Not provided' ||
    lead.interestLevel === 'High' ||
    lead.siteVisit !== 'Not scheduled';

  if (!isCustomized) return null;

  return (
    <div className="flex justify-center mb-4 px-2">
      <button
        onClick={onOpenSummary}
        title="View synthesized lead profile"
        className="group bg-[#FFFFFF] hover:bg-[#FBF9F7] border border-[#EAE6E1] hover:border-[#D5C9BD] rounded-full px-4 py-1.5 flex items-center gap-2.5 sm:gap-3.5 shadow-sm transition-all duration-200"
      >
        <div className="flex items-center gap-1.5 text-xs text-[#735A3A]">
          <Sparkles className="w-3.5 h-3.5 text-[#A68966]" />
          <span className="font-semibold uppercase tracking-wider text-[10px] text-[#A68966]">Live Memory</span>
        </div>

        <div className="w-px h-3 bg-[#E2DDD6]" />

        {lead.configuration !== 'Not provided' && (
          <div className="text-xs">
            <span className="text-[#737373]">Config: </span>
            <span className="font-semibold text-[#1A1A1A]">{lead.configuration}</span>
          </div>
        )}

        {lead.budget !== 'Not provided' && (
          <>
            <div className="hidden sm:block w-px h-3 bg-[#E2DDD6]" />
            <div className="hidden sm:block text-xs">
              <span className="text-[#737373]">Budget: </span>
              <span className="font-semibold text-[#1A1A1A]">{lead.budget}</span>
            </div>
          </>
        )}

        <div className="w-px h-3 bg-[#E2DDD6]" />
        <div className="flex items-center gap-1 text-xs">
          <span className="text-[#737373]">Interest: </span>
          <span
            className={`font-semibold ${
              lead.interestLevel === 'High'
                ? 'text-emerald-700'
                : lead.interestLevel === 'Medium'
                ? 'text-amber-700'
                : 'text-[#595959]'
            }`}
          >
            {lead.interestLevel}
          </span>
        </div>

        {lead.siteVisit !== 'Not scheduled' && (
          <>
            <div className="hidden md:block w-px h-3 bg-[#E2DDD6]" />
            <div className="hidden md:flex items-center gap-1 text-xs text-emerald-700 font-medium">
              <CalendarCheck2 className="w-3.5 h-3.5" />
              <span>Tour Booked</span>
            </div>
          </>
        )}
      </button>
    </div>
  );
};
