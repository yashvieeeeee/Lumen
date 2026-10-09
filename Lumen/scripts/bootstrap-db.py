"""Provision only Lumen's own local roles and databases; never reset an existing database."""

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "services/api"))
import asyncpg

from lumen_api.config import Settings, local_database_urls


async def main():
    config = Settings()
    admin, app = local_database_urls(config)
    connection = await asyncpg.connect(
        user=admin.username,
        password=admin.password,
        host=admin.host,
        port=admin.port,
        database="postgres",
    )
    try:
        if not await connection.fetchval("SELECT 1 FROM pg_roles WHERE rolname='lumen_app'"):
            statement = await connection.fetchval(
                "SELECT format('CREATE ROLE lumen_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS PASSWORD %L', $1::text)",
                app.password,
            )
            await connection.execute(statement)
        for database in ("lumen", "lumen_test"):
            if not await connection.fetchval(
                "SELECT 1 FROM pg_database WHERE datname=$1", database
            ):
                await connection.execute(f"CREATE DATABASE {database} OWNER lumen_admin")
            await connection.execute(f"REVOKE ALL ON DATABASE {database} FROM PUBLIC")
            await connection.execute(f"GRANT CONNECT ON DATABASE {database} TO lumen_app")
    finally:
        await connection.close()
    for database in ("lumen", "lumen_test"):
        connection = await asyncpg.connect(
            user=admin.username,
            password=admin.password,
            host=admin.host,
            port=admin.port,
            database=database,
        )
        try:
            await connection.execute("REVOKE CREATE ON SCHEMA public FROM PUBLIC")
            await connection.execute("GRANT USAGE ON SCHEMA public TO lumen_app")
        finally:
            await connection.close()
    print("Lumen application role and isolated databases ready.")


if __name__ == "__main__":
    asyncio.run(main())
