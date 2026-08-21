import React from 'react';
import { PROJECT_DETAILS, FLOOR_PLANS } from '../data/projectData';
import { LeadProfile } from '../types';
import {
  Building2,
  MapPin,
  Sparkles,
  CalendarDays,
  ShieldCheck,
  PhoneCall,
  CheckCircle2,
  ChevronRight,
  UserCheck,
} from 'lucide-react';

interface ProjectSidebarProps {
  lead: LeadProfile;
  onOpenSiteVisit: () => void;
  onOpenFloorPlans: () => void;
  onOpenAmenities: () => void;
  onOpenAdvisor: () => void;
  onOpenSummary: () => void;
  onSelectPrompt: (prompt: string) => void;
}

export const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
  lead,
  onOpenSiteVisit,
  onOpenFloorPlans,
  onOpenAmenities,
  onOpenAdvisor,
  onOpenSummary,
  onSelectPrompt,
}) => {
  return (
    <aside className="w-80 h-full bg-[#FAF7F2] border-r border-[#EAE6E1] flex flex-col justify-between overflow-y-auto shrink-0 py-6 px-5 hide-scrollbar">
      {/* Top Section: Project Identity */}
      <div className="space-y-6">
        {/* Project Card */}
        <div className="bg-white border border-[#EAE6E1] rounded-2xl p-4 lux-shadow">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#735A3A] bg-[#F5EFEB] px-2 py-0.5 rounded">
                Flagship Development
              </span>
              <h2 className="font-semibold text-xl text-[#1A1A1A] mt-1.5">{PROJECT_DETAILS.name}</h2>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#EAE6E1] flex items-center justify-center text-[#735A3A]">
              <Building2 className="w-4 h-4" />
            </div>
          </div>

          <p className="text-xs text-[#595959] flex items-center gap-1.5 mb-3">
            <MapPin className="w-3.5 h-3.5 text-[#735A3A] shrink-0" />
            <span>{PROJECT_DETAILS.location}</span>
          </p>

          <p className="text-xs text-[#737373] leading-relaxed mb-4">
            {PROJECT_DETAILS.tagline}. Spread across {PROJECT_DETAILS.landParcel}.
          </p>

          {/* Quick Pricing Grid */}
          <div className="space-y-2 pt-2 border-t border-[#F0ECE6]">
            {FLOOR_PLANS.map((plan) => (
              <div
                key={plan.id}
                onClick={() => onSelectPrompt(`Tell me details about the ${plan.type}`)}
                className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg hover:bg-[#FBF9F7] cursor-pointer transition-colors group"
              >
                <div>
                  <span className="font-medium text-[#1A1A1A] group-hover:text-[#735A3A] transition-colors">
                    {plan.type}
                  </span>
                  <span className="text-[11px] text-[#8C8C8C] ml-1.5">({plan.superArea})</span>
                </div>
                <span className="font-semibold text-[#735A3A]">{plan.priceStarting}+</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lead Profile / Live Memory Panel */}
        <div className="bg-white border border-[#EAE6E1] rounded-2xl p-4 lux-shadow">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#F0ECE6]">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#735A3A]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">Lead Profile</h3>
            </div>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                lead.interestLevel === 'High'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-stone-100 text-stone-700'
              }`}
            >
              {lead.interestLevel} Interest
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-[#F6F4F0]">
              <span className="text-[#737373]">Configuration</span>
              <span className="font-medium text-[#1A1A1A]">
                {lead.configuration !== 'Not provided' ? (
                  <span className="text-[#1A1A1A] font-semibold bg-[#F5EFEB] px-2 py-0.5 rounded">
                    {lead.configuration}
                  </span>
                ) : (
                  <span className="text-[#A3A3A3] italic">Not provided</span>
                )}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-[#F6F4F0]">
              <span className="text-[#737373]">Budget</span>
              <span className="font-medium text-[#1A1A1A]">
                {lead.budget !== 'Not provided' ? (
                  <span className="text-[#1A1A1A] font-semibold bg-[#F5EFEB] px-2 py-0.5 rounded">{lead.budget}</span>
                ) : (
                  <span className="text-[#A3A3A3] italic">Not provided</span>
                )}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-[#F6F4F0]">
              <span className="text-[#737373]">Purpose</span>
              <span className="font-medium text-[#1A1A1A]">
                {lead.purpose !== 'Not provided' ? lead.purpose : <span className="text-[#A3A3A3] italic">Not provided</span>}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-[#F6F4F0]">
              <span className="text-[#737373]">Site Visit</span>
              <span className="font-medium">
                {lead.siteVisit !== 'Not scheduled' ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {lead.siteVisit}
                  </span>
                ) : (
                  <span className="text-[#A3A3A3] italic">Not scheduled</span>
                )}
              </span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-[#737373]">Follow-up</span>
              <span
                className={`font-semibold ${
                  lead.followUp === 'Required' ? 'text-[#735A3A]' : 'text-[#737373]'
                }`}
              >
                {lead.followUp}
              </span>
            </div>
          </div>

          <button
            onClick={onOpenSummary}
            className="w-full mt-3.5 py-2 px-3 bg-[#FAF7F2] hover:bg-[#F0ECE6] text-[#735A3A] border border-[#EAE6E1] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>View Full Summary</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Navigation Items */}
        <div className="space-y-1.5">
          <button
            onClick={onOpenFloorPlans}
            className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-[#EAE6E1] text-xs font-medium text-[#404040] hover:text-[#1A1A1A] transition-all duration-150"
          >
            <div className="flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-[#735A3A]" />
              <span>Architectural Floor Plans</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-[#A3A3A3]" />
          </button>

          <button
            onClick={onOpenAmenities}
            className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-[#EAE6E1] text-xs font-medium text-[#404040] hover:text-[#1A1A1A] transition-all duration-150"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[#735A3A]" />
              <span>Clubhouse & Amenities</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-[#A3A3A3]" />
          </button>

          <button
            onClick={onOpenSiteVisit}
            className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-[#EAE6E1] text-xs font-medium text-[#404040] hover:text-[#1A1A1A] transition-all duration-150"
          >
            <div className="flex items-center gap-2.5">
              <CalendarDays className="w-4 h-4 text-[#735A3A]" />
              <span>Book Private Site Visit</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-[#A3A3A3]" />
          </button>
        </div>
      </div>

      {/* Bottom Section: RERA & Advisor Connect */}
      <div className="mt-6 pt-4 border-t border-[#EAE6E1] space-y-3">
        <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#EAE6E1] text-[11px] text-[#737373]">
          <div className="flex items-center gap-1.5 font-medium text-[#1A1A1A] mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>HARERA Approved</span>
          </div>
          <p className="font-mono text-[10px] text-[#8C8C8C]">{PROJECT_DETAILS.reraNumber}</p>
        </div>

        <button
          onClick={onOpenAdvisor}
          className="w-full py-2.5 px-3 bg-[#1A1A1A] hover:bg-[#333333] text-white rounded-xl text-xs font-medium flex items-center justify-center gap-2 shadow-sm transition-colors"
        >
          <PhoneCall className="w-3.5 h-3.5 text-[#E5D2B8]" />
          <span>Connect with Portfolio Manager</span>
        </button>
      </div>
    </aside>
  );
};
