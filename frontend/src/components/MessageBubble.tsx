import React from 'react';
import { Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { ChatMessage } from '../types';
import { ArrowRight } from 'lucide-react';
import { SiteVisitWidget } from './SiteVisitWidget';

interface MessageBubbleProps {
  message: ChatMessage;
  onBookSiteVisit: (booking: { date: string; time: string; name: string; phone: string }) => void;
  onSelectAction?: (actionPrompt: string) => void;
  isLoadingBooking?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onBookSiteVisit,
  onSelectAction,
  isLoadingBooking = false,
}) => {
  const isUser = message.sender === 'user';

  const formatText = (content: string) => {
    const paragraphs = content.split('\n\n');
    return paragraphs.map((para, pIdx) => {
      const lines = para.split('\n');
      return (
        <p key={pIdx} className={pIdx > 0 ? 'mt-2' : ''}>
          {lines.map((line, lIdx) => {
            const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
            const cleanedLine = isBullet ? line.trim().substring(2) : line;
            const parts = cleanedLine.split(/(\*\*.*?\*\*)/g);
            return (
              <span
                key={lIdx}
                className={
                  isBullet
                    ? 'block pl-3 relative before:content-["•"] before:absolute before:left-0 before:text-[#735A3A]'
                    : lIdx > 0
                    ? 'block'
                    : ''
                }
              >
                {parts.map((part, pI) =>
                  part.startsWith('**') && part.endsWith('**') ? (
                    <strong key={pI} className="font-semibold text-[#1A1A1A]">
                      {part.slice(2, -2)}
                    </strong>
                  ) : (
                    part
                  )
                )}
              </span>
            );
          })}
        </p>
      );
    });
  };

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex justify-end mb-3 px-1"
      >
        <div className="max-w-[85%] sm:max-w-[75%] bg-[#1A1A1A] text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed shadow-md">
          {message.text}
          <div className="text-[10px] text-white/40 text-right mt-1 font-mono">
            {message.timestamp}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex justify-start mb-3 px-1"
    >
      <div className="relative max-w-[92%] sm:max-w-[85%] bg-white border border-[#EAE6E1] rounded-2xl rounded-tl-sm px-4 py-3.5 text-sm leading-relaxed lux-shadow">
        {/* AI badge */}
        <div className="absolute -left-2.5 -top-2.5 w-6 h-6 rounded-full bg-[#1A1A1A] text-[#E5D2B8] flex items-center justify-center shadow-sm border-2 border-white">
          <Sparkles className="w-3 h-3" />
        </div>

        <div className="text-[#262626]">{formatText(message.text)}</div>

        {/* Inline property card */}
        {message.propertyCard && (
          <div className="mt-3 border border-[#EAE6E1] rounded-xl bg-[#FAF7F2] p-3">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#735A3A] bg-[#F5EFEB] px-2 py-0.5 rounded">
                {message.propertyCard.tag || 'Residence'}
              </span>
              <span className="text-xs font-bold text-[#735A3A]">{message.propertyCard.price}</span>
            </div>
            <div className="font-semibold text-sm text-[#1A1A1A]">{message.propertyCard.title}</div>
            <p className="text-xs text-[#737373] mt-0.5">{message.propertyCard.subtitle}</p>
          </div>
        )}

        {/* Site visit widget */}
        {message.showSiteVisitWidget && (
          <SiteVisitWidget onBook={onBookSiteVisit} isLoading={isLoadingBooking} />
        )}

        {/* Inline action chips */}
        {message.actions && message.actions.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-[#F0ECE6] flex flex-wrap gap-1.5">
            {message.actions.map((act, i) => (
              <button
                key={i}
                onClick={() => onSelectAction && onSelectAction(act.label)}
                className="text-xs font-medium text-[#735A3A] bg-[#FAF7F2] hover:bg-[#F5EFEB] border border-[#EAE6E1] px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
              >
                {act.label}
                <ArrowRight className="w-3 h-3 text-[#A68966]" />
              </button>
            ))}
          </div>
        )}

        <div className="text-[10px] text-[#A3A3A3] mt-1.5 font-mono">{message.timestamp}</div>
      </div>
    </motion.div>
  );
};
