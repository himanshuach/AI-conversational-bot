import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { ProjectSidebar } from './components/ProjectSidebar';
import { LeadSummaryCard } from './components/LeadSummaryCard';
import { WelcomeState } from './components/WelcomeState';
import { MessageBubble } from './components/MessageBubble';
import { TypingIndicator } from './components/TypingIndicator';
import { QuickActions } from './components/QuickActions';
import { ChatInput } from './components/ChatInput';
import { ConversationSummaryModal } from './components/ConversationSummaryModal';
import { BookingConfirmationView } from './components/BookingConfirmationView';
import { AdvisorConnectModal } from './components/AdvisorConnectModal';
// import { FloorPlansModal } from './components/FloorPlansModal';
import { AmenitiesModal } from './components/AmenitiesModal';
import { MobileDrawer } from './components/MobileDrawer';
import { ChatMessage, LeadProfile, SiteVisitBooking } from './types';
import { sendChatMessage, requestSiteVisit } from './services/api';
import { AlertCircle } from 'lucide-react';

const INITIAL_LEAD: LeadProfile = {
  configuration: 'Not provided',
  budget: 'Not provided',
  purpose: 'Not provided',
  timeline: 'Not provided',
  interestLevel: 'Exploring',
  siteVisit: 'Not scheduled',
  followUp: 'Pending',
  extractedInsights: '',
};

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [leadProfile, setLeadProfile] = useState<LeadProfile>(INITIAL_LEAD);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isBookingLoading, setIsBookingLoading] = useState<boolean>(false);
  const [confirmedBooking, setConfirmedBooking] = useState<SiteVisitBooking | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals state
  const [isSummaryOpen, setIsSummaryOpen] = useState<boolean>(false);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState<boolean>(false);
  const [isFloorPlansOpen, setIsFloorPlansOpen] = useState<boolean>(false);
  // const [isAmenitiesOpen, setIsAmenitiesOpen] = useState<boolean>(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef(`session-${Date.now()}`);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, confirmedBooking]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    setErrorMessage(null);
    setConfirmedBooking(null);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsTyping(true);

    try {
      const response = await sendChatMessage(text, newHistory, leadProfile, sessionId.current);

      if (response.extractedLead) {
        setLeadProfile((prev) => ({
          ...prev,
          ...response.extractedLead,
          interestLevel: response.extractedLead.interestLevel || prev.interestLevel,
        }));
      }

      let propertyCard;
      if (response.suggestedCard && response.suggestedCard.title) {
        propertyCard = {
          title: response.suggestedCard.title,
          subtitle: response.suggestedCard.subtitle,
          price: response.suggestedCard.price,
          tag: 'Featured Residence',
        };
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        propertyCard,
        showSiteVisitWidget:
          response.suggestSiteVisitWidget ||
          text.toLowerCase().includes('visit') ||
          text.toLowerCase().includes('tour'),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Failed to get AI response:', err);
      setErrorMessage(
        'Northstar AI is temporarily experiencing high demand. Retry or connect with our luxury advisor directly.'
      );
      const fallbackMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: "Apologies for the momentary delay. Northstar One in Sector 79, Gurugram features premier 2 BHK (₹1.35 Cr+) and 3 BHK (₹1.75 Cr+) residences. Would you like to schedule a direct site visit or connect with our portfolio manager?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        showSiteVisitWidget: true,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleBookSiteVisit = async (bookingData: {
    date: string;
    time: string;
    name: string;
    phone: string;
  }) => {
    setIsBookingLoading(true);
    setErrorMessage(null);

    try {
      const result = await requestSiteVisit(
        bookingData.date,
        bookingData.time,
        bookingData.name,
        bookingData.phone,
        leadProfile.configuration !== 'Not provided' ? leadProfile.configuration : '3 BHK Premier'
      );

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#735A3A', '#A68966', '#10B981', '#1A1A1A'],
        });
      } catch (_) {}

      setConfirmedBooking(result.booking);
      setLeadProfile((prev) => ({
        ...prev,
        siteVisit: `Scheduled (${bookingData.date}, ${bookingData.time})`,
        interestLevel: 'High',
        followUp: 'Required',
      }));

      const confirmationMsg: ChatMessage = {
        id: `ai-confirm-${Date.now()}`,
        sender: 'ai',
        text: `✓ **Site Visit Scheduled!** We've confirmed your private tour of Northstar One for **${bookingData.date} at ${bookingData.time}**. Our concierge will greet you at the Sector 79 Experience Centre.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, confirmationMsg]);
    } catch (err: any) {
      setErrorMessage('Unable to confirm time slot. Please choose an alternate slot or connect with our advisor.');
    } finally {
      setIsBookingLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([]);
    setLeadProfile(INITIAL_LEAD);
    setConfirmedBooking(null);
    setErrorMessage(null);
    sessionId.current = `session-${Date.now()}`;
  };

  const handleAdvisorChatInitiated = () => {
    const advisorMsg: ChatMessage = {
      id: `advisor-${Date.now()}`,
      sender: 'ai',
      text: `**Vikram Sethi (Senior Portfolio Manager):** Hello! I'm taking over from Northstar AI to assist you with priority allocations and personalized floor selection. How can I help with your investment choice?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, advisorMsg]);
  };

  return (
    /* Full viewport container — no scroll here, children handle their own scroll */
    <div className="flex flex-col w-full h-full bg-[#FCFAF8] text-[#1A1A1A] overflow-hidden">

      {/* ── HEADER ── */}
      <Header
        onOpenSummary={() => setIsSummaryOpen(true)}
        onOpenAdvisor={() => setIsAdvisorOpen(true)}
        onOpenFloorPlans={() => { }}
        onResetChat={handleResetChat}
        onToggleMobileDrawer={() => setIsMobileDrawerOpen(true)}
        isStreaming={isTyping}
      />

      {/* ── BODY: sidebar + chat pane ── */}
      <div className="flex flex-1 overflow-hidden w-full">

        {/* Left Sidebar — desktop only */}
        <div className="hidden lg:flex h-full">
          <ProjectSidebar
            lead={leadProfile}
            onOpenSiteVisit={() =>
              handleSendMessage("I'd like to schedule a site visit for Northstar One")
            }
            onOpenFloorPlans={() => { }}
            onOpenAmenities={() => { }}
            onOpenAdvisor={() => setIsAdvisorOpen(true)}
            onOpenSummary={() => setIsSummaryOpen(true)}
            onSelectPrompt={(p) => handleSendMessage(p)}
          />
        </div>

        {/* ── CHAT PANE ── */}
        <main className="flex flex-col flex-1 h-full overflow-hidden bg-[#FCFAF8]">

          {/* Scrollable message stream */}
          <div
            ref={chatScrollRef}
            className="flex-1 overflow-y-auto chat-scroll px-3 sm:px-6 py-4 flex flex-col"
          >
            {confirmedBooking ? (
              /* Booking confirmation full-pane view */
              <div className="flex flex-1 items-center justify-center">
                <BookingConfirmationView
                  booking={confirmedBooking}
                  onReturnToChat={() => setConfirmedBooking(null)}
                />
              </div>
            ) : messages.length === 0 ? (
              /* Welcome / landing state */
              <div className="flex flex-1 items-center justify-center">
                <WelcomeState onSelectPrompt={handleSendMessage} />
              </div>
            ) : (
              /* Active chat stream */
              <div className="w-full max-w-2xl mx-auto flex flex-col">
                {/* Live lead memory pill */}
                <LeadSummaryCard
                  lead={leadProfile}
                  onOpenSummary={() => setIsSummaryOpen(true)}
                />

                {/* Messages */}
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    onBookSiteVisit={handleBookSiteVisit}
                    onSelectAction={handleSendMessage}
                    isLoadingBooking={isBookingLoading}
                  />
                ))}

                {isTyping && <TypingIndicator />}

                {/* Error banner */}
                {errorMessage && (
                  <div className="mb-4 mx-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                    <button
                      onClick={() => handleSendMessage('Please tell me more about Northstar One')}
                      className="text-xs font-semibold underline text-rose-900 shrink-0"
                    >
                      Retry
                    </button>
                  </div>
                )}

                <div ref={messagesEndRef} className="h-2" />
              </div>
            )}
          </div>

          {/* ── BOTTOM BAR: quick actions + input ── */}
          <div className="shrink-0 bg-[#FCFAF8]/95 backdrop-blur-md border-t border-[#EAE6E1] px-3 sm:px-6 pt-2.5 pb-safe pb-3">
            {/* Quick pill bar */}
            <QuickActions
              onSelectAction={handleSendMessage}
              onOpenFloorPlans={() => { }}
              onOpenAmenities={() => { }}
              onOpenSiteVisit={() =>
                handleSendMessage("I'd like to arrange a private site visit at Sector 79")
              }
              onOpenAdvisor={() => setIsAdvisorOpen(true)}
            />

            {/* Text input */}
            <div className="mt-2">
              <ChatInput
                onSendMessage={handleSendMessage}
                isDisabled={isTyping}
                placeholder="Ask about pricing, floor plans, 3 BHK availability…"
              />
            </div>
          </div>
        </main>
      </div>

      {/* ── MODALS & DRAWERS ── */}
      <ConversationSummaryModal
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        lead={leadProfile}
        messages={messages}
        onOpenSiteVisit={() =>
          handleSendMessage("I'd like to book a site visit for Northstar One")
        }
      />

      <AdvisorConnectModal
        isOpen={isAdvisorOpen}
        onClose={() => setIsAdvisorOpen(false)}
        onStartAdvisorChat={handleAdvisorChatInitiated}
      />

      {/*       <FloorPlansModal
        isOpen={isFloorPlansOpen}
        onClose={() => setIsFloorPlansOpen(false)}
        onSelectConfiguration={(name) =>
          handleSendMessage(`I would like to explore the ${name} floor plan and pricing.`)
        }
      />
 */}
      {/* <AmenitiesModal
        isOpen={isAmenitiesOpen}
        onClose={() => setIsAmenitiesOpen(false)}
        onSelectAmenityInquiry={(q) => handleSendMessage(q)}
      /> */}

      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        lead={leadProfile}
        onOpenSiteVisit={() =>
          handleSendMessage("I'd like to schedule a site visit")
        }
        onOpenFloorPlans={() => { }}
        onOpenAmenities={() => { }}
        onOpenAdvisor={() => setIsAdvisorOpen(true)}
        onOpenSummary={() => setIsSummaryOpen(true)}
        onSelectPrompt={handleSendMessage}
      />
    </div>
  );
}
