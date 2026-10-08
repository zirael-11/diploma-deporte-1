"""Deterministic sample products using the images shipped with the project."""
import uuid
from sqlalchemy import select, func
from app.models import Product

ASSETS = {
    "Испания": [("spainfuria2026.png", "spain2furia2026.png"), ("spainflores.png", "spainflores2.png"), ("spaindelafuente.png", "spaindelafuente2.png"), ("spainrukav.png", "spainrukav2.png")],
    "Германия": [("germanhome2026.png", "german2home2026.png"), ("germangost2026.png", "german2gost2026.png"), ("germantrenirovka26.png", "german2trenirovka26.png"), ("germancostume2024.png", "german2costume2024.png")],
    "Италия": [("italysbor2026.png", "italy2sbor2026.png"), ("italy2026.png", "italy20262.png"), ("italyvetrovka2024.png", "italy2vetrovka2024.png"), ("italyspets2025.png", "italy2spets2025.png")],
    "Англия": [("englandhome2026.png", "england2home2026.png"), ("englandguest2026.png", "england2guest2026.png"), ("englandcostume.png", "england2costume.png"), ("englandspecial.png", "england2special.png")],
    "Россия": [("russiaussr.png", "russiaussr2.png")] * 4,
}
TYPES = ["Домашняя", "Гостевая", "Тренировочная", "Специальная коллекция"]

def demo_products():
    for country, images in ASSETS.items():
        for type_index, product_type in enumerate(TYPES):
            for year in range(2021, 2027):
                title = f"{product_type} форма сборной {country} ({year})"
                price = 3900 + type_index * 500 + (year - 2021) * 100
                image, hover = images[type_index]
                yield dict(id=str(uuid.uuid5(uuid.NAMESPACE_URL, 'deporte-demo/'+title)), title=title,
                           main_category="Форма сборных", country=country, club=None, year=str(year),
                           type=product_type, price_num=price, price_str=f"{price:,}".replace(',', ' ') + " ₽",
                           description=f"Демонстрационная карточка футбольной экипировки: {country}, {product_type.lower()}, сезон {year}. Изображение показывает тип комплекта.",
                           image=image, image_hover=hover)

def fill_catalog(connection, minimum=120):
    table=Product.__table__
    count=connection.scalar(select(func.count()).select_from(table))
    existing=set(connection.scalars(select(table.c.id)))
    for product in demo_products():
        if count >= minimum: break
        if product['id'] in existing: continue
        connection.execute(table.insert().values(**product))
        existing.add(product['id']); count += 1
    return count
