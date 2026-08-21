import React from 'react';
import { Info, Banknote, BedDouble, CalendarDays, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface WelcomeStateProps {
  onSelectPrompt: (prompt: string) => void;
}

export const WelcomeState: React.FC<WelcomeStateProps> = ({ onSelectPrompt }) => {
  const suggestions = [
    {
      icon: Info,
      text: 'Tell me about Northstar One',
      description: 'Sector 79 master plan & Aravalli foothills views',
    },
    {
      icon: Banknote,
      text: 'What is the price of a 2 BHK?',
      description: 'Starting at ₹1.35 Cr with flexible payment plans',
    },
    {
      icon: BedDouble,
      text: "I'm looking for a 3 BHK",
      description: '2,150 sq.ft with wrap-around balconies',
    },
    {
      icon: CalendarDays,
      text: "I'd like to schedule a site visit",
      description: 'Reserve a curated private tour with our concierge',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full max-w-2xl mx-auto px-2 sm:px-0 py-6 sm:py-8 text-center flex flex-col items-center"
    >
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F5EFEB] border border-[#DFCBB9] text-[#735A3A] text-xs font-semibold mb-4">
        <Sparkles className="w-3.5 h-3.5 text-[#A68966]" />
        <span>Northstar One · Sector 79, Gurugram</span>
      </div>

      {/* Heading */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#1A1A1A] mb-1.5 px-2">
        Welcome to Northstar One
      </h1>
      <h2 className="text-base sm:text-lg font-medium text-[#735A3A] mb-2">
        Your AI property assistant
      </h2>
      <p className="text-sm text-[#737373] max-w-sm sm:max-w-md mb-6 sm:mb-8 leading-relaxed px-2">
        Ask about configurations, pricing, amenities or arrange a personalized site visit.
      </p>

      {/* Suggestion grid — 1 column on mobile, 2 on sm+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
        {suggestions.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={idx}
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelectPrompt(item.text)}
              className="bg-white border border-[#EAE6E1] hover:border-[#DFCBB9] rounded-2xl p-4 sm:p-5 text-left lux-shadow hover:lux-shadow-hover transition-all duration-200 group flex flex-col gap-2 touch-manipulation"
            >
              <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] border border-[#EAE6E1] flex items-center justify-center text-[#735A3A] group-hover:bg-[#F5EFEB] transition-colors">
                <Icon className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="font-semibold text-sm text-[#1A1A1A] group-hover:text-[#735A3A] transition-colors">
                  {item.text}
                </div>
                <div className="text-xs text-[#8C8C8C] mt-0.5 line-clamp-1">{item.description}</div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};
