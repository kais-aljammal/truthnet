from __future__ import annotations

from datetime import date, datetime, timezone

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String, Text, create_engine, inspect, text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship, sessionmaker

from .config import DATABASE_URL

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
    pool_pre_ping=True,
)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    subscription_tier: Mapped[str] = mapped_column(String(32), default="free", nullable=False)
    subscription_status: Mapped[str] = mapped_column(String(32), default="active", nullable=False)
    stripe_customer_id: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)
    stripe_subscription_id: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)
    subscription_period_end: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    fact_checks: Mapped[list["FactCheck"]] = relationship(back_populates="user")
    usage_days: Mapped[list["UsageDaily"]] = relationship(back_populates="user")


class UsageDaily(Base):
    __tablename__ = "usage_daily"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True)
    usage_date: Mapped[date] = mapped_column(Date, primary_key=True)
    count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    user: Mapped[User] = relationship(back_populates="usage_days")


class FactCheck(Base):
    __tablename__ = "fact_checks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)
    claim_snippet: Mapped[str] = mapped_column(String(500), nullable=False)
    verdict: Mapped[str] = mapped_column(String(32), nullable=False)
    confidence: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(16), default="completed", nullable=False)
    response_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        index=True,
        nullable=False,
    )

    user: Mapped[User] = relationship(back_populates="fact_checks")


_USER_COLUMN_MIGRATIONS = [
    ("subscription_tier", "VARCHAR(32) DEFAULT 'free'"),
    ("subscription_status", "VARCHAR(32) DEFAULT 'active'"),
    ("stripe_customer_id", "VARCHAR(255)"),
    ("stripe_subscription_id", "VARCHAR(255)"),
    ("subscription_period_end", "DATETIME"),
]

_FACTCHECK_COLUMN_MIGRATIONS = [
    ("status", "VARCHAR(16) DEFAULT 'completed'"),
    ("response_json", "TEXT"),
]


def _sqlite_columns(conn, table: str) -> set[str]:
    rows = conn.execute(text(f"PRAGMA table_info({table})")).fetchall()
    return {row[1] for row in rows}


def _migrate_sqlite_columns(conn, table: str, migrations: list[tuple[str, str]]) -> None:
    existing = _sqlite_columns(conn, table)
    for name, ddl in migrations:
        if name not in existing:
            conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {name} {ddl}"))


def migrate_db() -> None:
    """Create new tables and add columns on existing SQLite/Postgres dev DBs."""
    Base.metadata.create_all(bind=engine)
    insp = inspect(engine)
    if not insp.has_table("users"):
        return

    with engine.begin() as conn:
        if engine.dialect.name == "sqlite":
            _migrate_sqlite_columns(conn, "users", _USER_COLUMN_MIGRATIONS)
            if insp.has_table("fact_checks"):
                _migrate_sqlite_columns(conn, "fact_checks", _FACTCHECK_COLUMN_MIGRATIONS)
        else:
            for name, ddl in _USER_COLUMN_MIGRATIONS:
                try:
                    conn.execute(text(f"ALTER TABLE users ADD COLUMN IF NOT EXISTS {name} {ddl}"))
                except Exception:
                    pass
            for name, ddl in _FACTCHECK_COLUMN_MIGRATIONS:
                try:
                    conn.execute(text(f"ALTER TABLE fact_checks ADD COLUMN IF NOT EXISTS {name} {ddl}"))
                except Exception:
                    pass


def init_db() -> None:
    migrate_db()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
