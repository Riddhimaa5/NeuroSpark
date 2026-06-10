from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.models.session import Session
from app.utils.auth import decode_token, generate_id
from datetime import datetime

router = APIRouter(prefix="/sessions", tags=["sessions"])

class ScoresData(BaseModel):
    asd_social: float = 0
    asd_repetitive: float = 0
    dyslexia: float = 0
    dysgraphia: float = 0
    dyscalculia: float = 0
    dyslexia_type: Optional[str] = None
    asd_profile: Optional[str] = None

class SessionRequest(BaseModel):
    token: str
    child_name: str
    child_age: float
    child_language: str = "English"
    child_gender: Optional[str] = None
    task_results: Optional[dict] = None
    scores: ScoresData

@router.post("/")
def create_session(req: SessionRequest, db: DBSession = Depends(get_db)):
    user_id = decode_token(req.token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    session = Session(
        id=generate_id(),
        user_id=user_id,
        child_name=req.child_name,
        child_age=req.child_age,
        child_language=req.child_language,
        child_gender=req.child_gender,
        task_results=req.task_results,
        asd_social=req.scores.asd_social,
        asd_repetitive=req.scores.asd_repetitive,
        dyslexia=req.scores.dyslexia,
        dysgraphia=req.scores.dysgraphia,
        dyscalculia=req.scores.dyscalculia,
        dyslexia_type=req.scores.dyslexia_type,
        asd_profile=req.scores.asd_profile,
        date=datetime.utcnow()
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return {"id": session.id, "message": "Session saved"}

@router.get("/")
def get_sessions(token: str, db: DBSession = Depends(get_db)):
    user_id = decode_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    sessions = db.query(Session).filter(
        Session.user_id == user_id
    ).order_by(Session.date.desc()).all()
    return [
        {
            "id": s.id,
            "child_name": s.child_name,
            "child_age": s.child_age,
            "child_language": s.child_language,
            "date": s.date.isoformat(),
            "scores": {
                "asd_social": s.asd_social,
                "asd_repetitive": s.asd_repetitive,
                "dyslexia": s.dyslexia,
                "dysgraphia": s.dysgraphia,
                "dyscalculia": s.dyscalculia,
                "dyslexia_type": s.dyslexia_type,
                "asd_profile": s.asd_profile,
            }
        }
        for s in sessions
    ]

@router.get("/{session_id}")
def get_session(session_id: str, token: str, db: DBSession = Depends(get_db)):
    user_id = decode_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    s = db.query(Session).filter(
        Session.id == session_id,
        Session.user_id == user_id
    ).first()
    if not s:
        raise HTTPException(status_code=404, detail="Session not found")
    return {
        "id": s.id,
        "child_name": s.child_name,
        "child_age": s.child_age,
        "date": s.date.isoformat(),
        "task_results": s.task_results,
        "scores": {
            "asd_social": s.asd_social,
            "asd_repetitive": s.asd_repetitive,
            "dyslexia": s.dyslexia,
            "dysgraphia": s.dysgraphia,
            "dyscalculia": s.dyscalculia,
            "dyslexia_type": s.dyslexia_type,
            "asd_profile": s.asd_profile,
        }
    }