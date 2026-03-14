from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime
from app.schemas import UserCreate, UserOut, Token, GoogleAuthRequest
from app.core.security import hash_password, verify_password, create_access_token
from app.core.database import users_col
from google.oauth2 import id_token
from google.auth.transport import requests
import os

from app.core.config import settings

router = APIRouter()


@router.post("/register", response_model=UserOut)
async def register(user: UserCreate):
    existing_user = await users_col.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = hash_password(user.password)
    new_user = {
        "full_name": user.full_name,
        "email": user.email,
        "hashed_password": hashed_pw,
        "created_at": datetime.utcnow(),
        "storage_used_bytes": 0
    }

    result = await users_col.insert_one(new_user)
    new_user["id"] = str(result.inserted_id)
    return new_user

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await users_col.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    access_token = create_access_token(data={"sub": str(user["_id"])})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "full_name": user.get("full_name", "User")
    }

@router.post("/google", response_model=Token)
async def google_auth(request: GoogleAuthRequest):
    try:
        idinfo = id_token.verify_oauth2_token(
            request.credential,
            requests.Request(),
            settings.GOOGLE_CLIENT_ID
        )

        email = idinfo.get("email")
        name = idinfo.get("name")

        if not email:
            raise HTTPException(status_code=400, detail="Google token missing email")

        user = await users_col.find_one({"email": email})

        if not user:
            new_user = {
                "full_name": name,
                "email": email,
                "hashed_password": "",
                "auth_provider": "google",
                "created_at": datetime.utcnow(),
                "storage_used_bytes": 0
            }
            result = await users_col.insert_one(new_user)
            user_id = str(result.inserted_id)
        else:
            user_id = str(user["_id"])

        access_token = create_access_token(data={"sub": user_id})
        display_name = user.get("full_name", name) if user else name

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "full_name": display_name
        }

    except ValueError as e:
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {str(e)}")
