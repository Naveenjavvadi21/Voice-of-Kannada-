"""
Pydantic schemas for the Voice of Kannada (ಕನ್ನಡದ ಧ್ವನಿ) API.
Defines strict data models for chat, pronunciation evaluation, scenarios, and phrasebooks.
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str = Field(..., description="'user' or 'assistant'")
    kannada_script: str
    transliteration: Optional[str] = ""
    english: Optional[str] = ""


class SuggestedReply(BaseModel):
    kannada: str
    transliteration: str
    english: str


class ChatRequest(BaseModel):
    text: str = Field(..., description="User's spoken or typed input in Kannada or transliterated Kannada")
    scenario_id: Optional[str] = Field("free_tutor", description="Scenario ID or 'free_tutor'")
    level: Optional[str] = Field("beginner", description="'beginner' or 'intermediate'")
    conversation_history: Optional[List[ChatMessage]] = Field(default_factory=list)


class ChatResponse(BaseModel):
    kannada_script: str
    transliteration: str
    english: str
    correction: Optional[str] = Field(None, description="Gentle correction if user made a grammar or vocab mistake")
    tip: Optional[str] = Field(None, description="Actionable tutor tip on usage or cultural nuance")
    suggested_replies: List[SuggestedReply] = Field(default_factory=list)
    scenario_completed: bool = False
    turn_count: Optional[int] = 0


class WordScore(BaseModel):
    word: str
    matched: Optional[str] = None
    status: str = Field(..., description="'correct', 'warning', or 'missing'")
    phonetic_tip: Optional[str] = None


class PronunciationRequest(BaseModel):
    target: str = Field(..., description="Target phrase in Kannada script or transliteration")
    recognized: str = Field(..., description="Recognized speech from user")


class PronunciationResponse(BaseModel):
    score: int = Field(..., ge=0, le=100, description="Overall pronunciation accuracy 0-100")
    verdict: str = Field(..., description="Encouraging summary: 'Superb!', 'Great effort!', etc.")
    words: List[WordScore] = Field(default_factory=list)
    actionable_tip: str = Field(..., description="Single actionable phonetic tip for improvement")
    target_transliteration: Optional[str] = None
    recognized_transliteration: Optional[str] = None


class TranscribeResponse(BaseModel):
    text: str
    confidence: float = 1.0


class DialectVariant(BaseModel):
    region: str
    phrase_kannada: str
    phrase_transliteration: str
    note: str


class PhraseItem(BaseModel):
    id: str
    category: str
    kannada_script: str
    transliteration: str
    english: str
    context_note: Optional[str] = None
    dialect_variants: Optional[List[DialectVariant]] = None


class ScenarioMission(BaseModel):
    id: str
    title: str
    kannada_title: str
    category: str
    icon: str
    description: str
    goal: str
    target_turns: int
    badge_name: str
    badge_icon: str
    partner_role: str
    starter_message: ChatResponse
    key_phrases: List[SuggestedReply] = Field(default_factory=list)


class ScenarioListResponse(BaseModel):
    scenarios: List[ScenarioMission]


class PhraseListResponse(BaseModel):
    phrases: List[PhraseItem]
    categories: List[str]
