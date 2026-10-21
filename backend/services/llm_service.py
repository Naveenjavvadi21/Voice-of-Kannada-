"""
LLM Service for Voice of Kannada (ಕನ್ನಡದ ಧ್ವನಿ).
Integrates with Google Gemini API using REST endpoint and X-goog-api-key header:
https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
Automatically degrades gracefully to OfflineMockService on network/API failure.
"""
import json
import logging
from typing import List, Optional
import httpx

from ..config import settings
from ..models.schemas import ChatResponse, ChatMessage, SuggestedReply
from .offline_mock_service import offline_mock_service

logger = logging.getLogger(__name__)


SYSTEM_PROMPT = """You are 'Voice of Kannada' (ಕನ್ನಡದ ಧ್ವನಿ), a patient, warm, and culturally encouraging Kannada tutor.
Your mission is to help non-Kannada speakers (workers, travelers, students, newcomers) speak practical conversational Kannada with confidence.

CRITICAL RULES:
1. Always reply in simple, natural Kannada script with accurate English transliteration and English translation.
2. If the user makes a pronunciation or grammar mistake, provide a gentle, non-shaming 'correction'. Show the better phrase politely.
3. Include an insightful, actionable 'tip' regarding Kannada grammar, etiquette, or cultural context (e.g. using 're' / 'ri' for respect, addressing auto drivers as 'Anna', ordering food).
4. If this is a scenario role-play (e.g., auto ride, restaurant, market), stay in character as the role-play partner while being easy to understand for beginners.
5. Provide 2-3 helpful 'suggested_replies' that the learner can say next, each with Kannada script, transliteration, and English meaning.
6. If the scenario's goal has been reached after 3-5 turns, set 'scenario_completed' to true.
7. Return ONLY a valid JSON object matching the requested schema. No conversational preamble, markdown fence markers or extra text.

JSON Schema format:
{
  "kannada_script": "Kannada text in Kannada script",
  "transliteration": "Romanized English phonetics",
  "english": "Clear English translation",
  "correction": "Gentle correction or null if user was correct",
  "tip": "Practical usage or cultural tip or null",
  "suggested_replies": [
    {
      "kannada": "...",
      "transliteration": "...",
      "english": "..."
    }
  ],
  "scenario_completed": false
}
"""


class LLMService:
    def __init__(self):
        self.api_key = settings.gemini_api_key
        self.model = settings.gemini_model or "gemini-flash-latest"
        self.endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent"

    async def generate_chat_response(
        self,
        text: str,
        scenario_id: Optional[str] = "free_tutor",
        level: str = "beginner",
        history: Optional[List[ChatMessage]] = None
    ) -> ChatResponse:
        """
        Generates structured chat response using Gemini REST endpoint with X-goog-api-key,
        falling back to deterministic offline service.
        """
        # If offline demo forced or no API key, use offline service immediately
        if settings.force_offline_demo or not self.api_key:
            return offline_mock_service.get_response(text, scenario_id, level, history)

        try:
            # Build conversation context
            history_text = ""
            if history:
                for msg in history[-6:]:  # last 3 turns
                    role = "User" if msg.role == "user" else "Tutor"
                    history_text += f"{role}: {msg.kannada_script} ({msg.english})\n"

            user_prompt = f"""Learner Level: {level}
Scenario: {scenario_id}
Prior turns:
{history_text}

User just said: "{text}"

Generate the tutor/partner response now in strict JSON format."""

            payload = {
                "systemInstruction": {
                    "parts": [{"text": SYSTEM_PROMPT}]
                },
                "contents": [
                    {
                        "parts": [{"text": user_prompt}]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.3,
                    "responseMimeType": "application/json"
                }
            }

            headers = {
                "Content-Type": "application/json",
                "X-goog-api-key": self.api_key
            }

            # Call Gemini via REST with timeout
            async with httpx.AsyncClient(timeout=4.0) as client:
                res = await client.post(self.endpoint, headers=headers, json=payload)

                if res.status_code != 200:
                    logger.warning(f"Gemini API returned status {res.status_code}: {res.text}. Falling back to offline mock.")
                    return offline_mock_service.get_response(text, scenario_id, level, history)

                res_json = res.json()
                raw_text = res_json["candidates"][0]["content"]["parts"][0]["text"].strip()

                # Clean possible markdown ticks
                if raw_text.startswith("```json"):
                    raw_text = raw_text[7:]
                if raw_text.startswith("```"):
                    raw_text = raw_text[3:]
                if raw_text.endswith("```"):
                    raw_text = raw_text[:-3]

                data = json.loads(raw_text.strip())

                turn_count = (len(history) if history else 0) + 1
                return ChatResponse(
                    kannada_script=data.get("kannada_script", "ನಮಸ್ಕಾರ!"),
                    transliteration=data.get("transliteration", "Namaskara!"),
                    english=data.get("english", "Hello!"),
                    correction=data.get("correction"),
                    tip=data.get("tip"),
                    suggested_replies=[
                        SuggestedReply(**r) for r in data.get("suggested_replies", [])
                    ],
                    scenario_completed=data.get("scenario_completed", False),
                    turn_count=turn_count
                )

        except Exception as e:
            logger.info(f"Gemini API request note: {e}. Gracefully serving contextual response.")
            return offline_mock_service.get_response(text, scenario_id, level, history)


llm_service = LLMService()
