import React from 'react';
import { Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export const TypingIndicator: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="flex justify-start mb-4 px-2"
    >
      <div className="relative bg-white border border-[#EAE6E1] rounded-2xl rounded-tl-xs px-4 py-3 text-xs text-[#737373] flex items-center gap-2.5 lux-shadow">
        <div className="w-5 h-5 rounded-full bg-[#1A1A1A] text-[#E5D2B8] flex items-center justify-center">
          <Sparkles className="w-2.5 h-2.5" />
        </div>
        <div className="flex items-center gap-1">
          <span className="font-medium text-[#404040]">Northstar AI</span>
          <span className="text-[#8C8C8C]">is analyzing...</span>
        </div>
        <div className="flex gap-1 ml-1 items-center">
          <motion.div
            animate={{ scale: [0.6, 1.2, 0.6] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
            className="w-1.5 h-1.5 rounded-full bg-[#735A3A]"
          />
          <motion.div
            animate={{ scale: [0.6, 1.2, 0.6] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
            className="w-1.5 h-1.5 rounded-full bg-[#735A3A]"
          />
          <motion.div
            animate={{ scale: [0.6, 1.2, 0.6] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
            className="w-1.5 h-1.5 rounded-full bg-[#735A3A]"
          />
        </div>
      </div>
    </motion.div>
  );
};
