import React from 'react';
import { X, MapPin, ChevronRight, UserCheck, PhoneCall } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PROJECT_DETAILS, FLOOR_PLANS } from '../data/projectData';
import { LeadProfile } from '../types';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lead: LeadProfile;
  onOpenSiteVisit: () => void;
  onOpenFloorPlans: () => void;
  onOpenAmenities: () => void;
  onOpenAdvisor: () => void;
  onOpenSummary: () => void;
  onSelectPrompt: (prompt: string) => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  lead,
  onOpenSiteVisit,
  onOpenFloorPlans,
  onOpenAmenities,
  onOpenAdvisor,
  onOpenSummary,
  onSelectPrompt,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          />

          {/* Drawer content */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-80 max-w-[85vw] h-full bg-[#FAF7F2] border-r border-[#EAE6E1] flex flex-col justify-between p-5 overflow-y-auto z-10"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#EAE6E1] mb-5">
                <div>
                  <h2 className="text-base font-bold text-[#1A1A1A]">{PROJECT_DETAILS.name}</h2>
                  <p className="text-xs text-[#737373] flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-[#735A3A]" /> Sector 79, Gurugram
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-[#F0ECE6] text-[#737373]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Pricing Cards */}
              <div className="space-y-2 mb-6">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#8C8C8C]">
                  Available Configurations
                </div>
                {FLOOR_PLANS.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => {
                      onClose();
                      onSelectPrompt(`Tell me details about the ${plan.type}`);
                    }}
                    className="bg-white p-2.5 rounded-xl border border-[#EAE6E1] flex items-center justify-between text-xs cursor-pointer hover:border-[#735A3A]"
                  >
                    <div>
                      <span className="font-semibold text-[#1A1A1A]">{plan.type}</span>
                      <span className="text-[11px] text-[#8C8C8C] block">{plan.superArea}</span>
                    </div>
                    <span className="font-bold text-[#735A3A]">{plan.priceStarting}+</span>
                  </div>
                ))}
              </div>

              {/* Lead Profile */}
              <div className="bg-white border border-[#EAE6E1] rounded-2xl p-4 mb-6 lux-shadow">
                <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-[#F0ECE6]">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-[#1A1A1A]">
                    <UserCheck className="w-3.5 h-3.5 text-[#735A3A]" />
                    <span>Lead Profile</span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {lead.interestLevel}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#737373]">Configuration:</span>
                    <span className="font-medium text-[#1A1A1A]">{lead.configuration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#737373]">Budget:</span>
                    <span className="font-medium text-[#1A1A1A]">{lead.budget}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#737373]">Site Visit:</span>
                    <span className="font-medium text-emerald-700">{lead.siteVisit}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onOpenSummary();
                  }}
                  className="w-full mt-3 py-1.5 bg-[#FAF7F2] text-[#735A3A] text-xs font-semibold rounded-lg border border-[#EAE6E1]"
                >
                  View Full Summary
                </button>
              </div>

              {/* Action Links */}
              <div className="space-y-1.5">
                <button
                  onClick={() => {
                    onClose();
                    onOpenFloorPlans();
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-white text-xs font-medium text-[#404040] flex items-center justify-between"
                >
                  <span>Floor Plans</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#A3A3A3]" />
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onOpenAmenities();
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-white text-xs font-medium text-[#404040] flex items-center justify-between"
                >
                  <span>Amenities & Clubhouse</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#A3A3A3]" />
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onOpenSiteVisit();
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-white text-xs font-medium text-[#404040] flex items-center justify-between"
                >
                  <span>Schedule Site Visit</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#A3A3A3]" />
                </button>
              </div>
            </div>

            {/* Bottom Button */}
            <div className="pt-4 border-t border-[#EAE6E1]">
              <button
                onClick={() => {
                  onClose();
                  onOpenAdvisor();
                }}
                className="w-full py-2.5 bg-[#1A1A1A] text-white rounded-xl text-xs font-medium flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-3.5 h-3.5 text-[#E5D2B8]" />
                <span>Talk with Advisor</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
