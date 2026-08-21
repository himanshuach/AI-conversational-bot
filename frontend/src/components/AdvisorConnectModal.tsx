import React, { useState } from 'react';
import { Phone, MessageSquare, X, ShieldCheck, Check, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { DEFAULT_ADVISOR } from '../data/projectData';

interface AdvisorConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartAdvisorChat: () => void;
}

export const AdvisorConnectModal: React.FC<AdvisorConnectModalProps> = ({
  isOpen,
  onClose,
  onStartAdvisorChat,
}) => {
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'connected'>('idle');

  if (!isOpen) return null;

  const handleStartCall = () => {
    setCallStatus('calling');
    setTimeout(() => {
      setCallStatus('connected');
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ type: 'spring', damping: 28, stiffness: 240 }}
        className="w-full sm:max-w-md bg-[#FCFAF8] border-t sm:border border-[#EAE6E1] rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 text-center flex flex-col items-center relative shadow-2xl"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#737373] hover:text-[#1A1A1A] hover:bg-[#F0ECE6] rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Heading */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5EFEB] text-[#735A3A] text-[10px] font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3 h-3 text-[#A68966]" />
            <span>Private Client Advisory</span>
          </div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">
            Connecting to a Luxury Advisor
          </h2>
          <p className="text-xs sm:text-sm text-[#737373] max-w-xs mx-auto leading-relaxed">
            Please wait a moment while we connect you with an expert who can assist with your high-net-worth real estate portfolio.
          </p>
        </div>

        {/* Advisor Profile Avatar with Pulsing Radar Rings */}
        <div className="relative w-44 h-44 flex items-center justify-center mb-6">
          {/* Animated concentric rings */}
          <div className="absolute inset-0 rounded-full border border-[#735A3A]/20 animate-ping opacity-25" style={{ animationDuration: '3s' }} />
          <div className="absolute inset-3 rounded-full border border-[#735A3A]/30 animate-pulse opacity-40" />
          <div className="absolute inset-6 rounded-full border border-[#735A3A]/40" />

          {/* Profile Image */}
          <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-white shadow-xl z-10 bg-[#EAE6E1]">
            <img
              src={DEFAULT_ADVISOR.avatarUrl}
              alt={DEFAULT_ADVISOR.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Verified status badge */}
          <div className="absolute bottom-6 right-8 z-20 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center border-2 border-white shadow-sm">
            <Check className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Advisor Details */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-[#1A1A1A]">{DEFAULT_ADVISOR.name}</h3>
          <p className="text-xs font-semibold text-[#735A3A] uppercase tracking-widest mt-0.5">
            {DEFAULT_ADVISOR.title}
          </p>
          <p className="text-xs text-[#8C8C8C] mt-1">{DEFAULT_ADVISOR.specialization}</p>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-3">
          {callStatus === 'idle' && (
            <>
              <button
                onClick={handleStartCall}
                className="w-full bg-[#1A1A1A] hover:bg-[#333333] text-white text-xs font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <Phone className="w-4 h-4 text-[#E5D2B8]" />
                <span>Start Voice Call ({DEFAULT_ADVISOR.phone})</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onStartAdvisorChat();
                }}
                className="w-full bg-transparent border border-[#735A3A] hover:bg-[#F5EFEB] text-[#735A3A] text-xs font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat with Advisor</span>
              </button>
            </>
          )}

          {callStatus === 'calling' && (
            <div className="p-4 bg-[#FAF7F2] border border-[#DFCBB9] rounded-xl text-xs text-[#735A3A] font-medium flex items-center justify-center gap-2">
              <span className="w-3 h-3 border-2 border-[#735A3A] border-t-transparent rounded-full animate-spin"></span>
              <span>Connecting priority line to Vikram Sethi...</span>
            </div>
          )}

          {callStatus === 'connected' && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Call connected • Speak through your audio device</span>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full pt-2 text-xs text-[#737373] hover:text-[#1A1A1A] transition-colors"
          >
            Cancel Request
          </button>
        </div>
      </motion.div>
    </div>
  );
};
