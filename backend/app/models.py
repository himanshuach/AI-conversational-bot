from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class Message(BaseModel):
    role: str = Field(..., description="'user', 'assistant', or 'system'")
    content: str = Field(..., description="Message text")
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())

class QualificationState(BaseModel):
    budget: Optional[str] = None
    configuration: Optional[str] = None  # "2 BHK", "3 BHK", "Both", None
    purpose: Optional[str] = None  # "Self-use", "Investment", None
    timeline: Optional[str] = None
    customer_name: Optional[str] = None
    phone: Optional[str] = None
    interest_level: str = "Unassessed"  # "High", "Moderate", "Low", "Not Interested"
    language_detected: str = "English"

class LeadProfile(BaseModel):
    configuration: str = "Not provided"
    budget: str = "Not provided"
    purpose: str = "Not provided"
    timeline: str = "Not provided"
    interestLevel: str = "Exploring"
    siteVisit: str = "Not scheduled"
    followUp: str = "Pending"
    extractedInsights: str = ""

class SuggestedCard(BaseModel):
    type: Optional[str] = None
    title: str
    subtitle: str
    price: str

class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    sessionId: Optional[str] = None
    message: str
    history: Optional[List[Dict[str, Any]]] = None
    currentLead: Optional[Dict[str, Any]] = None
    simulate_booking_failure: bool = False

    def get_session_id(self) -> str:
        return self.session_id or self.sessionId or "default-session"

class ChatResponse(BaseModel):
    session_id: str
    reply: str
    replyText: Optional[str] = None
    detected_language: str = "English"
    qualification_state: QualificationState
    extractedLead: Optional[LeadProfile] = None
    suggestSiteVisitWidget: bool = False
    suggestedCard: Optional[SuggestedCard] = None
    booking_triggered: bool = False
    booking_status: str = "none"  # "none", "pending", "confirmed", "failed"
    booking_details: Optional[Dict[str, Any]] = None
    escalation_triggered: bool = False
    opt_out_triggered: bool = False
    is_conversation_ended: bool = False

class SiteVisitBookingRequest(BaseModel):
    session_id: Optional[str] = "default-session"
    sessionId: Optional[str] = None
    preferred_date: Optional[str] = None
    date: Optional[str] = None
    preferred_time: Optional[str] = None
    time: Optional[str] = None
    customer_name: Optional[str] = None
    customerName: Optional[str] = None
    phone: Optional[str] = None
    customerPhone: Optional[str] = None
    configuration: Optional[str] = None
    configurationInterest: Optional[str] = None
    force_failure: bool = False

class SiteVisitBookingItem(BaseModel):
    id: str
    date: str
    time: str
    propertyName: str = "Northstar One"
    location: str = "Sector 79, Gurugram, Haryana"
    customerName: Optional[str] = "Valued Buyer"
    customerPhone: Optional[str] = "Not provided"
    configurationInterest: Optional[str] = "2 BHK / 3 BHK"
    status: str = "confirmed"
    createdAt: str = Field(default_factory=lambda: datetime.now().isoformat())

class SiteVisitBookingResponse(BaseModel):
    success: bool
    booking_id: Optional[str] = None
    booking: Optional[SiteVisitBookingItem] = None
    message: str
    slot_details: Optional[Dict[str, Any]] = None

class StructuredLeadAnalytics(BaseModel):
    session_id: str
    budget: str = Field(description="Detected customer budget range, e.g. ₹1.5 Cr or 'Under 1.35 Cr'")
    configuration: str = Field(description="Preferred unit: '2 BHK', '3 BHK', 'Undecided', or 'Not specified'")
    purpose_of_purchase: str = Field(description="'Self-use', 'Investment', or 'Not specified'")
    interest_level: str = Field(description="'High', 'Moderate', 'Low', 'Not Interested', 'Opt-out'")
    site_visit_status: str = Field(description="'Booked', 'Requested / Pending', 'Declined', 'Failed / Slot Full', 'Not Discussed'")
    follow_up_requirement: str = Field(description="'Scheduled Callback', 'WhatsApp Brochure', 'Do Not Contact', 'Senior RM Escalation', 'None'")
    lead_status: str = Field(description="'Hot', 'Warm', 'Cold', 'Unqualified', 'Opted Out'")
    primary_language: str = Field(description="'English', 'Hindi', or 'Hinglish'")
    objections_raised: List[str] = Field(default_factory=list, description="List of objections identified (e.g. Price, Location, Distance)")
    human_escalation_needed: bool = Field(default=False, description="True if customer explicitly asked for human or has complex requirement")
    opt_out_requested: bool = Field(default=False, description="True if customer asked to stop contact / DNC")
    conversation_summary: str = Field(description="2-3 sentence high-level executive summary of the conversation")
    recommended_next_action: str = Field(description="Next action item for sales team")

class ConversationAnalyticsResponse(BaseModel):
    sessionId: str
    status: str = "Qualified Lead"
    leadProfile: LeadProfile
    aiNote: str
    recommendedUnits: List[str]
    totalMessages: int
    durationMinutes: int
    keyTopicsDiscussed: List[str]

class ResetRequest(BaseModel):
    session_id: Optional[str] = None
    sessionId: Optional[str] = None

class ResetResponse(BaseModel):
    session_id: str
    message: str
