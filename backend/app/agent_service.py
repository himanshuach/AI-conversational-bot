import json
import re
import uuid
from typing import Dict, Any, Tuple, Optional
from openai import OpenAI
from app.config import settings
from app.prompt import MASTER_SYSTEM_PROMPT
from app.models import QualificationState, ChatResponse
from app.memory import session_store, SessionData

def detect_language(text: str) -> str:
    """Detects whether message is Hindi (Devanagari), Hinglish (Romanized Hindi), or English."""
    # Check for Devanagari Unicode block
    if any('\u0900' <= char <= '\u097f' for char in text):
        return "Hindi"
    
    # Common Hinglish token heuristics
    hinglish_keywords = {
        "kya", "hai", "hein", "batao", "bataiye", "kitna", "kitne", "chahiye",
        "kaise", "kab", "kaha", "kahan", "hoga", "hogi", "accha", "theek",
        "shukriya", "dhanyawad", "namaste", "bhai", "sir", "madam", "mil", "sakta",
        "dekhna", "visit", "kal", "aaj", "parso", "subah", "shaam", "baat", "karo",
        "mat", "nahi", "nahin", "ruko", "baad", "mein", "karunga", "karungi", "jana"
    }
    tokens = re.findall(r'\b[a-zA-Z]+\b', text.lower())
    matches = sum(1 for token in tokens if token in hinglish_keywords)
    if matches >= 2 or (len(tokens) > 0 and matches / len(tokens) >= 0.25):
        return "Hinglish"
    
    return "English"

