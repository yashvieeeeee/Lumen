import uuid
from datetime import datetime

from fastapi_users.db import SQLAlchemyBaseUserTableUUID
from fastapi_users_db_sqlalchemy.access_token import SQLAlchemyBaseAccessTokenTableUUID
from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

from .config import Settings

settings = Settings()
engine = create_async_engine(
    settings.database_url.get_secret_value(), echo=False, pool_pre_ping=True
)
session_factory = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


class User(SQLAlchemyBaseUserTableUUID, Base):
    adult_confirmed: Mapped[bool] = mapped_column(Boolean, nullable=False)
    notice_accepted: Mapped[bool] = mapped_column(Boolean, nullable=False)
    storage_enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    consent_revision: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    event_sequence: Mapped[int] = mapped_column(Integer, default=0, nullable=False)


class AccessToken(SQLAlchemyBaseAccessTokenTableUUID, Base):
    pass


class ConsentRevision(Base):
    __tablename__ = "consent_revision"
    __table_args__ = (UniqueConstraint("user_id", "revision"),)
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("user.id", ondelete="CASCADE"), index=True
    )
    revision: Mapped[int] = mapped_column(Integer)
    storage_enabled: Mapped[bool] = mapped_column(Boolean)
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class InputEvent(Base):
    __tablename__ = "input_event"
    __table_args__ = (
        UniqueConstraint("user_id", "idempotency_key"),
        UniqueConstraint("user_id", "sequence"),
    )
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("user.id", ondelete="CASCADE"), index=True
    )
    sequence: Mapped[int] = mapped_column(Integer)
    idempotency_key: Mapped[uuid.UUID] = mapped_column()
    fingerprint: Mapped[str] = mapped_column(String(64))
    source: Mapped[str] = mapped_column(String(10))
    locale: Mapped[str] = mapped_column(String(10))
    consent_revision: Mapped[int] = mapped_column(Integer)
    save_state: Mapped[str] = mapped_column(String(10))
    text: Mapped[str | None] = mapped_column(Text)
    screening: Mapped[dict | None] = mapped_column(JSONB(none_as_null=True))
    mood: Mapped[int | None] = mapped_column(Integer)
    revision: Mapped[int] = mapped_column(Integer, default=1, server_default="1", nullable=False)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    authored_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


async def get_session():
    async with session_factory() as session:
        yield session


async def owner_context(session, user_id):
    # Transaction-local setting: pooled connections cannot retain another user's context.
    await session.execute(
        text("SELECT set_config('lumen.user_id', :owner, true)"), {"owner": str(user_id)}
    )
