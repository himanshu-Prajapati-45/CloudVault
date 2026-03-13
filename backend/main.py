import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.api import files, share

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

app.include_router(files.router, prefix="/api/files", tags=["files"])
app.include_router(share.router, prefix="/api/share", tags=["share"])

@app.get("/")
def root():
    return {"message": "CloudVault API is running!"}
