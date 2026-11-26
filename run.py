"""
run.py - Application Launcher for QuantView AI
Intelligent Stock Analytics Platform (India NSE/BSE & US NASDAQ/NYSE)

Usage:
    pip install -r backend/requirements.txt
    python run.py

Then navigate to: http://127.0.0.1:8000
"""

import os
import sys
import webbrowser
from pathlib import Path

# Add backend directory to Python path
ROOT = Path(__file__).parent.resolve()
sys.path.insert(0, str(ROOT / "backend"))


def main() -> None:
    try:
        import uvicorn
    except ImportError:
        print("ERROR: uvicorn is not installed in the current Python environment.")
        print("Please install requirements: pip install -r backend/requirements.txt")
        sys.exit(1)

    host = os.environ.get("HOST", "127.0.0.1")
    port = int(os.environ.get("PORT", "8000"))
    url = f"http://{host}:{port}"

    print()
    print("=" * 68)
    print("  QuantView AI — Intelligent Stock Analytics Platform")
    print("  Quantitative Research, Walk-Forward ML & Explainable AI")
    print("=" * 68)
    print(f"  Web Dashboard:      {url}")
    print(f"  Interactive OpenAPI: {url}/docs")
    print("-" * 68)
    print("  Default Pre-Seeded Accounts:")
    print("    * Administrator:  Username: admin   | Password:  Admin@123")
    print("    * Standard User:  Username: trader  | Password:  User@123")
    print("    (You may also register a new account directly in the web app)")
    print("-" * 68)
    print("  Press Ctrl+C to stop the server.")
    print("=" * 68)
    print()

    # Open browser on local machine
    if os.environ.get("NO_BROWSER", "0") != "1":
        import threading
        def _open():
            import time
            time.sleep(1.2)
            try:
                webbrowser.open(url)
            except Exception:
                pass
        threading.Thread(target=_open, daemon=True).start()

    uvicorn.run(
        "backend.main:app",
        host=host,
        port=port,
        reload=False,
        log_level="info",
        app_dir=str(ROOT),
    )


if __name__ == "__main__":
    main()
