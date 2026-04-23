from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime
from app.schemas import (
    UserCreate, UserOut, Token, GoogleAuthRequest,
    ForgotPasswordRequest, ResetPasswordRequest,
    ChangePasswordRequest,
)
from app.core.security import (
    hash_password, verify_password, create_access_token,
    create_reset_token, verify_reset_token,
)
from app.core.database import users_col
from app.core.email import send_password_reset_email
from google.oauth2 import id_token
from google.auth.transport import requests

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
        "auth_provider": "email",
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
        "full_name": user.get("full_name", "User"),
        "auth_provider": user.get("auth_provider", "email"),
        "email": user.get("email", ""),
    }


@router.post("/google", response_model=Token)
async def google_auth(request: GoogleAuthRequest):
    try:
        audience = settings.GOOGLE_CLIENT_ID if settings.GOOGLE_CLIENT_ID != "YOUR_GOOGLE_CLIENT_ID" else None

        idinfo = id_token.verify_oauth2_token(
            request.credential,
            requests.Request(),
            audience,
            clock_skew_in_seconds=10
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
            "full_name": display_name,
            "auth_provider": "google",
            "email": email,
        }

    except ValueError as e:
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {str(e)}")


@router.get("/me", response_model=UserOut)
async def get_me(current_user: UserOut = Depends(__import__("app.api.deps", fromlist=["get_current_user"]).get_current_user)):
    return current_user


@router.post("/change-password")
async def change_password(
    body: ChangePasswordRequest,
    current_user=Depends(__import__("app.api.deps", fromlist=["get_current_user"]).get_current_user),
):
    """Change password (for email users) or set a new password (for Google users)."""
    user = await users_col.find_one({"_id": __import__("bson").ObjectId(current_user.id)})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Google users have no existing password — just set one
    if user.get("auth_provider") == "google":
        if body.current_password:
            raise HTTPException(status_code=400, detail="Google accounts don't have a password")
        hashed_pw = hash_password(body.new_password)
        await users_col.update_one({"_id": user["_id"]}, {"$set": {"hashed_password": hashed_pw}})
        return {"message": "Password set successfully"}

    # Email users must verify current password
    if not verify_password(body.current_password, user.get("hashed_password", "")):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    if len(body.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    hashed_pw = hash_password(body.new_password)
    await users_col.update_one({"_id": user["_id"]}, {"$set": {"hashed_password": hashed_pw}})
    return {"message": "Password changed successfully"}


@router.post("/forgot-password")
async def forgot_password(body: ForgotPasswordRequest):
    """Send a password-reset email if the account exists."""
    user = await users_col.find_one({"email": body.email})

    # Always return 200 to prevent email enumeration
    if user:
        token = create_reset_token(body.email)
        reset_url = f"{settings.FRONTEND_URL}/reset-password/{token}"
        full_name = user.get("full_name", "User")
        sent = send_password_reset_email(body.email, reset_url, full_name)
        if not sent:
            print(f"Failed to send reset email to {body.email}")

    return {"message": "If that email is registered, a reset link has been sent."}


@router.post("/reset-password")
async def reset_password(body: ResetPasswordRequest):
    """Validate token and update the user's password."""
    email = verify_reset_token(body.token)
    if not email:
        raise HTTPException(status_code=400, detail="Reset link is invalid or expired.")

    user = await users_col.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if not user.get("hashed_password"):
        raise HTTPException(
            status_code=400,
            detail="This account uses Google Sign-In. Set a password in account settings instead."
        )

    hashed_pw = hash_password(body.new_password)
    await users_col.update_one({"_id": user["_id"]}, {"$set": {"hashed_password": hashed_pw}})

    return {"message": "Password updated successfully. You can now log in."}
