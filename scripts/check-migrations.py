"""Reversible migration check restricted to an empty, explicitly named local database."""

import asyncio
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "services/api"))
import asyncpg

from lumen_api.config import Settings, local_database_urls

CHECK_DATABASE = "lumen_migration_check"


async def main():
    config = Settings()
    admin, _ = local_database_urls(config)
    connection = await asyncpg.connect(
        user=admin.username,
        password=admin.password,
        host=admin.host,
        port=admin.port,
        database="postgres",
    )
    try:
        if not await connection.fetchval(
            "SELECT 1 FROM pg_database WHERE datname=$1", CHECK_DATABASE
        ):
            await connection.execute(f"CREATE DATABASE {CHECK_DATABASE} OWNER lumen_admin")
    finally:
        await connection.close()
    connection = await asyncpg.connect(
        user=admin.username,
        password=admin.password,
        host=admin.host,
        port=admin.port,
        database=CHECK_DATABASE,
    )
    try:
        if await connection.fetchval(
            "SELECT to_regclass('public.user')"
        ) and await connection.fetchval('SELECT count(*) FROM "user"'):
            raise RuntimeError("Refusing a migration downgrade in a database containing accounts")
    finally:
        await connection.close()
    environment = os.environ.copy()
    environment["DATABASE_MIGRATION_URL"] = admin.set(database=CHECK_DATABASE).render_as_string(
        hide_password=False
    )
    for direction, target in (("upgrade", "head"), ("downgrade", "base"), ("upgrade", "head")):
        process = await asyncio.create_subprocess_exec(
            sys.executable,
            "-m",
            "alembic",
            direction,
            target,
            cwd=Path(__file__).resolve().parents[1] / "services/api",
            env=environment,
        )
        if await process.wait() != 0:
            raise RuntimeError("Migration check failed")
    print("Empty local migration-check database: UP / DOWN / UP passed.")


asyncio.run(main())
