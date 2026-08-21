import React from 'react';
import {
  X,
  Star,
  BarChart2,
  Home,
  Wallet,
  Activity,
  CalendarCheck,
  Bot,
  Calendar,
  FileText,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import { motion } from 'motion/react';
import { LeadProfile, ChatMessage } from '../types';

interface ConversationSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: LeadProfile;
  messages: ChatMessage[];
  onOpenSiteVisit: () => void;
}

export const ConversationSummaryModal: React.FC<ConversationSummaryModalProps> = ({
  isOpen,
  onClose,
  lead,
  messages,
  onOpenSiteVisit,
}) => {
  if (!isOpen) return null;

  const handleExportTranscript = () => {
    const transcriptText = messages
      .map((m) => `[${m.timestamp}] ${m.sender === 'user' ? 'Buyer' : 'Northstar AI'}: ${m.text}`)
      .join('\n\n');

    const fullReport = `=====================================================
NORTHSTAR ONE — CONVERSATION & LEAD SYNTHESIS REPORT
Sector 79, Gurugram | Northstar Homes
Generated: ${new Date().toLocaleString()}
=====================================================

LEAD CLASSIFICATION: ${lead.interestLevel === 'High' ? 'QUALIFIED LEAD' : 'INFORMATION SEEKER'}
- Configuration: ${lead.configuration}
- Budget: ${lead.budget}
- Purpose: ${lead.purpose}
- Timeline: ${lead.timeline}
- Interest Level: ${lead.interestLevel}
- Site Visit: ${lead.siteVisit}
- Follow-up: ${lead.followUp}

AI SYNTHESIS & SALES RECOMMENDATION:
${lead.extractedInsights || 'The client showed particular interest in properties with unobstructed views and emphasized the need for a modern, open-plan kitchen. Prioritize showing units in Tower B and C.'}

FULL CONVERSATION TRANSCRIPT:
${transcriptText || 'No conversation recorded.'}
=====================================================`;

    const blob = new Blob([fullReport], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Northstar_Lead_Summary_${Date.now()}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ type: 'spring', damping: 28, stiffness: 240 }}
        className="w-full sm:max-w-2xl bg-[#FAF7F2] border-t sm:border border-[#EAE6E1] rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92dvh]"
      >
        {/* Header Bar */}
        <div className="px-6 py-4 bg-[#FCFAF8] border-b border-[#EAE6E1] flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-xs font-semibold text-[#737373] hover:text-[#1A1A1A] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return</span>
          </button>
          <div className="text-sm font-bold text-[#1A1A1A]">Northstar AI</div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#737373] hover:text-[#1A1A1A] hover:bg-[#F0ECE6] rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {/* Main Title & Badge */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] tracking-tight">
                Conversation Summary
              </h2>
              <div className="inline-flex items-center gap-1.5 bg-[#F5EFEB] border border-[#DFCBB9] px-3 py-1 rounded-full">
                <Star className="w-3.5 h-3.5 text-[#735A3A] fill-[#735A3A]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#735A3A]">
                  Qualified Lead
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-[#737373]">
              Session synthesized in real time. Here is the structured profile extracted from the conversation.
            </p>
          </div>

          {/* Key Extractions Card */}
          <div className="bg-white border border-[#EAE6E1] rounded-2xl overflow-hidden lux-shadow">
            <div className="p-6 sm:p-7 space-y-6">
              <div className="flex items-center gap-2 text-sm font-bold text-[#1A1A1A] pb-2 border-b border-[#F0ECE6]">
                <BarChart2 className="w-4 h-4 text-[#735A3A]" />
                <span>Key Extractions</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                {/* Configuration */}
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#8C8C8C] mb-1">
                    <Home className="w-3.5 h-3.5" />
                    <span>Configuration</span>
                  </div>
                  <div className="text-base font-bold text-[#1A1A1A] pb-2 border-b border-[#F0ECE6]">
                    {lead.configuration !== 'Not provided' ? lead.configuration : '3 BHK (Evaluated)'}
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#8C8C8C] mb-1">
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Budget</span>
                  </div>
                  <div className="text-base font-bold text-[#1A1A1A] pb-2 border-b border-[#F0ECE6]">
                    {lead.budget !== 'Not provided' ? lead.budget : '₹2 Cr'}
                  </div>
                </div>

                {/* Interest Level */}
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#8C8C8C] mb-1">
                    <Activity className="w-3.5 h-3.5" />
                    <span>Interest Level</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-[#F0ECE6]">
                    <span className="text-base font-bold text-[#1A1A1A]">
                      {lead.interestLevel || 'High'}
                    </span>
                    <div className="h-2 w-20 bg-[#F0ECE6] rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          lead.interestLevel === 'High'
                            ? 'w-full bg-[#1A1A1A]'
                            : lead.interestLevel === 'Medium'
                            ? 'w-2/3 bg-[#735A3A]'
                            : 'w-1/3 bg-[#A3A3A3]'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Next Action */}
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#8C8C8C] mb-1">
                    <CalendarCheck className="w-3.5 h-3.5" />
                    <span>Next Action</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-base font-bold text-[#1A1A1A] pb-2 border-b border-[#F0ECE6]">
                    <span>
                      {lead.siteVisit !== 'Not scheduled' ? lead.siteVisit : 'Site Visit Requested'}
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" />
                  </div>
                </div>
              </div>
            </div>

            {/* Contextual AI Note */}
            <div className="bg-[#FAF7F2] p-5 sm:p-6 border-t border-[#EAE6E1]">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-[#E5D2B8]" />
                </div>
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">
                    AI Sales Note
                  </h4>
                  <p className="text-xs sm:text-sm text-[#595959] leading-relaxed">
                    {lead.extractedInsights ||
                      'The client showed particular interest in properties with unobstructed views and emphasized the need for a modern, open-plan kitchen. Prioritize showing units in Tower B and C.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => {
                onClose();
                onOpenSiteVisit();
              }}
              className="flex-1 bg-[#1A1A1A] hover:bg-[#333333] text-white text-xs font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <Calendar className="w-4 h-4 text-[#E5D2B8]" />
              <span>Schedule Visit</span>
            </button>

            <button
              onClick={handleExportTranscript}
              className="flex-1 bg-transparent border border-[#735A3A] hover:bg-[#F5EFEB] text-[#735A3A] text-xs font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Download Transcript</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
