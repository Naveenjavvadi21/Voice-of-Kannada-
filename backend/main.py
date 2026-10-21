"""
Voice of Kannada (ಕನ್ನಡದ ಧ್ವನಿ) - FastAPI Application Entrypoint
Provides REST endpoints for conversational AI, pronunciation scoring,
audio transcription, guided role-play scenarios, and survival phrasebooks.
"""
import json
import os
from pathlib import Path
from typing import List, Optional
from fastapi import FastAPI, APIRouter, UploadFile, File, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import settings
from .models.schemas import (
    ChatRequest, ChatResponse,
    PronunciationRequest, PronunciationResponse,
    TranscribeResponse, PhraseItem, ScenarioMission
)
from .services.llm_service import llm_service
from .services.pronunciation_service import pronunciation_service
from .services.stt_service import stt_service

DATA_DIR = Path(__file__).resolve().parent / "data"

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Voice-first Kannada tutor for newcomers and language learners.",
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# In-memory cache for static assets
_scenarios_cache = None
_phrases_cache = None
_dialects_cache = None


def get_cached_scenarios() -> List[dict]:
    global _scenarios_cache
    if _scenarios_cache is None:
        path = DATA_DIR / "scenarios.json"
        if path.exists():
            with open(path, "r", encoding="utf-8") as f:
                _scenarios_cache = json.load(f)
        else:
            _scenarios_cache = []
    return _scenarios_cache


def get_cached_phrases() -> List[dict]:
    global _phrases_cache
    if _phrases_cache is None:
        path = DATA_DIR / "phrases.json"
        if path.exists():
            with open(path, "r", encoding="utf-8") as f:
                _phrases_cache = json.load(f)
        else:
            _phrases_cache = []
    return _phrases_cache


def get_cached_dialects() -> List[dict]:
    global _dialects_cache
    if _dialects_cache is None:
        path = DATA_DIR / "regional_dialects.json"
        if path.exists():
            with open(path, "r", encoding="utf-8") as f:
                _dialects_cache = json.load(f)
        else:
            _dialects_cache = []
    return _dialects_cache


# Router definition (supports both /api/* and root /* on serverless platforms like Vercel)
router = APIRouter()


@router.get("/health")
async def health_check():
    """Health check endpoint providing status of providers and API availability."""
    return {
        "status": "online",
        "app": settings.app_name,
        "version": settings.app_version,
        "llm_provider": settings.llm_provider,
        "gemini_configured": bool(settings.gemini_api_key),
        "force_offline_demo": settings.force_offline_demo,
        "stt_provider": settings.stt_provider,
        "tts_provider": settings.tts_provider
    }


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    FR-1 & FR-2: Main voice practice and scenario dialogue endpoint.
    Returns Kannada script, transliteration, English meaning, coaching tips, and suggestions.
    """
    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="Input text cannot be empty.")

    response = await llm_service.generate_chat_response(
        text=request.text,
        scenario_id=request.scenario_id or "free_tutor",
        level=request.level or "beginner",
        history=request.conversation_history
    )
    return response


@router.post("/pronunciation", response_model=PronunciationResponse)
async def pronunciation_endpoint(request: PronunciationRequest):
    """
    FR-3: Compares recognized speech with target phrase, providing 0-100 score,
    per-word status indicators, and an actionable Kannada phonetic coaching tip.
    """
    if not request.target:
        raise HTTPException(status_code=400, detail="Target phrase is required.")

    return pronunciation_service.evaluate(
        target=request.target,
        recognized=request.recognized or ""
    )


@router.post("/transcribe", response_model=TranscribeResponse)
async def transcribe_endpoint(
    audio: UploadFile = File(...),
    hint: Optional[str] = Form(None)
):
    """
    STT transcription fallback for recorded audio blobs.
    """
    audio_content = await audio.read()
    content_type = audio.content_type or "audio/webm"
    return await stt_service.transcribe_audio(
        audio_bytes=audio_content,
        content_type=content_type,
        hint_text=hint
    )


@router.get("/scenarios")
async def get_scenarios():
    """
    FR-2: Returns the 6 guided role-play scenario missions.
    """
    scenarios = get_cached_scenarios()
    return {"scenarios": scenarios}


@router.get("/phrases")
async def get_phrases(category: Optional[str] = Query(None)):
    """
    FR-5: Returns 40+ survival phrases organized by category.
    """
    phrases = get_cached_phrases()
    categories = sorted(list(set(p.get("category", "General") for p in phrases)))

    if category and category.lower() != "all":
        filtered = [p for p in phrases if p.get("category", "").lower() == category.lower()]
    else:
        filtered = phrases

    return {
        "phrases": filtered,
        "categories": ["All"] + categories
    }


@router.get("/dialects")
async def get_dialects():
    """
    FR-7: Returns regional dialect comparisons across Karnataka.
    """
    dialects = get_cached_dialects()
    return {"dialects": dialects}


# Mount router under both /api and root / for seamless compatibility
app.include_router(router, prefix="/api")
app.include_router(router, prefix="")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host=settings.host, port=settings.port, reload=True)
