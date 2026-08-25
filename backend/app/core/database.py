from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

# Создаем асинхронный движок SQLAlchemy
engine = create_async_engine(
    str(settings.database_url), 
    echo=settings.debug
)

# Асинхронная фабрика сессий
SessionLocal = async_sessionmaker(
    bind=engine, 
    autocommit=False, 
    autoflush=False, 
    expire_on_commit=False
)

# Базовый декларативный класс
class Base(DeclarativeBase):
    pass

# Генератор асинхронных сессий для зависимостей Depends
async def get_async_db():
    async with SessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()