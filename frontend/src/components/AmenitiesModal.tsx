import React from 'react';
import { X, Sparkles, Building2, Trophy, ShieldCheck, Compass } from 'lucide-react';
import { motion } from 'motion/react';
import { AMENITIES, PROJECT_DETAILS } from '../data/projectData';

interface AmenitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAmenityInquiry: (amenityName: string) => void;
}

export const AmenitiesModal: React.FC<AmenitiesModalProps> = ({
  isOpen,
  onClose,
  onSelectAmenityInquiry,
}) => {
  if (!isOpen) return null;

  const getIcon = (name: string) => {
    switch (name) {
      case 'Building2':
        return <Building2 className="w-5 h-5 text-[#735A3A]" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-[#735A3A]" />;
      case 'Trophy':
        return <Trophy className="w-5 h-5 text-[#735A3A]" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-[#735A3A]" />;
      default:
        return <Compass className="w-5 h-5 text-[#735A3A]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ type: 'spring', damping: 28, stiffness: 240 }}
        className="w-full sm:max-w-2xl bg-[#FCFAF8] border-t sm:border border-[#EAE6E1] rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92dvh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EAE6E1] bg-[#FAF7F2] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-[#735A3A]" />
            <div>
              <h2 className="text-base font-bold text-[#1A1A1A]">Curated Amenities & Lifestyle</h2>
              <p className="text-xs text-[#737373]">{PROJECT_DETAILS.name} • Sector 79, Gurugram</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#737373] hover:text-[#1A1A1A] hover:bg-[#F0ECE6] rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 gap-3.5">
            {AMENITIES.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onClose();
                  onSelectAmenityInquiry(`Tell me more about the ${item.name} and leisure facilities`);
                }}
                className="bg-white border border-[#EAE6E1] hover:border-[#DFCBB9] rounded-2xl p-4 sm:p-5 flex items-start gap-4 cursor-pointer hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#EAE6E1] flex items-center justify-center shrink-0 group-hover:bg-[#F5EFEB] transition-colors">
                  {getIcon(item.iconName)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-sm sm:text-base text-[#1A1A1A] group-hover:text-[#735A3A] transition-colors">
                      {item.name}
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#735A3A] bg-[#F5EFEB] px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-xs text-[#737373] mt-1.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Luxury Specifications summary */}
          <div className="mt-6 bg-[#FAF7F2] border border-[#EAE6E1] rounded-2xl p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-3">
              Included High-Spec Finishes
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#595959]">
              {PROJECT_DETAILS.luxurySpecs.map((spec, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#735A3A]" />
                  <span>{spec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
