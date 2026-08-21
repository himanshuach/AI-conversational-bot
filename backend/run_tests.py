"""
Interactive Test Runner for Huvo AI - Northstar Homes Assignment.
Runs all 17 mandatory test scenarios and generates a detailed verification report.
"""

import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__))))

from app.agent_service import agent_service
from app.analytics_service import analytics_service
from app.memory import session_store

SCENARIOS = [
    {
        "id": 1,
        "name": "Normal English Conversation",
        "input": "Hello, can you tell me more about Northstar One?",
        "expected": "Engaging English response detailing Northstar One in Sector 79 with 2/3 BHK options.",
        "eval": lambda r, a: r.detected_language == "English" and ("Northstar One" in r.reply or "Sector 79" in r.reply)
    },
    {
        "id": 2,
        "name": "Hindi Conversation",
        "input": "नमस्ते, क्या आप मुझे नॉर्थस्टार वन के बारे में बता सकते हैं?",
        "expected": "Devanagari Hindi response introducing project and configurations.",
        "eval": lambda r, a: r.detected_language == "Hindi" and any(c in r.reply for c in "नॉर्थस्टारसेक्टर")
    },
    {
        "id": 3,
        "name": "Hinglish Conversation",
        "input": "Bhai project ke baare mein batao na, kya rate chal raha hai?",
        "expected": "Natural Hinglish response matching customer's casual conversational tone.",
        "eval": lambda r, a: r.detected_language == "Hinglish" and any(w in r.reply.lower() for w in ["northstar", "sector 79", "bhk", "cr"])
    },
    {
        "id": 4,
        "name": "Customer Asking About Price",
        "input": "What is the starting price for apartments here?",
        "expected": "Clearly quotes 2 BHK at ₹1.35 Cr+ and 3 BHK at ₹1.75 Cr+.",
        "eval": lambda r, a: "1.35" in r.reply or "1.75" in r.reply
    },
    {
        "id": 5,
        "name": "Customer Providing a Budget",
        "input": "My budget is around 1.5 Cr. What options do you have?",
        "expected": "Recognizes 1.5 Cr budget, aligns with 2 BHK starting at ₹1.35 Cr.",
        "eval": lambda r, a: r.qualification_state.budget is not None and ("1.5" in r.qualification_state.budget or "1.35" in r.reply)
    },
    {
        "id": 6,
        "name": "Customer Choosing 2 BHK",
        "input": "I am looking for a 2 BHK apartment for my small family.",
        "expected": "Captures 2 BHK preference and quotes ₹1.35 Cr onwards.",
        "eval": lambda r, a: r.qualification_state.configuration == "2 BHK" and "1.35" in r.reply
    },
    {
        "id": 7,
        "name": "Customer Choosing 3 BHK",
        "input": "We need a spacious 3 BHK flat.",
        "expected": "Captures 3 BHK preference and quotes ₹1.75 Cr onwards.",
        "eval": lambda r, a: r.qualification_state.configuration == "3 BHK" and "1.75" in r.reply
    },
    {
        "id": 8,
        "name": "Customer with an Objection",
        "input": "Isn't 1.35 Cr too expensive for Sector 79?",
        "expected": "Validates concern with empathy; highlights value proposition, connectivity, build quality.",
        "eval": lambda r, a: any(w in r.reply.lower() for w in ["value", "quality", "connectivity", "budget", "layout", "sector 79"])
    },
    {
        "id": 9,
        "name": "Busy Customer",
        "input": "I am driving right now and busy.",
        "expected": "Respects time immediately; offers concise WhatsApp summary or callback.",
        "eval": lambda r, a: any(w in r.reply.lower() for w in ["hold you up", "convenient", "whatsapp", "callback", "later", "busy"])
    },
    {
        "id": 10,
        "name": "Uninterested Customer",
        "input": "I am not interested in Gurugram properties.",
        "expected": "Polite non-pushy closure; sets interest level to Not Interested.",
        "eval": lambda r, a: r.qualification_state.interest_level == "Not Interested" and any(w in r.reply.lower() for w in ["thank", "letting me know", "assist", "future"])
    },
    {
        "id": 11,
        "name": "Customer Asking to Contact Later",
        "input": "Please call me tomorrow after 4 PM.",
        "expected": "Acknowledge and schedules follow-up at the requested time slot.",
        "eval": lambda r, a: any(w in r.reply.lower() for w in ["noted", "tomorrow", "scheduled", "time", "connect"])
    },
    {
        "id": 12,
        "name": "Customer Asking to Stop Communication",
        "input": "Stop messaging me and remove my number.",
        "expected": "Respects privacy immediately; triggers DNC opt-out and terminates follow-ups.",
        "eval": lambda r, a: r.opt_out_triggered is True and r.is_conversation_ended is True
    },
    {
        "id": 13,
        "name": "Unknown Question (Anti-Hallucination)",
        "input": "What is the exact monthly maintenance charge per sq ft and possession date?",
        "expected": "Acknowledges lack of verified data; does not fabricate numbers; offers escalation.",
        "eval": lambda r, a: any(phrase in r.reply.lower() for phrase in ["don't have the exact", "verified", "consultant", "official", "note"])
    },
    {
        "id": 14,
        "name": "Site-Visit Booking (Success)",
        "input": "I want to book a site visit this Saturday at 11 AM.",
        "expected": "Confirms booking with unique Booking ID for Sector 79 experience centre.",
        "eval": lambda r, a: r.booking_triggered is True and r.booking_status == "confirmed" and "booking_id" in (r.booking_details or {})
    },
    {
        "id": 15,
        "name": "Failed Site-Visit Booking (Capacity / Fallback)",
        "input": "Can I book a site visit for Sunday at 11 AM?",
        "simulate_failure": True,
        "expected": "Handles full capacity politely; proposes 2 immediate alternative slots.",
        "eval": lambda r, a: r.booking_status == "failed" and any(w in r.reply.lower() for w in ["capacity", "full", "booked", "alternative", "2:00 pm", "morning", "slot"])
    },
    {
        "id": 16,
        "name": "Human Escalation",
        "input": "I want to talk to a human manager right now.",
        "expected": "Triggers escalation to Senior Relationship Manager.",
        "eval": lambda r, a: r.escalation_triggered is True and any(w in r.reply.lower() for w in ["escalat", "senior", "relationship manager", "consultant", "reach out"])
    },
    {
        "id": 17,
        "name": "Proper Conversation Ending & Post-Chat Analytics",
        "multi_turn": [
            "I want a 2 BHK flat with a budget of 1.4 Cr.",
            "Please schedule a site visit for this weekend.",
            "Thank you, that is all. Bye!"
        ],
        "expected": "Politely wraps up and automatically generates structured lead analytics.",
        "eval": lambda r, a: a is not None and a.configuration == "2 BHK" and a.site_visit_status == "Booked" and a.lead_status in ["Hot", "Warm"]
    }
]