# Tool schemas for OpenAI function calling
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "book_site_visit",
            "description": "Book or schedule a site visit to Northstar One sample flat in Sector 79, Gurugram.",
            "parameters": {
                "type": "object",
                "properties": {
                    "preferred_date": {"type": "string", "description": "Preferred date or day (e.g. 'Tomorrow', 'Saturday', '2026-08-25')"},
                    "preferred_time": {"type": "string", "description": "Preferred time slot (e.g. '11:00 AM', '3:00 PM', 'Evening')"},
                    "configuration": {"type": "string", "enum": ["2 BHK", "3 BHK", "Undecided"], "description": "Configuration interested in"},
                    "customer_name": {"type": "string", "description": "Name of customer if provided"},
                    "phone": {"type": "string", "description": "Phone number if provided"}
                },
                "required": ["preferred_date", "preferred_time"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "trigger_human_escalation",
            "description": "Escalate conversation to a human Senior Relationship Manager when requested or needed.",
            "parameters": {
                "type": "object",
                "properties": {
                    "reason": {"type": "string", "description": "Reason for escalation"},
                    "urgency": {"type": "string", "enum": ["normal", "high"], "description": "Urgency level"}
                },
                "required": ["reason"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "register_opt_out",
            "description": "Register customer request to stop communication / Do Not Call (DNC).",
            "parameters": {
                "type": "object",
                "properties": {
                    "reason": {"type": "string", "description": "Reason given by customer"}
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "update_qualification_details",
            "description": "Update identified customer requirements such as budget, configuration, purpose, or timeline.",
            "parameters": {
                "type": "object",
                "properties": {
                    "budget": {"type": "string", "description": "Budget mentioned (e.g. '1.4 Cr', 'Under 1.5 Cr', '1 Cr')"},
                    "configuration": {"type": "string", "enum": ["2 BHK", "3 BHK", "Both", "Undecided"], "description": "Target configuration"},
                    "purpose": {"type": "string", "enum": ["Self-use", "Investment", "Undecided"], "description": "Self-use or investment"},
                    "timeline": {"type": "string", "description": "Purchase timeline (e.g. 'Immediate', '3 months', 'Exploring')"},
                    "interest_level": {"type": "string", "enum": ["High", "Moderate", "Low", "Not Interested"], "description": "Customer interest level"}
                }
            }
        }
    }
]

class AgentService:
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

    def process_message(self, session_id: str, user_message: str, simulate_booking_failure: bool = False) -> ChatResponse:
        session = session_store.get_or_create_session(session_id)
        
        # Detect language
        detected_lang = detect_language(user_message)
        session.qualification_state.language_detected = detected_lang
        
        # Add user message to history
        session.add_message("user", user_message)

        # First evaluate rule-based qualification updates & intents for robustness
        self._extract_qualifications_heuristically(session, user_message)
        
        client = self._get_client()
        
        # If live OpenAI client is available, use LLM with Function Calling
        if client:
            try:
                return self._process_with_llm(session, user_message, detected_lang, simulate_booking_failure, client)
            except Exception as e:
                # If LLM API fails (e.g. rate limit, invalid key), fallback gracefully to intelligent simulated agent
                return self._process_with_intelligent_fallback(session, user_message, detected_lang, simulate_booking_failure, error_note=str(e))
        else:
            return self._process_with_intelligent_fallback(session, user_message, detected_lang, simulate_booking_failure)

    def _process_with_llm(self, session: SessionData, user_message: str, detected_lang: str, simulate_booking_failure: bool, client: OpenAI) -> ChatResponse:
        messages = [{"role": "system", "content": MASTER_SYSTEM_PROMPT}]
        for m in session.messages:
            messages.append({"role": m.role, "content": m.content})
        
        response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=messages,
            tools=TOOLS,
            tool_choice="auto",
            temperature=0.4,
            max_tokens=450
        )
        
        msg_obj = response.choices[0].message
        booking_triggered = False
        booking_status = session.booking_status
        booking_details = session.booking_details
        escalation_triggered = session.escalation_triggered
        opt_out_triggered = session.opt_out_triggered
        reply = msg_obj.content or ""

        # Handle tool calls if any
        if msg_obj.tool_calls:
            for tool_call in msg_obj.tool_calls:
                fn_name = tool_call.function.name
                try:
                    args = json.loads(tool_call.function.arguments)
                except Exception:
                    args = {}
                
                if fn_name == "book_site_visit":
                    booking_triggered = True
                    if simulate_booking_failure:
                        booking_status = "failed"
                        session.booking_status = "failed"
                        booking_details = {
                            "reason": "Requested slot is fully booked",
                            "attempted_slot": f"{args.get('preferred_date')} at {args.get('preferred_time')}"
                        }
                    else:
                        booking_status = "confirmed"
                        session.booking_status = "confirmed"
                        booking_details = {
                            "booking_id": f"NSO-{uuid.uuid4().hex[:6].upper()}",
                            "date": args.get("preferred_date", "Upcoming Weekend"),
                            "time": args.get("preferred_time", "11:00 AM"),
                            "location": "Northstar One Experience Centre, Sector 79, Gurugram"
                        }
                    session.booking_details = booking_details
                
                elif fn_name == "trigger_human_escalation":
                    escalation_triggered = True
                    session.escalation_triggered = True
                
                elif fn_name == "register_opt_out":
                    opt_out_triggered = True
                    session.opt_out_triggered = True
                    session.is_conversation_ended = True
                
                elif fn_name == "update_qualification_details":
                    if args.get("budget"):
                        session.qualification_state.budget = args["budget"]
                    if args.get("configuration"):
                        session.qualification_state.configuration = args["configuration"]
                    if args.get("purpose"):
                        session.qualification_state.purpose = args["purpose"]
                    if args.get("interest_level"):
                        session.qualification_state.interest_level = args["interest_level"]

            # If tool was called, get follow-up conversational response from LLM
            messages.append(msg_obj)
            tool_outputs = []
            for tool_call in msg_obj.tool_calls:
                fn_name = tool_call.function.name
                if fn_name == "book_site_visit":
                    tool_result = {"status": booking_status, "details": booking_details}
                elif fn_name == "trigger_human_escalation":
                    tool_result = {"status": "escalated", "message": "Senior Relationship Manager assigned"}
                elif fn_name == "register_opt_out":
                    tool_result = {"status": "opted_out", "message": "Number removed from contact list"}
                elif fn_name == "update_qualification_details":
                    tool_result = {"status": "updated"}
                else:
                    tool_result = {"status": "success"}

                tool_outputs.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": json.dumps(tool_result)
                })

            followup_response = client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=messages + tool_outputs,
                temperature=0.4,
                max_tokens=350
            )
            reply = followup_response.choices[0].message.content or reply

        if not reply:
            reply = "Thank you for reaching out to Northstar Homes. How may I assist you with Northstar One in Sector 79 today?"

        session.add_message("assistant", reply)
        
        return self._build_chat_response(
            session=session,
            reply=reply,
            detected_lang=detected_lang,
            booking_triggered=booking_triggered,
            booking_status=booking_status,
            booking_details=booking_details,
            escalation_triggered=escalation_triggered,
            opt_out_triggered=opt_out_triggered,
            is_ended=session.is_conversation_ended,
            user_message=user_message
        )

    def _extract_qualifications_heuristically(self, session: SessionData, text: str):
        """Extracts key real estate qualification slots using pattern matching."""
        lower = text.lower()
        
        # Configuration
        if "2 bhk" in lower or "2bhk" in lower or "two bhk" in lower:
            session.qualification_state.configuration = "2 BHK"
        elif "3 bhk" in lower or "3bhk" in lower or "three bhk" in lower:
            session.qualification_state.configuration = "3 BHK"
            
        # Purpose
        if any(w in lower for w in ["investment", "invest", "returns", "rental", "nivesh"]):
            session.qualification_state.purpose = "Investment"
        elif any(w in lower for w in ["self-use", "self use", "stay", "family", "live", "rehna", "shift", "buying it for my family", "for my family"]):
            session.qualification_state.purpose = "Self-use"

        # Budget extraction
        budget_match = re.search(r'(₹|rs\.?|inr)?\s*(\d+(\.\d+)?)\s*(cr|crore|crores|lakh|lacs|lac|k)', lower)
        if budget_match:
            unit = budget_match.group(4)
            unit_str = "Cr" if "cr" in unit else "Lakh"
            session.qualification_state.budget = f"₹{budget_match.group(2)} {unit_str}"
        elif "1.35" in lower or "1.5" in lower or "1.75" in lower:
            m_num = re.search(r'\b(1\.\d+)\b', lower)
            if m_num:
                session.qualification_state.budget = f"₹{m_num.group(1)} Cr"

        # Interest Level
        if any(w in lower for w in ["not interested", "nahi chahiye", "no interest", "don't want"]):
            session.qualification_state.interest_level = "Not Interested"
        elif any(w in lower for w in ["book", "visit", "weekend", "tomorrow", "kal", "sample flat"]):
            session.qualification_state.interest_level = "High"
        elif session.qualification_state.configuration or session.qualification_state.budget:
            session.qualification_state.interest_level = "Moderate"

    def _process_with_intelligent_fallback(self, session: SessionData, user_message: str, detected_lang: str, simulate_booking_failure: bool, error_note: Optional[str] = None) -> ChatResponse:
        """
        Intelligent simulation engine implementing the exact Master System Prompt guidelines,
        enabling offline testing, high-speed scenario validation, and fault-tolerance.
        """
        lower = user_message.lower().strip()
        booking_triggered = False
        booking_status = session.booking_status
        booking_details = session.booking_details
        escalation_triggered = session.escalation_triggered
        opt_out_triggered = session.opt_out_triggered
        is_ended = session.is_conversation_ended

        # 0. MEMORY RECALL INQUIRIES (e.g. "What budget did I tell you?", "What configuration did I ask for?")
        if any(q in lower for q in ["what budget did i", "what was my budget", "what did i tell you", "my budget was", "mera budget", "do you remember my budget", "what did i say", "what configuration did i", "what flat did i"]):
            b = session.qualification_state.budget
            c = session.qualification_state.configuration
            p = " for your family" if session.qualification_state.purpose == "Self-use" else (" for investment" if session.qualification_state.purpose == "Investment" else "")

            # Specific budget inquiry
            if any(q in lower for q in ["budget", "budget did i", "was my budget", "mera budget"]):
                if b:
                    c_clause = f" for a {c}" if c else ""
                    if detected_lang == "Hindi":
                        reply = f"आपने बताया था कि आपका बजट लगभग {b} है{c_clause}{p}। क्या आप सेक्टर 79 में साइट विजिट शेड्यूल करना चाहेंगे?"
                    elif detected_lang == "Hinglish":
                        reply = f"Aapne bataya tha ki aapka budget around {b} hai{c_clause}{p}. Kya aap Sector 79 mein visit schedule karna chahenge?"
                    else:
                        reply = f"You mentioned your budget is around {b}{c_clause}{p}. Would you like to explore scheduling a site visit to Sector 79?"
                else:
                    if detected_lang == "Hindi":
                        reply = "आपने अभी तक अपना बजट साझा नहीं किया है। हमारे 2 BHK ₹1.35 करोड़ और 3 BHK ₹1.75 करोड़ से शुरू होते हैं। आपका क्या बजट है?"
                    elif detected_lang == "Hinglish":
                        reply = "Aapne abhi tak apna budget share nahi kiya hai. Hamare 2 BHK ₹1.35 Cr aur 3 BHK ₹1.75 Cr se start hote hain. Aapka kya budget plan hai?"
                    else:
                        reply = "You haven't shared your budget with me yet. Our 2 BHK residences start at ₹1.35 Crore onwards and 3 BHK at ₹1.75 Crore onwards. What budget range are you planning for?"

            # Specific configuration inquiry
            elif any(q in lower for q in ["configuration", "which flat", "which bhk", "bhk did i"]):
                if c:
                    b_clause = f" with a budget around {b}" if b else ""
                    if detected_lang == "Hindi":
                        reply = f"आपने बताया था कि आप {c} देख रहे हैं{b_clause}{p}। क्या आप साइट विजिट शेड्यूल करना चाहेंगे?"
                    elif detected_lang == "Hinglish":
                        reply = f"Aapne bataya tha ki aap {c} explore kar rahe hain{b_clause}{p}. Kya aap visit schedule karna chahenge?"
                    else:
                        reply = f"You mentioned you are looking for a {c}{b_clause}{p}. Would you like to explore scheduling a site visit to Sector 79?"
                else:
                    if detected_lang == "Hindi":
                        reply = "आपने अभी तक कोई कॉन्फ़िगरेशन नहीं बताई है। हमारे पास 2 BHK और 3 BHK उपलब्ध हैं। आप किसमें रुचि रखते हैं?"
                    elif detected_lang == "Hinglish":
                        reply = "Aapne abhi tak configuration specify nahi ki hai. Hamare paas 2 BHK aur 3 BHK available hain. Aap kaunsi prefer karenge?"
                    else:
                        reply = "You haven't specified a configuration preference yet. We offer 2 BHK (from ₹1.35 Cr) and 3 BHK (from ₹1.75 Cr). Which one would you like to explore?"

            # General memory inquiry
            else:
                details = []
                if c: details.append(f"configuration: {c}")
                if b: details.append(f"budget: around {b}")
                if session.qualification_state.purpose: details.append(f"purpose: {session.qualification_state.purpose}")
                if details:
                    summary_str = ", ".join(details)
                    if detected_lang == "Hindi":
                        reply = f"मैंने आपकी ये प्राथमिकताओं को नोट किया है: {summary_str}। क्या मैं सेक्टर 79 में आपके लिए साइट विजिट शेड्यूल करूँ?"
                    elif detected_lang == "Hinglish":
                        reply = f"Maine aapki details note ki hain: {summary_str}. Kya aap Sector 79 mein visit schedule karna chahenge?"
                    else:
                        reply = f"I have noted your preferences so far: {summary_str}. Would you like to schedule a site visit to Sector 79?"
                else:
                    if detected_lang == "Hindi":
                        reply = "आपने अभी तक कोई विशिष्ट आवश्यकता साझा नहीं की है। मैं 2 BHK (₹1.35 करोड़+) या 3 BHK (₹1.75 करोड़+) के बारे में क्या जानकारी दे सकता हूँ?"
                    elif detected_lang == "Hinglish":
                        reply = "Aapne abhi tak specific preferences share nahi ki hain. Main 2 BHK (₹1.35 Cr+) ya 3 BHK (₹1.75 Cr+) ke baare mein kya assist kar sakta hoon?"
                    else:
                        reply = "You haven't shared specific requirements with me yet. How can I assist you with Northstar One (2 BHK from ₹1.35 Cr, 3 BHK from ₹1.75 Cr) in Sector 79?"

        # 1. STOP COMMUNICATION / OPT-OUT
        elif any(w in lower for w in ["stop messaging", "stop calling", "do not call", "dnc", "remove my number", "mat karo msg", "msg mat karo", "unsubscribe", "don't contact"]):
            opt_out_triggered = True
            session.opt_out_triggered = True
            is_ended = True
            session.is_conversation_ended = True
            session.qualification_state.interest_level = "Opt-out"
            if detected_lang == "Hindi":
                reply = "हम आपकी बात का पूरा सम्मान करते हैं और इस बातचीत को यहीं समाप्त करते हैं। धन्यवाद।"
            elif detected_lang == "Hinglish":
                reply = "Hum aapki request ko respect karte hain aur conversation yahi end karte hain. Wishing you the best!"
            else:
                reply = "I understand. I'll respect your request and won't continue the conversation. Wishing you the best!"

        # 2. BUSY CUSTOMER
        elif any(w in lower for w in ["busy", "driving", "in a meeting", "later", "driving right now", "call later", "cant talk", "cannot talk", "not now"]):
            if detected_lang == "Hindi":
                reply = "समझ गया! मैं आपका अधिक समय नहीं लूँगा। क्या आप बाद में किसी सुविधाजनक समय पर कॉल बैक चाहेंगे?"
            elif detected_lang == "Hinglish":
                reply = "Understood! Main aapka time nahi loonga. Kya aap convenient time par callback prefer karenge?"
            else:
                reply = "Understood! I won't hold you up. Would you prefer a callback at a more convenient time later?"

        # 3. CONTACT LATER (Specific time)
        elif any(w in lower for w in ["call me tomorrow", "connect tomorrow", "contact tomorrow", "kal call", "kal baat", "after 4 pm", "at 4 pm", "over the weekend", "call me later"]):
            session.qualification_state.interest_level = "Moderate"
            if detected_lang == "Hindi":
                reply = "नोट कर लिया है! मैंने आपकी समय प्राथमिकता नोट कर ली है। आपका दिन शुभ हो!"
            elif detected_lang == "Hinglish":
                reply = "Noted! Maine aapka preferred time note kar liya hai. Have a wonderful day!"
            else:
                reply = "Noted! I have noted that you'd prefer to be contacted tomorrow around 4 PM. Thank you, and have a great day!"

        # 4. UNINTERESTED CUSTOMER
        elif any(w in lower for w in ["not interested", "nahi chahiye", "looking elsewhere", "drop this", "koi interest nahi"]):
            session.qualification_state.interest_level = "Not Interested"
            if detected_lang == "Hindi":
                reply = "जानकारी देने के लिए धन्यवाद। यदि भविष्य में आपकी योजना बनती है, तो हम आपकी सहायता के लिए तैयार हैं। आपका दिन शुभ हो!"
            elif detected_lang == "Hinglish":
                reply = "Batane ke liye shukriya. Agar future mein aapka plan bane, toh hum assist karne ke liye available hain. Have a great day!"
            else:
                reply = "Thank you for letting me know. If your requirements change in the future, feel free to reach out. Have a wonderful day ahead!"

        # 5. HUMAN ESCALATION
        elif any(w in lower for w in ["talk to a human", "talk to human", "speak to human", "speak to a human", "real person", "connect to manager", "connect with manager", "human agent", "talk to manager", "senior advisor", "insaan se baat", "human manager", "speak with someone", "transfer to human", "representative"]):
            escalation_triggered = True
            session.escalation_triggered = True
            if detected_lang == "Hindi":
                reply = "जी बिल्कुल! मैं एक सीनियर प्रॉपर्टी कंसल्टेंट से आपकी बात कराने का अनुरोध दर्ज कर रहा हूँ ताकि वे आपसे सीधे संपर्क कर सकें।"
            elif detected_lang == "Hinglish":
                reply = "Ji bilkul! Main aapki Senior Consultant se connect karne ki request register kar raha hoon taaki team reach out kar sake."
            else:
                reply = "Certainly! I'll register your request for our Senior Property Consultant to reach out directly to assist you."

        # 6. SITE VISIT BOOKING (Direct trigger or slot mention)
        elif any(w in lower for w in ["book site visit", "book a visit", "site visit", "visit the site", "sample flat", "dekhein kal", "visit tomorrow", "saturday", "sunday", "11 am", "3 pm", "morning", "afternoon", "kal chalte hain", "dekhne aana hai"]):
            booking_triggered = True
            if simulate_booking_failure or "force_fail" in lower or "unavailable" in lower:
                booking_status = "failed"
                session.booking_status = "failed"
                booking_details = {
                    "reason": "Selected time slot is fully booked",
                    "attempted": "Requested Slot"
                }
                session.booking_details = booking_details
                if detected_lang == "Hindi":
                    reply = "क्षमा करें, आपके द्वारा चुना गया समय स्लॉट उपलब्ध नहीं है। क्या आप उसी दिन दोपहर 2:00 बजे या अगले दिन सुबह 11:00 बजे का समय देखना चाहेंगे?"
                elif detected_lang == "Hinglish":
                    reply = "Sorry, aapka requested slot currently available nahi hai. Kya Sunday afternoon 2:00 PM ya Saturday morning 11:00 AM ka slot aapke liye suitable rahega?"
                else:
                    reply = "Apologies, it looks like your requested slot is currently unavailable. Would 2:00 PM on the same day or 11:00 AM on the following morning work just as well for you?"
            else:
                booking_status = "confirmed"
                session.booking_status = "confirmed"
                booking_details = {
                    "booking_id": f"NSO-{uuid.uuid4().hex[:6].upper()}",
                    "date": "Confirmed Date / Slot",
                    "location": "Sector 79, Gurugram"
                }
                session.booking_details = booking_details
                session.qualification_state.interest_level = "High"
                if detected_lang == "Hindi":
                    reply = f"शानदार! नॉर्थस्टार वन (सेक्टर 79, गुरुग्राम) के लिए आपकी साइट विजिट कन्फर्म कर दी गई है (बुकिंग आईडी: {booking_details['booking_id']})।"
                elif detected_lang == "Hinglish":
                    reply = f"Great! Northstar One (Sector 79, Gurugram) ke liye aapki site visit confirm ho gayi hai (Booking ID: {booking_details['booking_id']})!"
                else:
                    reply = f"Fantastic! Your personalized site visit to Northstar One, Sector 79, Gurugram has been scheduled (Booking ID: {booking_details['booking_id']})."

        # 7. UNKNOWN QUESTIONS (Anti-hallucination check)
        elif any(w in lower for w in ["possession date", "exact possession", "maintenance charge", "maintenance cost", "discount", "discount milega", "bargain", "swimming pool size", "clubhouse area", "floor plan dimensions", "how many towers"]):
            if detected_lang == "Hindi":
                reply = "नॉर्थस्टार वन के संबंध में मेरे पास इस विशिष्ट विवरण का आधिकारिक आंकड़ा अभी उपलब्ध नहीं है। मैं इसे नोट कर लेता हूँ ताकि हमारी टीम आपको सत्यापित विवरण साझा कर सके। क्या आप 2 BHK या 3 BHK में रुचि रखते हैं?"
            elif detected_lang == "Hinglish":
                reply = "Mere paas Northstar One ke is specific detail ka verified figure abhi available nahi hai. Main isse note kar leta hoon taaki team verified details share kar sake. Kya aap 2 BHK ya 3 BHK prefer kar rahe hain?"
            else:
                reply = "I don't have the exact verified figure for that specific detail right now. I can note down your query so our team can provide verified details. Are you primarily exploring our 2 BHK or 3 BHK layout?"

        # 8. PRICE & CONFIGURATION INQUIRIES
        elif any(w in lower for w in ["price", "cost", "rate", "starting price", "pricing", "kitne ka hai", "daam", "budget"]):
            if "2 bhk" in lower or "2bhk" in lower or (session.qualification_state.configuration == "2 BHK" and "3 bhk" not in lower):
                if detected_lang == "Hindi":
                    reply = "नॉर्थस्टार वन, सेक्टर 79 में 2 BHK की शुरुआती कीमत ₹1.35 करोड़ से है। क्या आप इसे स्वयं रहने के लिए देख रहे हैं या निवेश के उद्देश्य से?"
                elif detected_lang == "Hinglish":
                    reply = "Northstar One, Sector 79 mein 2 BHK ki starting price ₹1.35 Crore onwards hai. Kya aap isse self-use ke liye dekh rahe hain ya investment purpose se?"
                else:
                    reply = "At Northstar One (Sector 79, Gurugram), our 2 BHK residences start at ₹1.35 Crore onwards. Would you like to schedule a site visit?"
            elif "3 bhk" in lower or "3bhk" in lower or session.qualification_state.configuration == "3 BHK":
                if detected_lang == "Hindi":
                    reply = "नॉर्थस्टार वन, सेक्टर 79 में 3 BHK की शुरुआती कीमत ₹1.75 करोड़ से है। क्या आप इसे अपने परिवार के साथ रहने के लिए देख रहे हैं या निवेश के लिए?"
                elif detected_lang == "Hinglish":
                    reply = "Northstar One, Sector 79 mein 3 BHK residences ₹1.75 Crore onwards start hote hain. Kya aap family ke saath rehne ka plan kar rahe hain ya investment?"
                else:
                    reply = "Our 3 BHK configurations at Northstar One start from ₹1.75 Crore onwards. Would you like to explore scheduling a site visit to Sector 79?"
            else:
                if detected_lang == "Hindi":
                    reply = "नॉर्थस्टार वन (सेक्टर 79, गुरुग्राम) में हमारे 2 BHK ₹1.35 करोड़ से और 3 BHK ₹1.75 करोड़ से शुरू होते हैं। आप किस कॉन्फ़िगरेशन के बारे में अधिक जानना चाहेंगे?"
                elif detected_lang == "Hinglish":
                    reply = "Northstar One (Sector 79, Gurugram) mein 2 BHK ₹1.35 Crore onwards aur 3 BHK ₹1.75 Crore onwards available hain. Aap kaunsi configuration explore karna chahte hain?"
                else:
                    reply = "At Northstar One, Sector 79 Gurugram, our 2 BHK residences start at ₹1.35 Crore onwards, and our 3 BHK residences start at ₹1.75 Crore onwards. Which configuration best fits your requirements?"

        # 9. OBJECTIONS: PRICE OR LOCATION
        elif any(w in lower for w in ["too expensive", "expensive", "mehenga", "budget tight", "budget kam hai", "out of budget", "1 cr", "1 crore"]):
            if detected_lang == "Hindi":
                reply = "मैं समझ सकता हूँ कि बजट एक बहुत महत्वपूर्ण निर्णय है। नॉर्थस्टार वन में हमारा 2 BHK ₹1.35 करोड़ से शुरू होता है। क्या आप सेक्टर 79 में साइट विजिट शेड्यूल करना चाहेंगे?"
            elif detected_lang == "Hinglish":
                reply = "Main samajh sakta hoon ki budget ek major consideration hai. Northstar One mein hamara 2 BHK ₹1.35 Cr se start hota hai. Kya aap Sector 79 mein site visit schedule karna chahenge?"
            else:
                reply = "I understand that budget is an important consideration. At Northstar One in Sector 79, our 2 BHK residences start at ₹1.35 Crore onwards. Would you like to schedule a site visit to explore further?"

        elif any(w in lower for w in ["too far", "location", "door hai", "kaha hai", "sector 79", "connectivity"]):
            if detected_lang == "Hindi":
                reply = "नॉर्थस्टार वन सेक्टर 79, गुरुग्राम में स्थित है। क्या आप 2 BHK या 3 BHK विकल्प देखना चाहते हैं?"
            elif detected_lang == "Hinglish":
                reply = "Northstar One Sector 79, Gurugram mein located hai. Aap 2 BHK ya 3 BHK kis option mein interested hain?"
            else:
                reply = "Northstar One is located in Sector 79, Gurugram. Are you exploring our 2 BHK or 3 BHK configuration?"

        # 10. CONFIGURATION SELECTION (2 BHK / 3 BHK)
        elif "2 bhk" in lower or "2bhk" in lower:
            session.qualification_state.configuration = "2 BHK"
            if detected_lang == "Hindi":
                reply = "बढ़िया पसंद! हमारा 2 BHK ₹1.35 करोड़ से शुरू होता है। क्या आप सेक्टर 79 में साइट विजिट शेड्यूल करना चाहेंगे?"
            elif detected_lang == "Hinglish":
                reply = "Great choice! Hamara 2 BHK ₹1.35 Cr onwards start hota hai. Kya aap Sector 79 mein site visit schedule karna chahenge?"
            else:
                reply = "Excellent choice! Our 2 BHK residences at Northstar One start from ₹1.35 Crore onwards. Would you like to schedule a site visit to Sector 79?"

        elif "3 bhk" in lower or "3bhk" in lower:
            session.qualification_state.configuration = "3 BHK"
            if detected_lang == "Hindi":
                reply = "बहुत बढ़िया! हमारा 3 BHK ₹1.75 करोड़ से शुरू होता है। क्या आप साइट विजिट शेड्यूल करना चाहेंगे?"
            elif detected_lang == "Hinglish":
                reply = "Awesome! Hamara 3 BHK ₹1.75 Cr onwards start hota hai. Kya aapko visit ke liye Saturday ya Sunday suit karega?"
            else:
                reply = "Wonderful! Our 3 BHK residences start at ₹1.75 Crore onwards. Would you prefer a Saturday or Sunday to visit Sector 79?"

        # 11. CONVERSATION ENDING / COURTESY
        elif any(w in lower for w in ["thank you", "thanks", "dhanyawad", "shukriya", "bye", "goodbye", "ok done", "alright bye"]):
            is_ended = True
            session.is_conversation_ended = True
            if detected_lang == "Hindi":
                reply = "नॉर्थस्टार होम्स से जुड़ने के लिए आपका बहुत-बहुत धन्यवाद। आपका दिन शुभ हो!"
            elif detected_lang == "Hinglish":
                reply = "Northstar Homes se connect karne ke liye bahut shukriya. Have a great day ahead!"
            else:
                reply = "Thank you for connecting with Northstar Homes! It was a pleasure assisting you. Have a wonderful day ahead!"

        # 12. DEFAULT GREETING / PROMPT
        else:
            if detected_lang == "Hindi":
                reply = "नमस्ते! नॉर्थस्टार होम्स में आपका स्वागत है। हमारे प्रोजेक्ट नॉर्थस्टार वन (सेक्टर 79, गुरुग्राम) में 2 BHK (₹1.35 करोड़+) और 3 BHK (₹1.75 करोड़+) उपलब्ध हैं। मैं आपकी क्या मदद कर सकता हूँ?"
            elif detected_lang == "Hinglish":
                reply = "Namaste! Northstar Homes mein aapka swagat hai. Hamare project Northstar One (Sector 79, Gurugram) mein 2 BHK (₹1.35 Cr onwards) aur 3 BHK (₹1.75 Cr onwards) available hain. Aap kis configuration ke baare mein jaanna chahenge?"
            else:
                reply = "Hello and welcome to Northstar Homes! I'd be delighted to assist you with Northstar One in Sector 79, Gurugram. We offer premium 2 BHK (₹1.35 Cr+) and 3 BHK (₹1.75 Cr+) residences. Which configuration are you interested in exploring?"

        session.add_message("assistant", reply)

        return self._build_chat_response(
            session=session,
            reply=reply,
            detected_lang=detected_lang,
            booking_triggered=booking_triggered,
            booking_status=booking_status,
            booking_details=booking_details,
            escalation_triggered=escalation_triggered,
            opt_out_triggered=opt_out_triggered,
            is_ended=is_ended,
            user_message=user_message
        )

    def _build_chat_response(
        self,
        session: SessionData,
        reply: str,
        detected_lang: str,
        booking_triggered: bool,
        booking_status: str,
        booking_details: Optional[Dict[str, Any]],
        escalation_triggered: bool,
        opt_out_triggered: bool,
        is_ended: bool,
        user_message: str
    ) -> ChatResponse:
        from app.models import LeadProfile, SuggestedCard

        q = session.qualification_state
        lead = LeadProfile(
            configuration=q.configuration or "Not provided",
            budget=q.budget or "Not provided",
            purpose=q.purpose or "Not provided",
            timeline=q.timeline or "Not provided",
            interestLevel="High" if q.interest_level == "High" or booking_status == "confirmed" else ("Low" if q.interest_level in ["Low", "Not Interested", "Opt-out"] else "Exploring"),
            siteVisit=f"Scheduled ({booking_details.get('date', 'Upcoming')})" if booking_status == "confirmed" and booking_details else ("Not scheduled" if booking_status != "confirmed" else "Requested"),
            followUp="Required" if booking_status == "confirmed" or escalation_triggered else "Pending",
            extractedInsights=f"Customer interested in Northstar One ({q.configuration or 'residences'})."
        )

        suggested_card = None
        lower_msg = user_message.lower()
        if "2 bhk" in lower_msg or q.configuration == "2 BHK":
            suggested_card = SuggestedCard(
                type="2bhk",
                title="Northstar One — 2 BHK",
                subtitle="Starting price: ₹1.35 Cr onwards",
                price="₹1.35 Cr onwards"
            )
        elif "3 bhk" in lower_msg or q.configuration == "3 BHK":
            suggested_card = SuggestedCard(
                type="3bhk",
                title="Northstar One — 3 BHK",
                subtitle="Starting price: ₹1.75 Cr onwards",
                price="₹1.75 Cr onwards"
            )

        suggest_site_visit = booking_triggered or any(w in lower_msg for w in ["visit", "tour", "sample flat", "kal", "weekend"])

        return ChatResponse(
            session_id=session.session_id,
            reply=reply,
            replyText=reply,
            detected_language=detected_lang,
            qualification_state=session.qualification_state,
            extractedLead=lead,
            suggestSiteVisitWidget=suggest_site_visit,
            suggestedCard=suggested_card,
            booking_triggered=booking_triggered,
            booking_status=booking_status,
            booking_details=booking_details,
            escalation_triggered=escalation_triggered,
            opt_out_triggered=opt_out_triggered,
            is_conversation_ended=is_ended
        )

agent_service = AgentService()
