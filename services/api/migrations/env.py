import asyncio

from alembic import context
from sqlalchemy.ext.asyncio import create_async_engine

from lumen_api.config import Settings


def run(connection):
    context.configure(connection=connection, target_metadata=None)
    with context.begin_transaction():
        context.run_migrations()


async def migrate():
    engine = create_async_engine(Settings().database_migration_url.get_secret_value(), echo=False)
    async with engine.connect() as connection:
        await connection.run_sync(run)
    await engine.dispose()


asyncio.run(migrate())
