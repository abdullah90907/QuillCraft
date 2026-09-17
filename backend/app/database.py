import os
import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any

from sqlalchemy import create_engine, Column, String, Text, Integer, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from contextlib import contextmanager

# Read connection string, defaulting to local SQLite
database_url = os.getenv("DATABASE_URL", "sqlite:///./quillcraft.db")

# If database_url starts with "postgres://", replace prefix with "postgresql://" for SQLAlchemy 2.0 compatibility
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

# Handle connection arguments conditionally for SQLite vs PostgreSQL (Neon)
if database_url.startswith("sqlite"):
    engine = create_engine(database_url, connect_args={"check_same_thread": False})
else:
    engine = create_engine(database_url, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class BotModel(Base):
    __tablename__ = "bots"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    personality = Column(String, nullable=False)
    answer_style = Column(String, nullable=False)
    rules = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    messages = relationship("MessageModel", back_populates="bot", cascade="all, delete-orphan")


class MessageModel(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    bot_id = Column(String, ForeignKey("bots.id", ondelete="CASCADE"), nullable=False)
    role = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    confidence = Column(Integer, nullable=True)
    confidence_source = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    bot = relationship("BotModel", back_populates="messages")


@contextmanager
def get_db_session():
    """Provide a transactional scope around a series of operations."""
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def init_db():
    """Initializes all database tables in SQLite or Neon PostgreSQL."""
    Base.metadata.create_all(bind=engine)


def _format_dt(dt: Any) -> Optional[str]:
    if dt is None:
        return None
    if hasattr(dt, "isoformat"):
        return dt.isoformat()
    return str(dt)


# CRUD Helper functions
def save_bot(name: str, role: str, personality: str, answer_style: str, rules: str) -> str:
    bot_id = str(uuid.uuid4())
    with get_db_session() as session:
        bot = BotModel(
            id=bot_id,
            name=name,
            role=role,
            personality=personality,
            answer_style=answer_style,
            rules=rules,
            created_at=datetime.utcnow(),
        )
        session.add(bot)
    return bot_id


def get_bot(bot_id: str) -> Optional[Dict[str, Any]]:
    with get_db_session() as session:
        bot = session.query(BotModel).filter(BotModel.id == bot_id).first()
        if not bot:
            return None
        return {
            "id": bot.id,
            "name": bot.name,
            "role": bot.role,
            "personality": bot.personality,
            "answer_style": bot.answer_style,
            "rules": bot.rules,
            "created_at": _format_dt(bot.created_at),
        }


def get_all_bots() -> List[Dict[str, Any]]:
    with get_db_session() as session:
        bots = session.query(BotModel).order_by(BotModel.created_at.desc()).all()
        return [
            {
                "id": b.id,
                "name": b.name,
                "role": b.role,
                "personality": b.personality,
                "answer_style": b.answer_style,
                "rules": b.rules,
                "created_at": _format_dt(b.created_at),
            }
            for b in bots
        ]


def update_bot(bot_id: str, name: str, role: str, personality: str, answer_style: str, rules: str):
    with get_db_session() as session:
        bot = session.query(BotModel).filter(BotModel.id == bot_id).first()
        if bot:
            bot.name = name
            bot.role = role
            bot.personality = personality
            bot.answer_style = answer_style
            bot.rules = rules


def delete_bot(bot_id: str):
    with get_db_session() as session:
        bot = session.query(BotModel).filter(BotModel.id == bot_id).first()
        if bot:
            session.delete(bot)


def save_message(
    bot_id: str,
    role: str,
    content: str,
    confidence: Optional[int] = None,
    confidence_source: Optional[str] = None,
) -> str:
    message_id = str(uuid.uuid4())
    with get_db_session() as session:
        msg = MessageModel(
            id=message_id,
            bot_id=bot_id,
            role=role,
            content=content,
            confidence=confidence,
            confidence_source=confidence_source,
            timestamp=datetime.utcnow(),
        )
        session.add(msg)
    return message_id


def get_messages_for_bot(bot_id: str) -> List[Dict[str, Any]]:
    with get_db_session() as session:
        messages = (
            session.query(MessageModel)
            .filter(MessageModel.bot_id == bot_id)
            .order_by(MessageModel.timestamp.asc())
            .all()
        )
        return [
            {
                "id": m.id,
                "bot_id": m.bot_id,
                "role": m.role,
                "content": m.content,
                "confidence": m.confidence,
                "confidence_source": m.confidence_source,
                "timestamp": _format_dt(m.timestamp),
            }
            for m in messages
        ]


def clear_messages_for_bot(bot_id: str):
    with get_db_session() as session:
        session.query(MessageModel).filter(MessageModel.bot_id == bot_id).delete()
