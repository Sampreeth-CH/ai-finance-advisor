import asyncio

from app.core.database import engine
from app.core.database import Base

from app.models.transaction import Transaction
from app.models.user import User


async def init_models():

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


asyncio.run(init_models())