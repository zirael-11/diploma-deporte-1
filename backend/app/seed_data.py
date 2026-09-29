import asyncio
import random
import uuid
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from core.config import settings
from models import Product

# Реалистичная карта соответствия клубов и их стран для фильтрации
CLUB_MAPPING = {
    "Испания": ["Реал Мадрид", "Барселона", "Севилья", "Атлетико Мадрид", "Жирона"],
    "Англия": ["Арсенал", "Челси", "Манчестер Юнайтед", "Манчестер Сити"],
    "Франция": ["ПСЖ", "Монако", "Лион"],
    "Германия": ["Боруссия Дортмунд", "Бавария", "Унион Берлин"],
    "Италия": ["Милан", "Ювентус", "Интер", "Парма"],
    "Россия": ["Зенит", "Спартак", "ЦСКА", "Локомотив"]
}

COUNTRIES = list(CLUB_MAPPING.keys())
TYPES = ["Домашняя", "Гостевая", "Ретро", "Специальная", "Тренировочная"]
CATEGORIES = ["Форма сборных", "Форма клубов"]

async def seed_products():
    # 1. Создаем движок подключения напрямую к PostgreSQL в Докере
    engine = create_async_engine("postgresql+asyncpg://nika:admin@deporte-database:5432/deporte_shop", echo=True)
    
    # 2. Создаем фабрику асинхронных сессий
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    print("Запуск масштабной генерации 120 товаров для DEPORTE...")
    
    async with async_session() as session:
        for i in range(1, 121):
            category = random.choice(CATEGORIES)
            country = random.choice(COUNTRIES)
            form_type = random.choice(TYPES)
            year = str(random.randint(2018, 2026))
            price = random.randint(3900, 8900)
            
            # Если это клубная форма, берем правильный клуб для этой страны
            if category == "Форма клубов":
                club = random.choice(CLUB_MAPPING[country])
                title = f"{form_type} форма ФК {club} ({year})"
                image_prefix = f"club_{country.lower()}"
            else:
                club = None
                title = f"{form_type} форма сборной {country} ({year})"
                image_prefix = f"sbor_{country.lower()}"
            
            product = Product(
                id=str(uuid.uuid4()),
                title=title,
                main_category=category,
                country=country,
                club=club,
                year=year,
                type=form_type,
                price_num=price,
                price_str=f"{price:,.0f}".replace(",", " ") + " ₽",
                description=f"Премиальная экипировка. Категория: {category}. Сезон: {year}.",
                image=f"{image_prefix}.png",
                image_hover=f"{image_prefix}2.png"
            )
            session.add(product)
        
        await session.commit()
    print(" В PostgreSQL успешно записано 120 товаров с клубами и сборными!")

if __name__ == "__main__":
    asyncio.run(seed_products())