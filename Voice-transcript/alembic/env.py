import asyncio
from logging.config import fileConfig

from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import pool
from alembic import context
from sqlmodel import SQLModel

# Import your settings
from app.core.config import settings

# Import ALL your models so Alembic can detect them
from app.models.base import (
    Organization, User, Contact, Call, CallAnalysis,
    Campaign, CampaignSettings, Lead,
    LeadComment, LeadStatusHistory,
)

# Alembic config object
config = context.config

# Set the DB URL from your settings
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

# Setup logging from alembic.ini
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# This tells Alembic what tables to compare against
target_metadata = SQLModel.metadata


# ── OFFLINE MODE (generates SQL without connecting) ──────────────────────────

def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


# ── ONLINE MODE (connects and runs migrations) ────────────────────────────────

def do_run_migrations(connection):
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,       # detects column type changes
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    engine = create_async_engine(settings.DATABASE_URL, poolclass=pool.NullPool)

    async with engine.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await engine.dispose()


# ── ENTRY POINT ───────────────────────────────────────────────────────────────

if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())