"""
Async database configuration for AI Real Estate Lead Conversion Engine.

Provides:
  • Async SQLAlchemy engine & session factory (aiosqlite)
  • Sync engine for Alembic migrations & table creation
  • Declarative base for ORM models
  • FastAPI dependency for per-request async sessions
"""

import logging
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# ──────────────────────────────────────────────
# Database URL resolution
# ──────────────────────────────────────────────

_sync_url: str = settings.database_url          # e.g. "sqlite:///./lead_engine.db"
_async_url: str = _sync_url.replace("sqlite:///", "sqlite+aiosqlite:///", 1)

# ──────────────────────────────────────────────
# Async Engine  (used by the running application)
# ──────────────────────────────────────────────

async_engine = create_async_engine(
    _async_url,
    echo=settings.debug,
    pool_pre_ping=True,
    connect_args={"check_same_thread": False},
)

# ──────────────────────────────────────────────
# Async Session Factory
# ──────────────────────────────────────────────

AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# ──────────────────────────────────────────────
# Sync Engine  (used for Alembic migrations & startup table creation)
# ──────────────────────────────────────────────

engine = create_engine(
    _sync_url,
    connect_args={"check_same_thread": False},
    echo=False,
)

# ──────────────────────────────────────────────
# Declarative Base
# ──────────────────────────────────────────────

Base = declarative_base()

# ──────────────────────────────────────────────
# Sync Session Factory (used by existing routers)
# ──────────────────────────────────────────────

from sqlalchemy.orm import sessionmaker, Session  # noqa: E402

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ──────────────────────────────────────────────
# FastAPI Dependency — SYNC session (existing routers)
# ──────────────────────────────────────────────

def get_db():
    """
    Yield a sync database session for existing routers that use
    ``db.query()``, ``db.add()``, ``db.commit()`` patterns.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ──────────────────────────────────────────────
# FastAPI Dependency — ASYNC session (growth copilot routes)
# ──────────────────────────────────────────────

async def get_async_db() -> AsyncSession:
    """
    Yield an async database session for new growth copilot routes.

    Usage:
        @router.get("/items")
        async def read_items(db: AsyncSession = Depends(get_async_db)):
            result = await db.execute(select(Item))
            ...
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
