from typing import Dict, List, Optional, Any
from datetime import datetime
from app.models import Message, QualificationState, StructuredLeadAnalytics

class SessionData:
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.messages: List[Message] = []
        self.qualification_state = QualificationState()
        self.booking_status: str = "none"  # "none", "pending", "confirmed", "failed"
        self.booking_details: Optional[Dict[str, Any]] = None
        self.escalation_triggered: bool = False
        self.opt_out_triggered: bool = False
        self.is_conversation_ended: bool = False
        self.analytics: Optional[StructuredLeadAnalytics] = None
        self.created_at = datetime.now()
        self.updated_at = datetime.now()

    def add_message(self, role: str, content: str):
        self.messages.append(Message(role=role, content=content))
        self.updated_at = datetime.now()

    def get_messages_for_llm(self) -> List[Dict[str, str]]:
        return [{"role": m.role, "content": m.content} for m in self.messages]

class SessionStore:
    def __init__(self):
        self._sessions: Dict[str, SessionData] = {}

    def get_or_create_session(self, session_id: str) -> SessionData:
        if not session_id or session_id not in self._sessions:
            clean_id = session_id or f"session-{datetime.now().strftime('%Y%m%d%H%M%S')}"
            self._sessions[clean_id] = SessionData(clean_id)
            return self._sessions[clean_id]
        return self._sessions[session_id]

    def get_session(self, session_id: str) -> Optional[SessionData]:
        return self._sessions.get(session_id)

    def reset_session(self, session_id: str) -> SessionData:
        self._sessions[session_id] = SessionData(session_id)
        return self._sessions[session_id]

    def clear_all(self):
        self._sessions.clear()

session_store = SessionStore()
