"""
Seeniun Properties AI Demo — FastAPI backend
Serves:
  POST /api/chat  →  RAG-powered investor chatbot
  GET  /health    →  health check
  /*              →  React frontend (static files)
"""

import os
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

# Import RAG — chain is built lazily on first request
from rag import answer as rag_answer

# ── App setup ────────────────────────────────────────────────────────────────

app = FastAPI(title="Seeniun Properties AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["*"],
)


# ── Request / Response models ─────────────────────────────────────────────────

class Message(BaseModel):
    user: str
    assistant: str

class ChatRequest(BaseModel):
    message: str
    history: list[Message] = []

class ChatResponse(BaseModel):
    answer: str


# ── API routes ────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "service": "seeniun-ai-demo"}


@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    try:
        history = [m.model_dump() for m in req.history]
        response = await rag_answer(req.message, history)
        return ChatResponse(answer=response)
    except Exception as e:
        print(f"RAG error: {e}")
        raise HTTPException(
            status_code=500,
            detail="I'm having trouble connecting to the AI. Please check your API key or try again.",
        )


# ── Serve React frontend (built by Vite) ──────────────────────────────────────

FRONTEND_DIST = Path(__file__).parent.parent / "frontend" / "dist"

if FRONTEND_DIST.exists():
    # Serve all static assets under /assets etc.
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        # SPA fallback — always return index.html for client-side routing
        index = FRONTEND_DIST / "index.html"
        if index.exists():
            return FileResponse(str(index))
        return {"error": "Frontend not built. Run: cd frontend && npm run build"}
else:
    @app.get("/")
    def no_frontend():
        return {
            "message": "Seeniun AI backend is running.",
            "note": "Frontend not found. Run: cd frontend && npm install && npm run build",
            "api": "POST /api/chat",
        }


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
