import React, { useState } from 'react';
import { X, Building2, Check, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { FLOOR_PLANS } from '../data/projectData';

interface FloorPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectConfiguration: (configName: string) => void;
}

export const FloorPlansModal: React.FC<FloorPlansModalProps> = ({
  isOpen,
  onClose,
  onSelectConfiguration,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState(FLOOR_PLANS[1].id); // 3 BHK default

  if (!isOpen) return null;

  const currentPlan = FLOOR_PLANS.find((p) => p.id === selectedPlanId) || FLOOR_PLANS[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ type: 'spring', damping: 28, stiffness: 240 }}
        className="w-full sm:max-w-3xl bg-[#FCFAF8] border-t sm:border border-[#EAE6E1] rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92dvh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EAE6E1] bg-[#FAF7F2] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-[#735A3A]" />
            <div>
              <h2 className="text-base font-bold text-[#1A1A1A]">Architectural Floor Plans</h2>
              <p className="text-xs text-[#737373]">Northstar One • Sector 79, Gurugram</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#737373] hover:text-[#1A1A1A] hover:bg-[#F0ECE6] rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#EAE6E1] bg-white px-6 overflow-x-auto hide-scrollbar gap-2 pt-3">
          {FLOOR_PLANS.map((plan) => {
            const isActive = plan.id === selectedPlanId;
            return (
              <button
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
                className={`pb-3 px-4 text-xs font-semibold whitespace-nowrap transition-all border-b-2 ${
                  isActive
                    ? 'border-[#735A3A] text-[#735A3A]'
                    : 'border-transparent text-[#737373] hover:text-[#1A1A1A]'
                }`}
              >
                {plan.type}
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Visual Floorplan Blueprint Representation */}
            <div className="bg-[#FAF7F2] border border-[#EAE6E1] rounded-2xl p-6 flex flex-col items-center justify-center relative min-h-[260px]">
              <div className="w-full h-48 border border-dashed border-[#DFCBB9] rounded-xl flex flex-col items-center justify-center p-4 bg-white/60 relative overflow-hidden">
                {/* SVG Blueprint Mockup */}
                <svg viewBox="0 0 200 140" className="w-full h-full text-[#735A3A]/40 stroke-current fill-none stroke-[1.5]">
                  <rect x="10" y="10" width="180" height="120" rx="4" />
                  <line x1="70" y1="10" x2="70" y2="130" />
                  <line x1="70" y1="70" x2="190" y2="70" />
                  <line x1="130" y1="70" x2="130" y2="130" />
                  <rect x="20" y="20" width="40" height="40" className="stroke-[#735A3A]/70" />
                  <rect x="80" y="20" width="40" height="40" className="stroke-[#735A3A]/70" />
                  <rect x="80" y="80" width="40" height="40" className="stroke-[#735A3A]/70" />
                  <circle cx="160" cy="40" r="14" className="stroke-[#735A3A]/50" />
                  <text x="30" y="44" className="fill-[#735A3A] stroke-none text-[9px] font-sans font-medium">Master</text>
                  <text x="90" y="44" className="fill-[#735A3A] stroke-none text-[9px] font-sans font-medium">Living</text>
                  <text x="90" y="104" className="fill-[#735A3A] stroke-none text-[9px] font-sans font-medium">Dining</text>
                  <text x="145" y="104" className="fill-[#735A3A] stroke-none text-[9px] font-sans font-medium">Deck</text>
                </svg>
                <span className="text-[10px] text-[#8C8C8C] uppercase tracking-wider mt-2 font-mono">
                  {currentPlan.type} • Architectural Schematic
                </span>
              </div>

              <div className="w-full mt-4 flex items-center justify-between text-xs text-[#595959] bg-white p-3 rounded-xl border border-[#EAE6E1]">
                <div>
                  <span className="text-[#8C8C8C] text-[10px] uppercase block">Super Area</span>
                  <strong className="text-[#1A1A1A]">{currentPlan.superArea}</strong>
                </div>
                <div className="w-px h-6 bg-[#F0ECE6]" />
                <div>
                  <span className="text-[#8C8C8C] text-[10px] uppercase block">Carpet Area</span>
                  <strong className="text-[#1A1A1A]">{currentPlan.carpetArea}</strong>
                </div>
                <div className="w-px h-6 bg-[#F0ECE6]" />
                <div>
                  <span className="text-[#8C8C8C] text-[10px] uppercase block">Price</span>
                  <strong className="text-[#735A3A]">{currentPlan.priceStarting}*</strong>
                </div>
              </div>
            </div>

            {/* Plan Details & Features */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#735A3A] bg-[#F5EFEB] px-2 py-0.5 rounded">
                  Configuration Specs
                </span>
                <h3 className="text-xl font-bold text-[#1A1A1A] mt-1">{currentPlan.type}</h3>
                <p className="text-xs sm:text-sm text-[#595959] mt-2 leading-relaxed">
                  {currentPlan.description}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#F0ECE6]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                  Key Highlights
                </h4>
                <div className="space-y-1.5">
                  {currentPlan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-[#404040]">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onSelectConfiguration(currentPlan.type);
                }}
                className="w-full mt-4 bg-[#735A3A] hover:bg-[#5E472D] text-white text-xs font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <span>Inquire About {currentPlan.type}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
