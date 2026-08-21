# Northstar Homes — AI Conversational Sales Assistant (Northstar One)

> **Huvo AI Forward Deployed Engineer Assignment**  
> An AI conversational sales representative engineered for **Northstar Homes** to qualify leads, handle objections, book site visits, and generate post-chat analytics for **Northstar One** (Sector 79, Gurugram).

---

## 1. Project Overview

This application implements the conversational sales agent for **Northstar Homes** and its residential development **Northstar One** in **Sector 79, Gurugram**.

### Verified Project Facts (Ground Truth)
The verified information provided for this assignment consists strictly of:
* **Company / Developer:** Northstar Homes
* **Project Name:** Northstar One
* **Location:** Sector 79, Gurugram
* **2 BHK Starting Price:** ₹1.35 crore onwards
* **3 BHK Starting Price:** ₹1.75 crore onwards

*Anti-Hallucination Policy:* The assistant adheres to a strict knowledge boundary. Any query regarding unverified details (such as possession dates, maintenance charges, amenities, floor plan measurements, discounts, or specific highway connectivity) is explicitly acknowledged as unverified rather than invented.

---

## 2. Features Required by the Assignment

The application implements all core capabilities specified in the Huvo AI assignment:

* **Natural Multilingual Conversation:** Converses in English, Hindi (हिन्दी), and Hinglish with dynamic language mirroring.
* **Lead Qualification:** Organically uncovers configuration preference (2 BHK vs 3 BHK), purchase purpose (self-use vs investment), budget alignment, and timeline/site-visit intent.
* **Objection Handling:** Empathetically addresses price sensitivity and location queries using verified facts.
* **Busy & Uninterested Customers:** Respects customer availability immediately and closes non-intrusively.
* **Contact Later & Opt-Out Requests:** Truthfully notes callback requests and complies immediately with communication stop requests without falsely claiming completed backend actions.
* **Unknown Questions & Anti-Hallucination:** States clearly when specific property information is not available.
* **Site-Visit Booking & Failure Recovery:** Collects date and time preferences, confirms bookings upon successful tool execution, and proposes two alternative time slots if a slot is unavailable.
* **Human Escalation:** Registers customer requests for a human advisor truthfully.
* **Conversation Memory:** Retains multi-turn conversation transcripts and structured lead qualification state in session memory.
* **Post-Conversation Analytics:** Extracts structured intelligence including budget, interest level, configuration, site-visit status, and follow-up requirements.

---

## 3. Technology Stack

* **Backend:** Python, FastAPI, Pydantic v2, Uvicorn, Python-Dotenv, Pytest, OpenAI SDK.
* **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide-React.
* **Storage:** In-memory session store (no external database required).

---

## 4. Architecture

```text
User / Browser (React + TypeScript UI)
       │
       ▼  HTTP / JSON
FastAPI Backend (Python)
  ├── POST /api/chat
  ├── POST /api/site-visit
  ├── POST /api/analytics
  └── GET  /health
       │
       ▼  LLM Function Calling / Heuristic Simulation
OpenAI API (GPT-4o-mini) / Offline Heuristic Engine
       │
       ▼
FastAPI Backend (Session Store & Analytics Engine)
       │
       ▼
User / Browser (Updated Transcript, Qualification Chip & Modals)
```

---

## 5. Environment Setup

### Environment Variables
Create a `.env` file inside the `backend/` directory (or use `.env.example` as a template):

```bash
cp .env.example backend/.env
```

**Variables (`backend/.env`):**
```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
BASE_URL=https://api.openai.com/v1
PORT=8000
HOST=0.0.0.0
```

> **Offline Simulation Fallback:** If `OPENAI_API_KEY` is omitted or unavailable, the backend automatically uses its deterministic heuristic simulation engine so all features and automated test scenarios can be tested without an API key.

---

## 6. Running the Project

### Running the Backend

```bash
# 1. Navigate to backend directory
cd backend

# 2. Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Start FastAPI server
uvicorn app.main:app --reload --port 8000
```
* Backend API is available at: `http://localhost:8000`
* Interactive API Documentation (Swagger UI): `http://localhost:8000/docs`

### Running the Frontend

```bash
# 1. In a separate terminal, navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start Vite development server
npm run dev
```
* Frontend Web Interface is available at: `http://localhost:5173`

---

## 7. Post-Conversation Analytics

When a conversation concludes or analytics are requested, the backend extracts the following structured fields:

| Field | Type | Description |
| :--- | :--- | :--- |
| `budget` | string | Detected customer budget (e.g., `₹1.5 Cr`, `Under ₹1.35 Cr`, or `Not specified`) |
| `configuration` | string | Preferred unit (`2 BHK`, `3 BHK`, `Undecided`, or `Not specified`) |
| `purpose_of_purchase`| string | Buyer intent (`Self-use`, `Investment`, or `Not specified`) |
| `interest_level` | string | Assessed interest (`High`, `Moderate`, `Low`, `Not Interested`, or `Opt-out`) |
| `site_visit_status` | string | Visit state (`Booked`, `Requested / Pending`, `Declined`, `Failed / Slot Full`, or `Not Discussed`) |
| `follow_up_requirement`| string | Next follow-up (`Scheduled Callback`, `WhatsApp Brochure`, `Do Not Contact`, `Senior RM Escalation`, or `None`) |
| `lead_status` | string | Classification (`Hot`, `Warm`, `Cold`, `Unqualified`, or `Opted Out`) |
| `primary_language` | string | Language detected (`English`, `Hindi`, or `Hinglish`) |
| `conversation_summary`| string | High-level synthesis of conversation points |
| `recommended_next_action`| string | Recommended next step for the sales representative |

