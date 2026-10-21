"""
Vercel Serverless Function entrypoint for Voice of Kannada (ಕನ್ನಡದ ಧ್ವನಿ).
Exposes the FastAPI application as ASGI handler for Vercel.
"""
import sys
from pathlib import Path

# Add project root to sys.path so 'backend' can be resolved on Vercel
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend.main import app
