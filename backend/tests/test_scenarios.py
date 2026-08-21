import pytest
from app.agent_service import agent_service
from app.analytics_service import analytics_service
from app.memory import session_store

@pytest.fixture(autouse=True)
def clean_sessions():
    session_store.clear_all()
    yield
    session_store.clear_all()

# 1. Normal English Conversation
def test_scenario_01_normal_english_conversation():
    session_id = "test-01"
    response = agent_service.process_message(session_id, "Hello, can you tell me more about Northstar One?")
    assert response.detected_language == "English"
    assert "Northstar One" in response.reply or "Sector 79" in response.reply
    assert len(response.reply) > 20

# 2. Hindi Conversation
def test_scenario_02_hindi_conversation():
    session_id = "test-02"
    response = agent_service.process_message(session_id, "नमस्ते, क्या आप मुझे नॉर्थस्टार वन के बारे में बता सकते हैं?")
    assert response.detected_language == "Hindi"
    assert any(char in response.reply for char in "नॉर्थस्टारसेक्टर")

# 3. Hinglish Conversation
def test_scenario_03_hinglish_conversation():
    session_id = "test-03"
    response = agent_service.process_message(session_id, "Bhai project ke baare mein batao na, kya rate chal raha hai?")
    assert response.detected_language == "Hinglish"
    assert any(w in response.reply.lower() for w in ["northstar", "sector 79", "bhk", "cr"])

# 4. Customer asking about price
def test_scenario_04_asking_about_price():
    session_id = "test-04"
    response = agent_service.process_message(session_id, "What is the starting price for apartments here?")
    reply_lower = response.reply.lower()
    assert "1.35" in reply_lower or "1.75" in reply_lower or "crore" in reply_lower

# 5. Customer providing a budget
def test_scenario_05_providing_budget():
    session_id = "test-05"
    response = agent_service.process_message(session_id, "My budget is around 1.5 Cr. What options do you have?")
    assert response.qualification_state.budget is not None
    assert "1.5" in response.qualification_state.budget or "1.35" in response.reply

# 6. Customer choosing 2 BHK
def test_scenario_06_choosing_2bhk():
    session_id = "test-06"
    response = agent_service.process_message(session_id, "I am looking for a 2 BHK apartment for my small family.")
    assert response.qualification_state.configuration == "2 BHK"
    assert "1.35" in response.reply or "2 bhk" in response.reply.lower()

# 7. Customer choosing 3 BHK
def test_scenario_07_choosing_3bhk():
    session_id = "test-07"
    response = agent_service.process_message(session_id, "We need a spacious 3 BHK flat.")
    assert response.qualification_state.configuration == "3 BHK"
    assert "1.75" in response.reply or "3 bhk" in response.reply.lower()

# 8. Customer with an objection (Price / Location)
def test_scenario_08_customer_with_objection():
    session_id = "test-08"
    response = agent_service.process_message(session_id, "Isn't 1.35 Cr too expensive for Sector 79?")
    reply_lower = response.reply.lower()
    # Checks that bot provides value reassurance and acknowledges budget
    assert any(w in reply_lower for w in ["value", "quality", "connectivity", "budget", "layout", "sector 79"])

# 9. Busy customer
def test_scenario_09_busy_customer():
    session_id = "test-09"
    response = agent_service.process_message(session_id, "I am driving right now and busy.")
    reply_lower = response.reply.lower()
    assert any(w in reply_lower for w in ["hold you up", "convenient", "whatsapp", "callback", "later", "busy"])

# 10. Uninterested customer
def test_scenario_10_uninterested_customer():
    session_id = "test-10"
    response = agent_service.process_message(session_id, "I am not interested in Gurugram properties.")
    assert response.qualification_state.interest_level == "Not Interested"
    reply_lower = response.reply.lower()
    assert any(w in reply_lower for w in ["thank", "letting me know", "assist", "future", "best"])

# 11. Customer asking to contact later
def test_scenario_11_contact_later():
    session_id = "test-11"
    response = agent_service.process_message(session_id, "Please call me tomorrow after 4 PM.")
    reply_lower = response.reply.lower()
    assert any(w in reply_lower for w in ["noted", "tomorrow", "scheduled", "time", "connect"])

# 12. Customer asking to stop communication (Opt-out / DNC)
def test_scenario_12_stop_communication_opt_out():
    session_id = "test-12"
    response = agent_service.process_message(session_id, "Stop messaging me and remove my number.")
    assert response.opt_out_triggered is True
    assert response.is_conversation_ended is True
    reply_lower = response.reply.lower()
    assert any(w in reply_lower for w in ["respect", "privacy", "unsubscribed", "remove", "not contact"])

# 13. Unknown question (Anti-hallucination check)
def test_scenario_13_unknown_question_antihallucination():
    session_id = "test-13"
    response = agent_service.process_message(session_id, "What is the exact monthly maintenance charge per sq ft and exact possession date?")
    reply_lower = response.reply.lower()
    # Must acknowledge lack of verified info instead of inventing numbers
    assert any(phrase in reply_lower for phrase in ["don't have the exact", "verified", "consultant", "official", "note"])

# 14. Site-visit booking (Success)
def test_scenario_14_site_visit_booking_success():
    session_id = "test-14"
    response = agent_service.process_message(session_id, "I want to book a site visit this Saturday at 11 AM.")
    assert response.booking_triggered is True
    assert response.booking_status == "confirmed"
    assert response.booking_details is not None
    assert "booking_id" in response.booking_details

# 15. Failed site-visit booking (Slot full / error fallback)
def test_scenario_15_site_visit_booking_failure_handling():
    session_id = "test-15"
    response = agent_service.process_message(session_id, "Can I book a site visit for Sunday at 11 AM?", simulate_booking_failure=True)
    assert response.booking_triggered is True
    assert response.booking_status == "failed"
    reply_lower = response.reply.lower()
    # Must offer alternative slot / explain capacity
    assert any(w in reply_lower for w in ["capacity", "full", "booked", "alternative", "2:00 pm", "morning", "slot"])

# 16. Human escalation
def test_scenario_16_human_escalation():
    session_id = "test-16"
    response = agent_service.process_message(session_id, "I want to talk to a human manager right now.")
    assert response.escalation_triggered is True
    reply_lower = response.reply.lower()
    assert any(w in reply_lower for w in ["escalat", "senior", "relationship manager", "consultant", "reach out"])

# 17. Proper conversation ending & Analytics Generation
def test_scenario_17_conversation_ending_and_analytics():
    session_id = "test-17"
    # Step 1: User asks 2 BHK
    agent_service.process_message(session_id, "I want a 2 BHK in Northstar One with 1.4 Cr budget.")
    # Step 2: User books visit
    agent_service.process_message(session_id, "Let's schedule a site visit for this weekend.")
    # Step 3: User closes
    closing_resp = agent_service.process_message(session_id, "Thank you, goodbye!")
    assert closing_resp.is_conversation_ended is True
    
    # Generate Analytics
    analytics = analytics_service.generate_analytics(session_id)
    assert analytics.session_id == session_id
    assert analytics.configuration == "2 BHK"
    assert analytics.site_visit_status == "Booked"
    assert analytics.lead_status in ["Hot", "Warm"]
    assert analytics.interest_level in ["High", "Moderate"]
    assert len(analytics.conversation_summary) > 10
