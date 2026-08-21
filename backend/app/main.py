import uuid
from typing import Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.models import (
    ChatRequest, ChatResponse,
    SiteVisitBookingRequest, SiteVisitBookingResponse, SiteVisitBookingItem,
    StructuredLeadAnalytics, ConversationAnalyticsResponse, LeadProfile,
    ResetRequest, ResetResponse
)
from app.memory import session_store
from app.agent_service import agent_service
from app.analytics_service import analytics_service

app = FastAPI(
    title="Northstar Homes - AI Conversational Sales Assistant",
    version="1.0.0",
    description="Conversational Real Estate Sales AI for Northstar One, Sector 79, Gurugram"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "developer": settings.DEVELOPER_NAME,
        "location": settings.LOCATION,
        "configurations": {
            "2_BHK": settings.PRICE_2BHK,
            "3_BHK": settings.PRICE_3BHK
        }
    }

@app.get("/api/project-info")
async def get_project_info():
    return {
        "project_name": settings.PROJECT_NAME,
        "developer": settings.DEVELOPER_NAME,
        "location": settings.LOCATION,
        "pricing": {
            "2 BHK": settings.PRICE_2BHK,
            "3 BHK": settings.PRICE_3BHK
        },
        "experience_centre": "Open 7 Days a week (10:00 AM - 7:00 PM), Sector 79, Gurugram",
        "highlights": [
            "Scenic Aravalli Hills Surroundings",
            "Direct connectivity to NH-48, SPR & Golf Course Extn Road",
            "Luxury Club & Modern Amenities",
            "Spacious 2 & 3 BHK Layouts"
        ]
    }

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    if not request.message or not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    session_id = request.get_session_id()
    response = agent_service.process_message(
        session_id=session_id,
        user_message=request.message,
        simulate_booking_failure=request.simulate_booking_failure
    )
    return response

@app.post("/api/site-visit", response_model=SiteVisitBookingResponse)
@app.post("/api/book-visit", response_model=SiteVisitBookingResponse)
async def book_visit_endpoint(request: SiteVisitBookingRequest):
    session_id = request.session_id or request.sessionId or "default-session"
    session = session_store.get_or_create_session(session_id)
    
    date_val = request.date or request.preferred_date or "Upcoming Saturday"
    time_val = request.time or request.preferred_time or "11:00 AM"
    name_val = request.customerName or request.customer_name or "Valued Customer"
    phone_val = request.customerPhone or request.phone or "Not provided"
    config_val = request.configurationInterest or request.configuration or "2 BHK / 3 BHK"

    if request.force_failure:
        session.booking_status = "failed"
        session.booking_details = {
            "reason": "Requested slot is fully booked",
            "requested_date": date_val,
            "requested_time": time_val
        }
        return SiteVisitBookingResponse(
            success=False,
            booking_id=None,
            booking=None,
            message="Selected time slot is at maximum capacity. Please choose an alternate slot.",
            slot_details=session.booking_details
        )
    
    booking_id = f"NSO-{uuid.uuid4().hex[:6].upper()}"
    session.booking_status = "confirmed"
    
    booking_item = SiteVisitBookingItem(
        id=booking_id,
        date=date_val,
        time=time_val,
        propertyName=settings.PROJECT_NAME,
        location="Sector 79, Gurugram, Haryana",
        customerName=name_val,
        customerPhone=phone_val,
        configurationInterest=config_val,
        status="confirmed"
    )

    session.booking_details = booking_item.model_dump()
    
    return SiteVisitBookingResponse(
        success=True,
        booking_id=booking_id,
        booking=booking_item,
        message=f"Site visit confirmed for {date_val} at {time_val}.",
        slot_details=session.booking_details
    )

@app.post("/api/conversation/analytics", response_model=ConversationAnalyticsResponse)
async def conversation_analytics_endpoint(request: Dict[str, Any]):
    session_id = request.get("sessionId") or request.get("session_id") or "default-session"
    analytics = analytics_service.generate_analytics(session_id)
    session = session_store.get_or_create_session(session_id)
    
    q = session.qualification_state
    lead_prof = LeadProfile(
        configuration=analytics.configuration,
        budget=analytics.budget,
        purpose=analytics.purpose_of_purchase,
        timeline="Immediate",
        interestLevel=analytics.interest_level if analytics.interest_level in ["High", "Medium", "Low", "Exploring"] else "High",
        siteVisit=analytics.site_visit_status,
        followUp="Required" if analytics.follow_up_requirement != "None" else "Pending",
        extractedInsights=analytics.conversation_summary
    )

    return ConversationAnalyticsResponse(
        sessionId=session_id,
        status="Qualified Lead" if analytics.lead_status in ["Hot", "Warm"] else "Information Seeking",
        leadProfile=lead_prof,
        aiNote=analytics.conversation_summary,
        recommendedUnits=["Northstar One — Tower B (3 BHK Premier)", "Northstar One — Tower A (2 BHK Luxury)"],
        totalMessages=len(session.messages),
        durationMinutes=3,
        keyTopicsDiscussed=["Project Overview", "Pricing & Layouts", "Sector 79 Connectivity"]
    )

@app.post("/api/analytics", response_model=StructuredLeadAnalytics)
async def generate_analytics_endpoint(request: ResetRequest):
    session_id = request.session_id or request.sessionId or "default-session"
    analytics = analytics_service.generate_analytics(session_id)
    return analytics

@app.get("/api/analytics/{session_id}", response_model=StructuredLeadAnalytics)
async def get_analytics_endpoint(session_id: str):
    analytics = analytics_service.generate_analytics(session_id)
    return analytics

@app.post("/api/advisor-request")
async def advisor_request_endpoint():
    return {
        "success": True,
        "message": "Senior Portfolio Manager (Vikram Sethi) notified."
    }

@app.post("/api/reset", response_model=ResetResponse)
async def reset_endpoint(request: ResetRequest):
    session_id = request.session_id or request.sessionId or "default-session"
    session_store.reset_session(session_id)
    return ResetResponse(
        session_id=session_id,
        message="Session reset successfully."
    )

@app.get("/api/session/{session_id}")
async def get_session_endpoint(session_id: str):
    session = session_store.get_session(session_id)
    if not session:
        return {"session_id": session_id, "messages": [], "status": "new"}
    return {
        "session_id": session.session_id,
        "messages": [m.model_dump() for m in session.messages],
        "qualification_state": session.qualification_state.model_dump(),
        "booking_status": session.booking_status,
        "booking_details": session.booking_details,
        "escalation_triggered": session.escalation_triggered,
        "opt_out_triggered": session.opt_out_triggered,
        "is_conversation_ended": session.is_conversation_ended
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
