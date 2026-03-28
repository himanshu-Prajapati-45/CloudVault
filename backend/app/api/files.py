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

# Removed ALLOWED_TYPES restriction to support all file extensions
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
    # All file types are now allowed as requested

    file_bytes = await file.read()
    if len(file_bytes) > MAX_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="File exceeds 10 GB limit")

    unique_name = f"{secrets.token_hex(4)}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, unique_name)

    with open(file_path, "wb") as f:
        f.write(file_bytes)

    file_doc = {
        "user_id": current_user.id,
        "original_name": file.filename,
        "s3_key": unique_name, # Storing local filename here instead
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

@router.get("/trash")
async def list_trashed_files(request: Request, current_user: UserOut = Depends(get_current_user)):
    cursor = files_col.find({"user_id": current_user.id, "is_trashed": True}).sort("uploaded_at", -1)
    files = await cursor.to_list(length=100)
    base_url = str(request.base_url).rstrip("/")

    for f in files:
        f["id"] = str(f["_id"])
        del f["_id"]
        f["url"] = get_file_url(base_url, f["s3_key"])

    return files

@router.get("/search")
async def search_files(request: Request, q: str, current_user: UserOut = Depends(get_current_user)):
    # Case-insensitive search on original_name
    cursor = files_col.find({
        "user_id": current_user.id,
        "is_trashed": {"$ne": True},
        "original_name": {"$regex": q, "$options": "i"}
    }).sort("uploaded_at", -1)

    files = await cursor.to_list(length=100)
    base_url = str(request.base_url).rstrip("/")
    for f in files:
        f["id"] = str(f["_id"])
        del f["_id"]
        f["url"] = get_file_url(base_url, f["s3_key"])

    return files

@router.get("/storage-stats")
async def get_storage_stats(current_user: UserOut = Depends(get_current_user)):
    # Calculate total storage used by user
    pipeline = [
        {"$match": {"user_id": current_user.id}},
        {"$group": {"_id": None, "total_size": {"$sum": "$file_size_bytes"}}}
    ]
    cursor = files_col.aggregate(pipeline)
    result = await cursor.to_list(length=1)
    
    total_size = result[0]["total_size"] if result else 0
    # Assume 10GB limit for display
    limit = 10 * 1024 * 1024 * 1024 
    
    return {
        "used_bytes": total_size,
        "limit_bytes": limit,
        "percentage": (total_size / limit * 100) if limit > 0 else 0
    }

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
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Physical file not found")
        
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
        
    # Soft delete
    await files_col.update_one({"_id": ObjectId(file_id)}, {"$set": {"is_trashed": True}})
    return {"message": "Moved to trash successfully"}

@router.delete("/{file_id}/permanent")
async def permanent_delete_file(file_id: str, current_user: UserOut = Depends(get_current_user)):
    file = await files_col.find_one({"_id": ObjectId(file_id), "user_id": current_user.id})
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
        
    # Try removing the local file
    file_path = os.path.join(UPLOAD_DIR, file["s3_key"])
    if os.path.exists(file_path):
        os.remove(file_path)
        
    await files_col.delete_one({"_id": ObjectId(file_id)})
    return {"message": "Permanently deleted"}

@router.post("/{file_id}/restore")
async def restore_file(file_id: str, current_user: UserOut = Depends(get_current_user)):
    file = await files_col.find_one({"_id": ObjectId(file_id), "user_id": current_user.id})
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
        
    await files_col.update_one({"_id": ObjectId(file_id)}, {"$set": {"is_trashed": False}})
    return {"message": "Restored successfully"}

@router.post("/{file_id}/share")
async def generate_share_link(
    file_id: str, 
    expires_hours: int = 24, 
    current_user: UserOut = Depends(get_current_user)
):
    file = await files_col.find_one({"_id": ObjectId(file_id), "user_id": current_user.id})
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
        
    share_token = secrets.token_urlsafe(32)
    expiry = datetime.utcnow() + timedelta(hours=expires_hours)
    
    await files_col.update_one(
        {"_id": ObjectId(file_id)},
        {"$set": {"share_token": share_token, "share_expires_at": expiry}}
    )
    
    return {"share_url": f"/share/{share_token}"}