def run_all_tests():
    print("=" * 100)
    print(" HUVO AI ASSIGNMENT: AUTOMATED TEST SUITE (17 SCENARIOS)")
    print(" Project: Northstar One | Developer: Northstar Homes | Sector 79, Gurugram")
    print("=" * 100)
    
    passed_count = 0
    total_count = len(SCENARIOS)

    for sc in SCENARIOS:
        session_id = f"runner-scenario-{sc['id']}"
        session_store.reset_session(session_id)
        
        sim_failure = sc.get("simulate_failure", False)
        
        if "multi_turn" in sc:
            last_resp = None
            for turn in sc["multi_turn"]:
                last_resp = agent_service.process_message(session_id, turn, simulate_booking_failure=sim_failure)
            analytics = analytics_service.generate_analytics(session_id)
            is_passed = sc["eval"](last_resp, analytics)
            actual_output = f"Reply: \"{last_resp.reply}\"\n  [Analytics Generated: Config={analytics.configuration}, Budget={analytics.budget}, Status={analytics.lead_status}]"
            input_text = " -> ".join(sc["multi_turn"])
        else:
            resp = agent_service.process_message(session_id, sc["input"], simulate_booking_failure=sim_failure)
            analytics = None
            is_passed = sc["eval"](resp, analytics)
            actual_output = resp.reply
            input_text = sc["input"]

        status_str = "✅ PASS" if is_passed else "❌ FAIL"
        if is_passed:
            passed_count += 1

        print(f"\n[Scenario {sc['id']:02d}] {sc['name']}  -->  {status_str}")
        print(f"  • Input: \"{input_text}\"")
        print(f"  • Expected: {sc['expected']}")
        print(f"  • Actual: {actual_output}")
        print("-" * 100)

    print("\n" + "=" * 100)
    print(f" SUMMARY: {passed_count}/{total_count} SCENARIOS PASSED ({passed_count/total_count*100:.1f}%)")
    print("=" * 100)
    
    return passed_count == total_count

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
