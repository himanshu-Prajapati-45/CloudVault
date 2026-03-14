from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str
    full_name: str
    email: EmailStr
    storage_used_bytes: int

class Token(BaseModel):
    access_token: str
    token_type: str
    full_name: Optional[str] = None

class GoogleAuthRequest(BaseModel):
    credential: str
