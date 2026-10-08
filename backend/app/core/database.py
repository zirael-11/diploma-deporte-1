from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from app.core.config import settings
engine = create_async_engine(str(settings.database_url), echo=False)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False)
async def get_async_db():
    async with SessionLocal() as session:
        yield session
