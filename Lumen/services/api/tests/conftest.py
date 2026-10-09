import os
import subprocess
import sys
import uuid
from pathlib import Path

import httpx
import pytest_asyncio

from lumen_api.config import Settings, local_database_urls

# These checks always target Lumen's dedicated test database, never the application database.
config = Settings()
admin_url, app_url = local_database_urls(config)
for name, url in (("DATABASE_URL", app_url), ("DATABASE_MIGRATION_URL", admin_url)):
    os.environ[name] = url.set(database="lumen_test").render_as_string(hide_password=False)
subprocess.run(
    [sys.executable, "-m", "alembic", "upgrade", "head"],
    cwd=Path(__file__).resolve().parents[1],
    check=True,
    capture_output=True,
)

from lumen_api.db import engine
from lumen_api.main import app


@pytest_asyncio.fixture
async def client():
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app, client=(uuid.uuid4().hex, 123)),
        base_url="http://localhost:8060",
        headers={"Origin": "http://localhost:3180"},
    ) as value:
        yield value


@pytest_asyncio.fixture(scope="session", autouse=True)
async def dispose_connections():
    yield
    await engine.dispose()
