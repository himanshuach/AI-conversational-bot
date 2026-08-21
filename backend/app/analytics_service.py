import json
from typing import Optional
from openai import OpenAI
from app.config import settings
from app.models import StructuredLeadAnalytics
from app.memory import session_store, SessionData

class AnalyticsService:
    def __init__(self):
        self._client: Optional[OpenAI] = None

    def _get_client(self) -> Optional[OpenAI]:
        if not self._client and settings.OPENAI_API_KEY and settings.OPENAI_API_KEY != "your_api_key_here":
            try:
                self._client = OpenAI(
                    api_key=settings.OPENAI_API_KEY,
                    base_url=settings.BASE_URL
                )
            except Exception:
                self._client = None
        return self._client

    def generate_analytics(self, session_id: str) -> StructuredLeadAnalytics:
        session = session_store.get_or_create_session(session_id)
        client = self._get_client()

        if client and len(session.messages) >= 2:
            try:
                return self._generate_with_llm(session, client)
            except Exception:
                return self._generate_heuristically(session)
        else:
            return self._generate_heuristically(session)

    def _generate_with_llm(self, session: SessionData, client: OpenAI) -> StructuredLeadAnalytics:
        transcript = "\n".join([f"{m.role.upper()}: {m.content}" for m in session.messages])
        
        prompt = f"""You are a Lead Analytics Extraction System for real estate sales at Northstar Homes (Northstar One, Sector 79, Gurugram).
Analyze the following sales conversation transcript and output structured JSON strictly matching the requested schema.

TRANSCRIPT:
{transcript}

OUTPUT JSON SCHEMA:
{{
  "budget": "Detected budget (e.g. '₹1.35 Cr', '₹1.5 - 2 Cr', 'Under ₹1.35 Cr', or 'Not specified')",
  "configuration": "Preferred configuration ('2 BHK', '3 BHK', 'Undecided', or 'Not specified')",
  "purpose_of_purchase": "'Self-use', 'Investment', or 'Not specified'",
  "interest_level": "'High', 'Moderate', 'Low', 'Not Interested', or 'Opt-out'",
  "site_visit_status": "'Booked', 'Requested / Pending', 'Declined', 'Failed / Slot Full', or 'Not Discussed'",
  "follow_up_requirement": "'Scheduled Callback', 'WhatsApp Brochure', 'Do Not Contact', 'Senior RM Escalation', or 'None'",
  "lead_status": "'Hot', 'Warm', 'Cold', 'Unqualified', or 'Opted Out'",
  "primary_language": "'English', 'Hindi', or 'Hinglish'",
  "objections_raised": ["List any objections mentioned, e.g. Price, Location, Distance"],
  "human_escalation_needed": true or false,
  "opt_out_requested": true or false,
  "conversation_summary": "2-3 concise sentences summarizing customer needs, objections, and outcome.",
  "recommended_next_action": "Concrete recommended action for sales representative."
}}

Respond ONLY with valid JSON."""

        response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.2,
            max_tokens=500
        )

        data = json.loads(response.choices[0].message.content or "{}")
        
        analytics = StructuredLeadAnalytics(
            session_id=session.session_id,
            budget=data.get("budget", session.qualification_state.budget or "Not specified"),
            configuration=data.get("configuration", session.qualification_state.configuration or "Not specified"),
            purpose_of_purchase=data.get("purpose_of_purchase", session.qualification_state.purpose or "Not specified"),
            interest_level=data.get("interest_level", session.qualification_state.interest_level or "Moderate"),
            site_visit_status=data.get("site_visit_status", "Booked" if session.booking_status == "confirmed" else ("Failed / Slot Full" if session.booking_status == "failed" else "Not Discussed")),
            follow_up_requirement=data.get("follow_up_requirement", "Do Not Contact" if session.opt_out_triggered else ("Senior RM Escalation" if session.escalation_triggered else "Scheduled Callback")),
            lead_status=data.get("lead_status", "Hot" if session.booking_status == "confirmed" else "Warm"),
            primary_language=data.get("primary_language", session.qualification_state.language_detected),
            objections_raised=data.get("objections_raised", []),
            human_escalation_needed=data.get("human_escalation_needed", session.escalation_triggered),
            opt_out_requested=data.get("opt_out_requested", session.opt_out_triggered),
            conversation_summary=data.get("conversation_summary", "Conversation regarding Northstar One in Sector 79, Gurugram."),
            recommended_next_action=data.get("recommended_next_action", "Follow up with customer based on discussed requirements.")
        )
        session.analytics = analytics
        return analytics

    def _generate_heuristically(self, session: SessionData) -> StructuredLeadAnalytics:
        full_text = " ".join([m.content.lower() for m in session.messages if m.role == "user"])
        
        # Objections
        objections = []
        if any(w in full_text for w in ["expensive", "mehenga", "budget tight", "high price", "costly", "1 cr"]):
            objections.append("Price Sensitivity / Budget Constraint")
        if any(w in full_text for w in ["too far", "location", "door", "distance", "connectivity"]):
            objections.append("Location / Distance Concern")

        # Lead status & Interest Level determination
        if session.opt_out_triggered:
            lead_status = "Opted Out"
            interest_level = "Opt-out"
            follow_up = "Do Not Contact"
            action = "Purge contact number from active calling lists; comply with DNC request."
        elif session.booking_status == "confirmed":
            lead_status = "Hot"
            interest_level = "High"
            follow_up = "Site Visit Coordination"
            action = "Send site visit confirmation SMS/WhatsApp with Google Maps location pin for Sector 79."
        elif session.booking_status == "failed":
            lead_status = "Hot"
            interest_level = "High"
            follow_up = "Reschedule Site Visit"
            action = "Relationship Manager to call immediately with alternative VIP slots for model flat visit."
        elif session.escalation_triggered:
            lead_status = "Warm"
            interest_level = "Moderate"
            follow_up = "Senior RM Escalation"
            action = "Assign to Senior Relationship Manager for custom requirements and personalized consultation."
        elif session.qualification_state.interest_level == "Not Interested":
            lead_status = "Cold"
            interest_level = "Not Interested"
            follow_up = "None"
            action = "Mark lead as uninterested; archive for quarterly newsletter only."
        else:
            lead_status = "Warm"
            interest_level = session.qualification_state.interest_level if session.qualification_state.interest_level != "Unassessed" else "Moderate"
            follow_up = "Scheduled Callback"
            action = "Follow up with project brochure and payment plan details via WhatsApp."

        site_visit_status = "Not Discussed"
        if session.booking_status == "confirmed":
            site_visit_status = "Booked"
        elif session.booking_status == "failed":
            site_visit_status = "Failed / Slot Full"
        elif "visit" in full_text or "sample" in full_text:
            site_visit_status = "Requested / Pending"

        summary = f"Customer explored Northstar One ({session.qualification_state.configuration or 'Unit undecided'}). Language used: {session.qualification_state.language_detected}. Current status: {lead_status}."
        if session.booking_status == "confirmed":
            summary += " Site visit successfully booked."
        elif session.opt_out_triggered:
            summary += " Customer requested to stop communications."
        elif session.escalation_triggered:
            summary += " Escalated to Senior Property Consultant."

        analytics = StructuredLeadAnalytics(
            session_id=session.session_id,
            budget=session.qualification_state.budget or ("₹1.35 Cr+" if session.qualification_state.configuration == "2 BHK" else ("₹1.75 Cr+" if session.qualification_state.configuration == "3 BHK" else "Not specified")),
            configuration=session.qualification_state.configuration or "Not specified",
            purpose_of_purchase=session.qualification_state.purpose or "Not specified",
            interest_level=interest_level,
            site_visit_status=site_visit_status,
            follow_up_requirement=follow_up,
            lead_status=lead_status,
            primary_language=session.qualification_state.language_detected,
            objections_raised=objections,
            human_escalation_needed=session.escalation_triggered,
            opt_out_requested=session.opt_out_triggered,
            conversation_summary=summary,
            recommended_next_action=action
        )
        session.analytics = analytics
        return analytics

analytics_service = AnalyticsService()
