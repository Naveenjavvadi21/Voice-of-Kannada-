"""
Automated unit tests for Voice of Kannada (ಕನ್ನಡದ ಧ್ವನಿ) backend.
"""
import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "Voice of Kannada" in data["app"]


def test_chat_endpoint_free_tutor():
    payload = {
        "text": "ನಮಸ್ಕಾರ (Namaskara)",
        "scenario_id": "free_tutor",
        "level": "beginner",
        "conversation_history": []
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "kannada_script" in data
    assert "transliteration" in data
    assert "english" in data
    assert len(data["suggested_replies"]) > 0


def test_chat_endpoint_scenario_progression():
    payload = {
        "text": "ಇಂದಿರಾನಗರಕ್ಕೆ ಬರ್ತೀರಾ?",
        "scenario_id": "auto_ride",
        "level": "beginner",
        "conversation_history": []
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "ಇಂದಿರಾನಗರ" in data["kannada_script"]
    assert data["scenario_completed"] is False


def test_pronunciation_exact_match():
    payload = {
        "target": "ಧನ್ಯವಾದಗಳು",
        "recognized": "ಧನ್ಯವಾದಗಳು"
    }
    response = client.post("/api/pronunciation", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["score"] >= 90
    assert len(data["words"]) == 1
    assert data["words"][0]["status"] == "correct"


def test_pronunciation_close_match_with_phonetic_coaching():
    payload = {
        "target": "ಧನ್ಯವಾದಗಳು",
        "recognized": "ದನ್ಯವಾದ"
    }
    response = client.post("/api/pronunciation", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert 50 <= data["score"] <= 90
    assert "actionable_tip" in data
    assert len(data["actionable_tip"]) > 0


def test_pronunciation_empty_recognized():
    payload = {
        "target": "ನಮಸ್ಕಾರ",
        "recognized": ""
    }
    response = client.post("/api/pronunciation", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["score"] == 0
    assert data["words"][0]["status"] == "missing"


def test_get_scenarios():
    response = client.get("/api/scenarios")
    assert response.status_code == 200
    data = response.json()
    assert len(data["scenarios"]) >= 6
    ids = [s["id"] for s in data["scenarios"]]
    assert "auto_ride" in ids
    assert "restaurant_dosa" in ids
    assert "market_vegetables" in ids


def test_get_phrases():
    response = client.get("/api/phrases")
    assert response.status_code == 200
    data = response.json()
    assert len(data["phrases"]) >= 40
    assert "Commute" in data["categories"]
    assert "Food" in data["categories"]


def test_get_dialects():
    response = client.get("/api/dialects")
    assert response.status_code == 200
    data = response.json()
    assert len(data["dialects"]) >= 8
    first = data["dialects"][0]
    assert "variants" in first
    regions = [v["region"] for v in first["variants"]]
    assert any("Bengaluru" in r for r in regions)
    assert any("Mysuru" in r for r in regions)
    assert any("Uttara Karnataka" in r for r in regions)
