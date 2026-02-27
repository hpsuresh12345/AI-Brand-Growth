"""
Model registry — import all models here so that
Base.metadata.create_all() discovers every table.
"""

from app.models.lead import Lead  # noqa: F401
from app.models.user import User  # noqa: F401
from app.models.note import Note  # noqa: F401
from app.models.activity_log import ActivityLog  # noqa: F401
from app.models.brand_profile import BrandProfile  # noqa: F401
from app.models.content_piece import ContentPiece  # noqa: F401
from app.models.strategy_state import StrategyState  # noqa: F401
from app.models.agent_memory import AgentMemory  # noqa: F401
