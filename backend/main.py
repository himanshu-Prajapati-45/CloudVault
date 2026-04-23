import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, files, share
from app.core.database import db

app = FastAPI(title="CloudVault API")

from app.core.config import settings

# Build allowed origins: always include localhost for dev, plus FRONTEND_URL for production
allowed_origins = [
    "http://localhost:5173", "http://127.0.0.1:5173",
    "http://localhost:5174", "http://127.0.0.1:5174",
]
if settings.FRONTEND_URL and settings.FRONTEND_URL not in allowed_origins:
    allowed_origins.append(settings.FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
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
    return {
        "status": "healthy",
        "backend": "running",
        "mongo": mongo_status,
        "message": f"Backend live; MongoDB {mongo_status}.",
    }
