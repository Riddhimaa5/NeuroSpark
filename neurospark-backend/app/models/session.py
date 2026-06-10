from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Session(Base):
    __tablename__ = "sessions"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    child_name = Column(String, nullable=False)
    child_age = Column(Float, nullable=False)
    child_language = Column(String, default="English")
    child_gender = Column(String, nullable=True)
    date = Column(DateTime, default=datetime.utcnow)
    task_results = Column(JSON, nullable=True)
    asd_social = Column(Float, default=0)
    asd_repetitive = Column(Float, default=0)
    dyslexia = Column(Float, default=0)
    dysgraphia = Column(Float, default=0)
    dyscalculia = Column(Float, default=0)
    dyslexia_type = Column(String, nullable=True)
    asd_profile = Column(String, nullable=True)

    user = relationship("User", back_populates="sessions")