"""
Lifeline Medical Education — FastAPI Backend
Main application entry point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from backend.database import create_db_and_tables
from backend.routes import auth, users, cards, study_guide, practice, pimp, retention, nexus


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown logic."""
    await create_db_and_tables()
    yield


app = FastAPI(
    title="Lifeline Medical Education API",
    description="AI-powered medical education platform backend",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://app.lifeline-meded.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router,        prefix="/api/auth",      tags=["Auth"])
app.include_router(users.router,       prefix="/api/users",     tags=["Users"])
app.include_router(cards.router,       prefix="/api/cards",     tags=["Flashcards"])
app.include_router(study_guide.router, prefix="/api/guides",    tags=["Study Guides"])
app.include_router(practice.router,    prefix="/api/practice",  tags=["Question Bank"])
app.include_router(pimp.router,        prefix="/api/pimp",      tags=["AI Pimping"])
app.include_router(retention.router,   prefix="/api/retention", tags=["Retention"])
app.include_router(nexus.router,       prefix="/api/nexus",     tags=["Nexus Community"])


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "Lifeline Medical Education API"}
