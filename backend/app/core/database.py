from sqlalchemy.ext.asyncio import (
    create_async_engine,
    AsyncSession
)

from sqlalchemy.orm import (
    sessionmaker,
    declarative_base
)

from app.core.config import settings

# ==========================================
# UPDATED CLOUD-OPTIMIZED ENGINE
# ==========================================
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=True,
    pool_pre_ping=True,  # Automatically tests connection health before pinging
    connect_args={
        "command_timeout": 60, # Prevents silent network drops in the cloud
    }
)

AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session