"""
Database service re-exporting SQLAlchemy-based database module.
Supports both SQLite (local development) and Neon PostgreSQL (production).
"""

from ..database import (
    engine,
    Base,
    SessionLocal,
    BotModel,
    MessageModel,
    init_db,
    save_bot,
    get_bot,
    get_all_bots,
    update_bot,
    delete_bot,
    save_message,
    get_messages_for_bot,
    clear_messages_for_bot,
    get_db_session,
)

__all__ = [
    "engine",
    "Base",
    "SessionLocal",
    "BotModel",
    "MessageModel",
    "init_db",
    "save_bot",
    "get_bot",
    "get_all_bots",
    "update_bot",
    "delete_bot",
    "save_message",
    "get_messages_for_bot",
    "clear_messages_for_bot",
    "get_db_session",
]
