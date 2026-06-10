from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import auth, sessions
from app.models import user, session

Base.metadata.create_all(bind=engine)

app = FastAPI(title="NeuroSpark API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(sessions.router)

@app.get("/")
def root():
    return {"message": "NeuroSpark API is running"}

@app.get("/health")
def health():
    return {"status": "healthy"}