---

## 8. Test Cases & Verification

The test suite covers all 17 required scenarios demonstrating input, expected behavior, and actual output:

| # | Scenario | Input | Expected Behaviour | Actual Output / Result | Status |
| :-: | :--- | :--- | :--- | :--- | :-: |
| 1 | **Normal English** | *"Hello, can you tell me more about Northstar One?"* | Natural English project introduction for Sector 79 & configurations | Introduces Northstar One in Sector 79 with 2 BHK (₹1.35 Cr+) & 3 BHK (₹1.75 Cr+) | ✅ PASS |
| 2 | **Hindi** | *"नमस्ते, क्या आप मुझे नॉर्थस्टार वन के बारे में बता सकते हैं?"* | Conversational Devanagari Hindi reply | Namaste greeting in Hindi with configuration details & polite follow-up | ✅ PASS |
| 3 | **Hinglish** | *"Bhai project ke baare mein batao na, kya rate chal raha hai?"* | Natural Hinglish matching customer tone | Hinglish reply quoting starting rates (₹1.35 Cr & ₹1.75 Cr) | ✅ PASS |
| 4 | **Asking About Price** | *"What is the starting price for apartments here?"* | Clear pricing for 2 BHK (₹1.35 Cr+) & 3 BHK (₹1.75 Cr+) | Quotes 2 BHK at ₹1.35 Cr+ and 3 BHK at ₹1.75 Cr+ | ✅ PASS |
| 5 | **Providing Budget** | *"My budget is around 1.5 Cr. What options do you have?"* | Identifies ₹1.5 Cr budget and aligns with 2 BHK | Maps budget to 2 BHK starting at ₹1.35 Cr | ✅ PASS |
| 6 | **Choosing 2 BHK** | *"I am looking for a 2 BHK apartment for my small family."* | Qualifies 2 BHK and quotes ₹1.35 Cr onwards | Confirms 2 BHK preference and offers site visit to Sector 79 | ✅ PASS |
| 7 | **Choosing 3 BHK** | *"We need a spacious 3 BHK flat."* | Qualifies 3 BHK and quotes ₹1.75 Cr onwards | Confirms 3 BHK preference and quotes ₹1.75 Cr onwards | ✅ PASS |
| 8 | **Objection Handling** | *"Isn't 1.35 Cr too expensive for Sector 79?"* | Empathetic budget acknowledgment using verified facts | Acknowledges budget consideration and restates 2 BHK starting range | ✅ PASS |
| 9 | **Busy Customer** | *"I am driving right now and busy."* | Respects time immediately; offers callback or summary | Acknowledges immediately without holding up the customer | ✅ PASS |
| 10 | **Uninterested Customer**| *"I am not interested in Gurugram properties."* | Non-pushy closure; marks interest level as Not Interested | Polite non-intrusive closing; sets interest level to Not Interested | ✅ PASS |
| 11 | **Contact Later** | *"Please call me tomorrow after 4 PM."* | Truthfully notes preferred callback time without false claims | Notes callback preference for tomorrow around 4 PM | ✅ PASS |
| 12 | **Stop Communication** | *"Stop messaging me and remove my number."* | Respects opt-out immediately; terminates conversation | Confirms opt-out respect truthfully and ends interaction | ✅ PASS |
| 13 | **Unknown Question** | *"What is the exact monthly maintenance charge per sq ft?"* | Acknowledges missing verified information truthfully | States verified figure is not available rather than guessing | ✅ PASS |
| 14 | **Site-Visit (Success)** | *"I want to book a site visit this Saturday at 11 AM."* | Executes booking and provides confirmation | Confirms site visit booking with Booking ID for Sector 79 | ✅ PASS |
| 15 | **Site-Visit (Failure)** | *"Can I book a site visit for Sunday at 11 AM?"* (Full) | Politely explains capacity and proposes 2 alternatives | Informs slot is unavailable and proposes 2 alternate time slots | ✅ PASS |
| 16 | **Human Escalation** | *"I want to talk to a human manager right now."* | Registers request for a human advisor | Truthfully registers request for human advisor follow-up | ✅ PASS |
| 17 | **Closing & Analytics**| Multi-turn conversation -> *"Thank you, goodbye!"* | Graceful closure and structured analytics generation | Warm closing message and outputs complete JSON lead analytics | ✅ PASS |

### Running the Test Suite

```bash
# Run pytest automated test suite
pytest -v

# Run formatted terminal report showing Input -> Expected -> Actual Output
python backend/run_tests.py
```

---

## 9. Key Assumptions & Known Limitations

### Key Assumptions
1. **Scope of Knowledge:** Only the 5 verified project facts provided in the assignment description (Developer: Northstar Homes, Project: Northstar One, Location: Sector 79 Gurugram, 2 BHK: ₹1.35 Cr+, 3 BHK: ₹1.75 Cr+) are treated as factual.
2. **Site-Visit Booking:** Site visits are simulated in-memory and return a structured confirmation with a unique booking reference without requiring third-party calendar software.
3. **Session Persistence:** Conversations are maintained in an in-memory session store during the runtime of the server.

### Known Limitations
1. **In-Memory Storage:** Session transcripts and bookings are stored in memory; restarting the FastAPI process resets active sessions.
2. **Third-Party Integrations:** External CRM platforms (Salesforce/HubSpot) and live telephony hardware are intentionally out of scope for this assignment.

---

## 10. AI Tools Used

* **OpenAI API (`gpt-4o-mini`):** Used for LLM conversational inference, function calling, and structured JSON analytics extraction.
* **ChatGPT:** Used during development for guidance.
