from sqlalchemy import Column, Integer, String, Float, ForeignKey
from database import Base

# ТАБЛИЦА ПОЛЬЗОВАТЕЛЕЙ (Для авторизации)
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False) # В реальном продакшене тут должен быть хэш
    name = Column(String, nullable=False)
    role = Column(String, default="user") # 'user' или 'moderator'

# ТАБЛИЦА ТОВАРОВ КАТАЛОГА
class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    main_category = Column(String, nullable=False) # Форма сборных, Форма по клубам, Бутсы, Мячи
    country = Column(String, nullable=True)
    club = Column(String, nullable=True)
    year = Column(String, nullable=False)
    type = Column(String, nullable=False) # Домашняя, Гостевая...
    price_num = Column(Float, nullable=False)
    price_str = Column(String, nullable=False) # Форматированная строка, например "4 500 ₽"
    description = Column(String, nullable=True)
    image = Column(String, nullable=False)
    image_hover = Column(String, nullable=False)