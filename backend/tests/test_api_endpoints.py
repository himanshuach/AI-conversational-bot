from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["project"] == "Northstar One"
    assert data["location"] == "Sector 79, Gurugram"

def test_project_info_endpoint():
    response = client.get("/api/project-info")
    assert response.status_code == 200
    data = response.json()
    assert "2 BHK" in data["pricing"]
    assert "3 BHK" in data["pricing"]

def test_chat_flow_and_analytics_endpoint():
    session_id = "test-api-session"
    
    # 1. Send chat message
    chat_resp = client.post("/api/chat", json={
        "session_id": session_id,
        "message": "Hi, what is the price for a 2 BHK apartment?",
        "simulate_booking_failure": False
    })
    assert chat_resp.status_code == 200
    chat_data = chat_resp.json()
    assert "reply" in chat_data
    assert chat_data["qualification_state"]["configuration"] == "2 BHK"
    
    # 2. Book visit
    book_resp = client.post("/api/book-visit", json={
        "session_id": session_id,
        "preferred_date": "Upcoming Saturday",
        "preferred_time": "11:00 AM",
        "configuration": "2 BHK",
        "force_failure": False
    })
    assert book_resp.status_code == 200
    book_data = book_resp.json()
    assert book_data["success"] is True
    assert "booking_id" in book_data
    
    # 3. Fetch analytics
    analytics_resp = client.post("/api/analytics", json={"session_id": session_id})
    assert analytics_resp.status_code == 200
    analytics_data = analytics_resp.json()
    assert analytics_data["configuration"] == "2 BHK"
    assert analytics_data["site_visit_status"] == "Booked"
    
    # 4. Reset
    reset_resp = client.post("/api/reset", json={"session_id": session_id})
    assert reset_resp.status_code == 200
