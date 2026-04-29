import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import httpx
from app.api import auth, files, share
from app.core.database import db

app = FastAPI(title="CloudVault API")

from app.core.config import settings

# Build allowed origins — hardcode production URLs to guarantee CORS works
_allowed = [
    "http://localhost:5173", "http://127.0.0.1:5173",
    "http://localhost:5174", "http://127.0.0.1:5174",
    # Production
    "https://wasd1.vercel.app",
    "https://wasd1.onrender.com",
    # Fallback env-based
]
if settings.FRONTEND_URL:
    _clean = settings.FRONTEND_URL.rstrip("/")
    if _clean not in _allowed:
        _allowed.append(_clean)
# Allow any Vercel/Render preview subdomain
import os
for env_key in ["VERCEL_URL", "RAILWAY_STATIC_URL", "NEXT_PUBLIC_VERCEL_URL"]:
    _url = os.getenv(env_key, "").strip()
    if _url and _url not in _allowed:
        _allowed.append(f"https://{_url}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(files.router, prefix="/api/files", tags=["files"])
app.include_router(share.router, prefix="/api/share", tags=["share"])

@app.on_event("startup")
async def create_ttl_index():
    """Auto-delete files 7 days after upload via MongoDB TTL index."""
    try:
        await db.files.create_index(
            "uploaded_at",
            expireAfterSeconds=7 * 24 * 60 * 60,
            name="uploaded_at_ttl",
        )
        logging.info("TTL index created: files expire 7 days after upload")
    except Exception as e:
        logging.warning(f"TTL index creation skipped: {e}")


@app.get("/")
def root():
    return {"message": "CloudVault API is running!"}


@app.get("/health")
async def health_check():
    mongo_status = "unknown"
    try:
        await db.command("ping")
        mongo_status = "connected"
    except Exception:
        mongo_status = "disconnected"

    frontend_status = "unknown"
    try:
        frontend_url = settings.FRONTEND_URL or "http://localhost:5173"
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(frontend_url)
            if resp.status_code in (200, 301, 302, 304):
                frontend_status = "connected"
            else:
                frontend_status = "disconnected"
    except Exception:
        frontend_status = "disconnected"

    return {
        "status": "healthy",
        "backend": "running",
        "mongo": mongo_status,
        "frontend": frontend_status,
        "message": f"Backend live; MongoDB {mongo_status}; Frontend {frontend_status}.",
    }
