from fastapi import APIRouter, HTTPException, Request, Query
from datetime import datetime
from typing import Optional
from app.core.database import files_col
from app.core.s3 import generate_presigned_url
from app.core.security import verify_password

router = APIRouter()

@router.get("/{token}")
async def access_shared_file(
    request: Request,
    token: str,
    password: Optional[str] = Query(None)
):
    file = await files_col.find_one({"share_token": token})
    if not file or file.get("share_expires_at", datetime.min) < datetime.utcnow():
        raise HTTPException(status_code=404, detail="Link expired or invalid")

    # Check password protection
    if file.get("share_password_hash"):
        if not password:
            raise HTTPException(status_code=401, detail="Password required")
        if not verify_password(password, file["share_password_hash"]):
            raise HTTPException(status_code=401, detail="Incorrect password")

    preview_url = generate_presigned_url(file["s3_key"], expires_in=3600)
    filename = file.get("original_name", "download")
    download_url = generate_presigned_url(file["s3_key"], expires_in=3600, filename=filename)

    return {
        "preview_url": preview_url,
        "download_url": download_url,
        "name": file.get("original_name", "Shared File"),
        "type": file.get("file_type", "application/octet-stream"),
        "size": file.get("file_size_bytes", 0),
        "expires_at": file.get("share_expires_at", "").isoformat() if file.get("share_expires_at") else None,
        "is_password_protected": bool(file.get("share_password_hash")),
    }
