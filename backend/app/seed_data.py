import asyncio
from app.core.database import engine
from app.catalog_seed import fill_catalog
async def run():
    async with engine.begin() as connection:
        count=await connection.run_sync(fill_catalog)
    print(f"Каталог содержит {count} товаров. Существующие карточки сохранены.")
if __name__ == '__main__':
    asyncio.run(run())
