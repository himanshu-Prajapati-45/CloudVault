from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Request, Body
from typing import List, Optional
import secrets
from datetime import datetime, timedelta
from bson import ObjectId
from pydantic import BaseModel
from app.schemas import UserOut
from app.api.deps import get_current_user
from app.core.database import files_col
from app.core.s3 import upload_to_s3, delete_from_s3, generate_presigned_url
from app.core.security import hash_password

router = APIRouter()

MAX_SIZE_BYTES = 10 * 1024 * 1024 * 1024  # 10 GB
VALID_EXPIRY_HOURS = {1, 24, 72, 168}  # 1h, 24h, 3d, 7d


class ShareRequest(BaseModel):
    password: Optional[str] = None


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    current_user: UserOut = Depends(get_current_user)
):
    file_bytes = await file.read()
    if len(file_bytes) > MAX_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="File exceeds 10 GB limit")

    unique_name = f"{secrets.token_hex(4)}_{file.filename}"

    # Upload to S3
    upload_to_s3(file_bytes, unique_name, file.content_type or "application/octet-stream")

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

    return {"file_id": str(result.inserted_id), "url": unique_name}


@router.get("/")
async def list_files(current_user: UserOut = Depends(get_current_user)):
    cursor = files_col.find({"user_id": current_user.id, "is_trashed": {"$ne": True}}).sort("uploaded_at", -1)
    files = await cursor.to_list(length=100)

    for f in files:
        f["id"] = str(f["_id"])
        del f["_id"]
        f["url"] = generate_presigned_url(f["s3_key"])
        if f.get("share_token"):
            f["share_token"] = f["share_token"]
            f["share_expires_at"] = f.get("share_expires_at")
            f["share_password"] = bool(f.get("share_password_hash"))
        else:
            f["share_token"] = None
            f["share_expires_at"] = None
            f["share_password"] = None

    return files


@router.get("/trash")
async def list_trashed_files(current_user: UserOut = Depends(get_current_user)):
    cursor = files_col.find({"user_id": current_user.id, "is_trashed": True}).sort("uploaded_at", -1)
    files = await cursor.to_list(length=100)

    for f in files:
        f["id"] = str(f["_id"])
        del f["_id"]
        f["url"] = generate_presigned_url(f["s3_key"])
        if f.get("share_token"):
            f["share_token"] = f["share_token"]
            f["share_expires_at"] = f.get("share_expires_at")
            f["share_password"] = bool(f.get("share_password_hash"))
        else:
            f["share_token"] = None
            f["share_expires_at"] = None
            f["share_password"] = None

    return files


@router.get("/search")
async def search_files(q: str, current_user: UserOut = Depends(get_current_user)):
    cursor = files_col.find({
        "user_id": current_user.id,
        "is_trashed": {"$ne": True},
        "original_name": {"$regex": q, "$options": "i"}
    }).sort("uploaded_at", -1)

    files = await cursor.to_list(length=100)
    for f in files:
        f["id"] = str(f["_id"])
        del f["_id"]
        f["url"] = generate_presigned_url(f["s3_key"])

    return files


@router.get("/storage-stats")
async def get_storage_stats(current_user: UserOut = Depends(get_current_user)):
    pipeline = [
        {"$match": {"user_id": current_user.id}},
        {"$group": {"_id": None, "total_size": {"$sum": "$file_size_bytes"}}}
    ]
    cursor = files_col.aggregate(pipeline)
    result = await cursor.to_list(length=1)

    total_size = result[0]["total_size"] if result else 0
    limit = 10 * 1024 * 1024 * 1024

    return {
        "used_bytes": total_size,
        "limit_bytes": limit,
        "percentage": (total_size / limit * 100) if limit > 0 else 0
    }


@router.get("/{file_id}/download")
async def get_download_url(file_id: str, current_user: UserOut = Depends(get_current_user)):
    file = await files_col.find_one({"_id": ObjectId(file_id), "user_id": current_user.id})
    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    # Presigned URL valid for 1 hour, forcing download via Content-Disposition
    filename = file.get("original_name", "download")
    download_url = generate_presigned_url(file["s3_key"], expires_in=3600, filename=filename)
    return {"download_url": download_url}


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

    # Delete from S3
    delete_from_s3(file["s3_key"])

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
    current_user: UserOut = Depends(get_current_user),
    body: Optional[ShareRequest] = Body(None)
):
    if expires_hours not in VALID_EXPIRY_HOURS:
        raise HTTPException(status_code=400, detail=f"Invalid expiry. Must be one of: {sorted(VALID_EXPIRY_HOURS)}")

    file = await files_col.find_one({"_id": ObjectId(file_id), "user_id": current_user.id})
    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    password = body.password if body else None
    share_token = secrets.token_urlsafe(32)
    expiry = datetime.utcnow() + timedelta(hours=expires_hours)
    share_password_hash = hash_password(password) if password else None

    update = {
        "share_token": share_token,
        "share_expires_at": expiry,
        "share_created_at": datetime.utcnow(),
    }
    if share_password_hash:
        update["share_password_hash"] = share_password_hash
    else:
        update["share_password_hash"] = None

    await files_col.update_one({"_id": ObjectId(file_id)}, {"$set": update})

    return {"share_url": f"/share/{share_token}", "expires_at": expiry.isoformat()}


@router.delete("/{file_id}/share")
async def revoke_share_link(
    file_id: str,
    current_user: UserOut = Depends(get_current_user)
):
    file = await files_col.find_one({"_id": ObjectId(file_id), "user_id": current_user.id})
    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    await files_col.update_one(
        {"_id": ObjectId(file_id)},
        {"$unset": {"share_token": "", "share_expires_at": "", "share_password_hash": "", "share_created_at": ""}}
    )
    return {"message": "Share link revoked successfully"}
