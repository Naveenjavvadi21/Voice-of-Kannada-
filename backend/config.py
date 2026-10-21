"""
Configuration module for Voice of Kannada (ಕನ್ನಡದ ಧ್ವನಿ) backend.
Loads environment variables and sets up provider configurations.
"""
import os
from pathlib import Path
from pydantic import BaseModel
from dotenv import load_dotenv

# Locate and load .env file from root
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env", override=True)


class Settings(BaseModel):
    app_name: str = "Voice of Kannada (ಕನ್ನಡದ ಧ್ವನಿ)"
    app_version: str = "1.0.0"
    debug: bool = os.getenv("DEBUG", "false").lower() == "true"
    port: int = int(os.getenv("PORT", 8000))
    host: str = os.getenv("HOST", "0.0.0.0")

    # Gemini LLM Settings (matching user curl endpoint)
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    gemini_model: str = os.getenv("GEMINI_MODEL", "gemini-flash-latest")

    # Provider interfaces (swappable via config)
    llm_provider: str = os.getenv("LLM_PROVIDER", "gemini")
    stt_provider: str = os.getenv("STT_PROVIDER", "web_speech")
    tts_provider: str = os.getenv("TTS_PROVIDER", "web_speech")
    force_offline_demo: bool = os.getenv("FORCE_OFFLINE_DEMO", "false").lower() == "true"

    # CORS origins
    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*",
    ]


settings = Settings()
