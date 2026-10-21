"""
Voice of Kannada (ಕನ್ನಡದ ಧ್ವನಿ) - Unified Application Launcher
Starts both the FastAPI Backend (port 8000) and React Vite Frontend (port 5173).
"""
import sys
import os
import subprocess
import time
import signal
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ROOT_DIR / "backend"
FRONTEND_DIR = ROOT_DIR / "frontend"


def main():
    print("=" * 65)
    print("  ಕನ್ನಡದ ಧ್ವನಿ | Voice of Kannada — Hackathon Prototype 2026")
    print("=" * 65)
    print("  Starting Backend on  : http://localhost:8000")
    print("  Starting Frontend on : http://localhost:5173")
    print("  API Documentation at : http://localhost:8000/docs")
    print("=" * 65)

    # Launch Backend with uvicorn
    backend_cmd = [
        sys.executable, "-m", "uvicorn",
        "backend.main:app",
        "--host", "0.0.0.0",
        "--port", "8000",
        "--reload"
    ]

    # Launch Frontend with npm run dev
    # On Windows, npm is npm.cmd
    npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
    frontend_cmd = [npm_cmd, "run", "dev"]

    backend_proc = None
    frontend_proc = None

    try:
        backend_proc = subprocess.Popen(backend_cmd, cwd=str(ROOT_DIR))
        time.sleep(1.5)  # Let backend initialize
        frontend_proc = subprocess.Popen(frontend_cmd, cwd=str(FRONTEND_DIR))

        print("\n[SUCCESS] Both servers running! Press Ctrl+C in this terminal to stop both.\n")

        while True:
            time.sleep(1)
            if backend_proc.poll() is not None:
                print("[WARNING] Backend stopped.")
                break
            if frontend_proc.poll() is not None:
                print("[WARNING] Frontend stopped.")
                break

    except KeyboardInterrupt:
        print("\nShutting down Voice of Kannada services gracefully...")
    finally:
        if backend_proc and backend_proc.poll() is None:
            backend_proc.terminate()
        if frontend_proc and frontend_proc.poll() is None:
            frontend_proc.terminate()
        print("All processes stopped. ಧನ್ಯವಾದಗಳು (Thank you)!")


if __name__ == "__main__":
    main()
