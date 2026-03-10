from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Request
from typing import List
import os
import secrets
from datetime import datetime, timedelta
from bson import ObjectId
from app.schemas import UserOut
from app.api.deps import get_current_user
from app.core.database import files_col

router = APIRouter()

MAX_SIZE_BYTES = 10 * 1024 * 1024 * 1024 # 10 GB
UPLOAD_DIR = "uploaded"

def get_file_url(base_url: str, filename: str):
    return f"{base_url}/uploaded/{filename}"

@router.post("/upload")
async def upload_file(
    request: Request,
    file: UploadFile = File(...),
    current_user: UserOut = Depends(get_current_user)
):
    file_bytes = await file.read()
    if len(file_bytes) > MAX_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="File exceeds 100 MB limit")

    unique_name = f"{secrets.token_hex(4)}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, unique_name)

    with open(file_path, "wb") as f:
        f.write(file_bytes)

    file_doc = {
        "user_id": current_user.id,
        "original_name": file.filename,
        "s3_key": unique_name,
        "file_type": file.content_type,
        "file_size_bytes": len(file_bytes),
        "uploaded_at": datetime.utcnow(),
        "is_trashed": False
    }

    try:
        result = await files_col.insert_one(file_doc)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database insertion error: {str(e)}")

    base_url = str(request.base_url).rstrip("/")
    url = get_file_url(base_url, unique_name)
    return {"file_id": str(result.inserted_id), "url": url}

@router.get("/")
async def list_files(request: Request, current_user: UserOut = Depends(get_current_user)):
    cursor = files_col.find({"user_id": current_user.id, "is_trashed": {"$ne": True}}).sort("uploaded_at", -1)
    files = await cursor.to_list(length=100)
    base_url = str(request.base_url).rstrip("/")

    for f in files:
        f["id"] = str(f["_id"])
        del f["_id"]
        f["url"] = get_file_url(base_url, f["s3_key"])

    return files

@router.get("/{file_id}/download")
async def get_download_url(request: Request, file_id: str, current_user: UserOut = Depends(get_current_user)):
    file = await files_col.find_one({"_id": ObjectId(file_id), "user_id": current_user.id})
    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    base_url = str(request.base_url).rstrip("/")
    url = get_file_url(base_url, file["s3_key"])
    return {"download_url": url}

from fastapi.responses import FileResponse
@router.get("/{file_id}/download/direct")
async def download_file_direct(file_id: str, current_user: UserOut = Depends(get_current_user)):
    file = await files_col.find_one({"_id": ObjectId(file_id), "user_id": current_user.id})
    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    file_path = os.path.join(UPLOAD_DIR, file["s3_key"])
    return FileResponse(
        path=file_path,
        filename=file["original_name"],
        media_type=file["file_type"]
    )

@router.delete("/{file_id}")
async def delete_file(file_id: str, current_user: UserOut = Depends(get_current_user)):
    file = await files_col.find_one({"_id": ObjectId(file_id), "user_id": current_user.id})
    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    await files_col.update_one({"_id": ObjectId(file_id)}, {"$set": {"is_trashed": True}})
    return {"message": "Moved to trash successfully"}
