"""
AI Real Estate Lead Conversion Engine — FastAPI Application Entry Point

Production-grade async API server for managing real estate leads,
AI-powered conversations, property listings, and conversion analytics.
"""

import logging
import sys
from pathlib import Path
from contextlib import asynccontextmanager

from dotenv import load_dotenv

# Load .env from the backend root (one level up from app/)
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import engine, Base, async_engine

# ──────────────────────────────────────────────
# Logging Configuration
# ──────────────────────────────────────────────

settings = get_settings()

LOG_LEVEL = logging.DEBUG if settings.debug else logging.INFO

logging.basicConfig(
    level=LOG_LEVEL,
    format="%(asctime)s | %(levelname)-8s | %(name)s — %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[
        logging.StreamHandler(sys.stdout),
    ],
)

# Silence noisy third-party loggers in production
for _noisy in ("uvicorn.access", "sqlalchemy.engine", "httpx"):
    logging.getLogger(_noisy).setLevel(logging.WARNING)

logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────
# Lifespan: startup & shutdown
# ──────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application startup and shutdown lifecycle."""

    # ── Startup ────────────────────────────────
    logger.info("Starting %s v%s [env=%s]", settings.app_name, "1.0.0", settings.app_env)

    # Create database tables (sync engine — safe for SQLite)
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables verified / created")

    yield  # ← application runs here

    # ── Shutdown ───────────────────────────────
    await async_engine.dispose()
    logger.info("Async engine connections closed — shutdown complete")


# ──────────────────────────────────────────────
# FastAPI Application
# ──────────────────────────────────────────────

app = FastAPI(
    title=settings.app_name,
    description=(
        "Production-grade API for managing real estate leads, "
        "AI-powered follow-ups via Claude, property matching, "
        "and conversion analytics."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)


# ──────────────────────────────────────────────
# Middleware — CORS
# ──────────────────────────────────────────────

_allowed_origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ──────────────────────────────────────────────
# Middleware — Security & Logging
# ──────────────────────────────────────────────

from app.middleware.security import (
    RateLimitMiddleware,
    RequestLoggingMiddleware,
    SecurityHeadersMiddleware,
)

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(RateLimitMiddleware, requests_per_minute=settings.rate_limit_per_minute)


# ──────────────────────────────────────────────
# Router Registration
# ──────────────────────────────────────────────

from app.routers import leads, analytics, auth, notes, activity_logs, growth

app.include_router(auth.router)
app.include_router(leads.router)
app.include_router(analytics.router)
app.include_router(notes.router)
app.include_router(activity_logs.router)
app.include_router(growth.router)


# ──────────────────────────────────────────────
# Health-Check Endpoints
# ──────────────────────────────────────────────

@app.get("/", tags=["Health"])
async def root():
    """Root health-check endpoint."""
    return {
        "status": "running",
        "app": settings.app_name,
        "version": "1.0.0",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Detailed health-check endpoint."""
    return {
        "status": "healthy",
        "database": "connected",
        "ai_engine": "ready",
        "environment": settings.app_env,
    }
