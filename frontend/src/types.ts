export type MessageSender = 'user' | 'ai' | 'system';

export interface InlinePropertyCard {
  title: string;
  subtitle: string;
  price: string;
  tag?: string;
  imageUrl?: string;
  specs?: {
    area: string;
    bhk: string;
    possession: string;
  };
}

export interface InlineAction {
  label: string;
  action: 'schedule_visit' | 'view_floorplan' | 'view_pricing' | 'connect_advisor';
  payload?: any;
}

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  text: string;
  timestamp: string;
  propertyCard?: InlinePropertyCard;
  showSiteVisitWidget?: boolean;
  actions?: InlineAction[];
  isError?: boolean;
}

export interface LeadProfile {
  configuration: string; // e.g. "3 BHK", "2 BHK", "Not provided"
  budget: string; // e.g. "₹2 Cr", "₹1.5 - 2 Cr", "Not provided"
  purpose: string; // e.g. "Self-use", "Investment", "Not provided"
  timeline: string; // e.g. "Within 3 months", "Immediate", "Not provided"
  interestLevel: 'High' | 'Medium' | 'Low' | 'Exploring';
  siteVisit: string; // e.g. "Scheduled (Sat, 4 PM)", "Not scheduled", "Requested"
  followUp: 'Required' | 'Pending' | 'Not Required';
  extractedInsights?: string;
}

export interface SiteVisitBooking {
  id?: string;
  date: string;
  time: string;
  propertyName: string;
  location: string;
  customerName?: string;
  customerPhone?: string;
  configurationInterest?: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  createdAt: string;
}

export interface ConversationAnalytics {
  sessionId: string;
  status: 'Qualified Lead' | 'High Potential' | 'Information Seeking' | 'Follow-up Needed';
  leadProfile: LeadProfile;
  aiNote: string;
  recommendedUnits: string[];
  totalMessages: number;
  durationMinutes: number;
  keyTopicsDiscussed: string[];
}

export interface FloorPlan {
  id: string;
  type: string;
  superArea: string;
  carpetArea: string;
  priceStarting: string;
  description: string;
  features: string[];
  imagePlaceholderAlt: string;
}

export interface ProjectAmenity {
  id: string;
  name: string;
  category: 'Wellness' | 'Leisure' | 'Sports' | 'Convenience';
  description: string;
  iconName: string;
}

export interface AdvisorInfo {
  name: string;
  title: string;
  avatarUrl: string;
  experience: string;
  specialization: string;
  phone: string;
}
