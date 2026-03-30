from fastapi import APIRouter, HTTPException, Request
from datetime import datetime
from app.core.database import files_col

router = APIRouter()

@router.get("/{token}")
async def access_shared_file(request: Request, token: str):
    file = await files_col.find_one({"share_token": token})
    if not file or file.get("share_expires_at", datetime.min) < datetime.utcnow():
        raise HTTPException(status_code=404, detail="Link expired or invalid")

    base_url = str(request.base_url).rstrip("/")
    url = f"{base_url}/uploaded/{file['s3_key']}"
    return {"download_url": url}

