import React from 'react';
import { Banknote, Building2, Sparkles, CalendarDays, PhoneCall } from 'lucide-react';

interface QuickActionsProps {
  onSelectAction: (prompt: string) => void;
  onOpenFloorPlans: () => void;
  onOpenAmenities: () => void;
  onOpenSiteVisit: () => void;
  onOpenAdvisor: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onSelectAction,
  onOpenFloorPlans,
  onOpenAmenities,
  onOpenSiteVisit,
  onOpenAdvisor,
}) => {
  return (
    <div className="flex gap-2 overflow-x-auto hide-scrollbar w-full max-w-2xl mx-auto pb-0.5">
      <button
        onClick={() => onSelectAction('What is the complete pricing for 2 BHK and 3 BHK?')}
        className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-[#EAE6E1] bg-white text-[#595959] hover:border-[#735A3A] hover:text-[#735A3A] hover:bg-[#FAF7F2] transition-colors text-xs font-semibold"
      >
        <Banknote className="w-3.5 h-3.5 text-[#735A3A]" />
        <span>Pricing</span>
      </button>

      <button
        onClick={onOpenFloorPlans}
        className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-[#EAE6E1] bg-white text-[#595959] hover:border-[#735A3A] hover:text-[#735A3A] hover:bg-[#FAF7F2] transition-colors text-xs font-semibold"
      >
        <Building2 className="w-3.5 h-3.5 text-[#735A3A]" />
        <span>Floor Plans</span>
      </button>

      <button
        onClick={onOpenAmenities}
        className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-[#EAE6E1] bg-white text-[#595959] hover:border-[#735A3A] hover:text-[#735A3A] hover:bg-[#FAF7F2] transition-colors text-xs font-semibold"
      >
        <Sparkles className="w-3.5 h-3.5 text-[#735A3A]" />
        <span>Amenities</span>
      </button>

      <button
        onClick={onOpenSiteVisit}
        className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#735A3A] text-white hover:bg-[#5E472D] transition-colors text-xs font-semibold"
      >
        <CalendarDays className="w-3.5 h-3.5 text-[#E5D2B8]" />
        <span>Book Visit</span>
      </button>

      <button
        onClick={onOpenAdvisor}
        className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-[#DFCBB9] bg-[#F5EFEB] text-[#735A3A] hover:bg-[#EBDDCF] transition-colors text-xs font-semibold"
      >
        <PhoneCall className="w-3.5 h-3.5" />
        <span>Advisor</span>
      </button>
    </div>
  );
};
