import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, files, share
from app.core.database import db

app = FastAPI(title="CloudVault API")

os.makedirs("uploaded", exist_ok=True)
app.mount("/uploaded", StaticFiles(directory="uploaded"), name="uploaded")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(files.router, prefix="/api/files", tags=["files"])
app.include_router(share.router, prefix="/api/share", tags=["share"])

@app.get("/")
def root():
    return {"message": "CloudVault API is running!"}

import urllib.request

@app.get("/health")
async def health_check():
    frontend_status = "not connected"
    mongo_status = "unknown"

    try:
        req = urllib.request.Request("http://localhost:5173", method="HEAD")
        with urllib.request.urlopen(req, timeout=2) as response:
            if response.status == 200:
                frontend_status = "connected"
    except Exception:
        pass

    try:
        await db.command("ping")
        mongo_status = "connected"
    except Exception:
        mongo_status = "disconnected"

    return {
        "status": "healthy",
        "backend": "running",
        "frontend": frontend_status,
        "mongo": mongo_status,
        "message": f"Backend live; Frontend {frontend_status}; MongoDB {mongo_status}."
    }
