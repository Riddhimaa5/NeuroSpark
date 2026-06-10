from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.models.user import User
from app.utils.auth import hash_password, verify_password, create_token, decode_token, generate_id

router = APIRouter(prefix="/auth", tags=["auth"])

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str
    phone: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

def user_response(user, token):
    return {
        "token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone
        }
    }

@router.post("/signup")
def signup(req: SignupRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        id=generate_id(),
        name=req.name,
        email=req.email,
        phone=req.phone,
        hashed_password=hash_password(req.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user_response(user, create_token(user.id))

@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return user_response(user, create_token(user.id))

@router.get("/me")
def get_me(token: str, db: Session = Depends(get_db)):
    user_id = decode_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "phone": user.phone
    }