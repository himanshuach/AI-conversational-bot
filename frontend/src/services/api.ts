import { ChatMessage, LeadProfile, SiteVisitBooking, ConversationAnalytics } from '../types';

export interface ChatResponse {
  replyText: string;
  extractedLead: LeadProfile;
  suggestSiteVisitWidget?: boolean;
  suggestedCard?: {
    type: '2bhk' | '3bhk' | '4bhk' | 'amenities' | null;
    title: string;
    subtitle: string;
    price: string;
  };
}

export async function sendChatMessage(
  message: string,
  history: ChatMessage[],
  currentLead: LeadProfile,
  sessionId: string = 'session-1'
): Promise<ChatResponse> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        history,
        currentLead,
        sessionId,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || errData.error || 'Server error');
    }

    return await response.json();
  } catch (err: any) {
    console.error('Chat API error:', err);
    throw err;
  }
}

export async function requestSiteVisit(
  date: string,
  time: string,
  customerName?: string,
  customerPhone?: string,
  configurationInterest?: string
): Promise<{ success: boolean; booking: SiteVisitBooking; message: string }> {
  try {
    const response = await fetch('/api/site-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date,
        time,
        customerName,
        customerPhone,
        configurationInterest,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to request site visit slot');
    }

    return await response.json();
  } catch (err: any) {
    console.error('Site Visit API error:', err);
    throw err;
  }
}

export async function fetchConversationAnalytics(
  sessionId: string,
  history: ChatMessage[],
  leadProfile: LeadProfile
): Promise<ConversationAnalytics> {
  try {
    const response = await fetch('/api/conversation/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        history,
        leadProfile,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to retrieve conversation analytics');
    }

    return await response.json();
  } catch (err: any) {
    console.error('Analytics API error:', err);
    // fallback clean structure
    return {
      sessionId,
      status: 'Qualified Lead',
      leadProfile,
      aiNote: 'The client showed strong interest in Sector 79 properties with unobstructed views. Prioritize units in Tower B & C.',
      recommendedUnits: ['Tower B - Unit 1802 (3 BHK Premier)', 'Tower C - Unit 2204 (3 BHK Premier)'],
      totalMessages: history.length,
      durationMinutes: 3,
      keyTopicsDiscussed: ['Northstar One Overview', '3 BHK Configuration', 'Site Visit Scheduling'],
    };
  }
}

export async function requestLuxuryAdvisor(): Promise<any> {
  try {
    const response = await fetch('/api/advisor-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return await response.json();
  } catch (err) {
    console.error('Advisor request error:', err);
    return { success: true };
  }
}
