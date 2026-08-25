from sqlalchemy import String, Numeric, Integer, TEXT
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base
from decimal import Decimal

class User(Base):
    __tablename__ = "users"
    __table_args__ = {"schema": "catalog"} # Направили строго в схему catalog

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(50), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    role: Mapped[str] = mapped_column(String(20), server_default="user")

class Product(Base):
    __tablename__ = "products"
    __table_args__ = {"schema": "catalog"} # Направили строго в схему catalog

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    main_category: Mapped[str] = mapped_column(String(100), nullable=False)
    country: Mapped[str] = mapped_column(String(100), nullable=True)
    club: Mapped[str] = mapped_column(String(100), nullable=True)
    year: Mapped[str] = mapped_column(String(10), nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    price_num: Mapped[Decimal] = mapped_column(Numeric(precision=10, scale=2), nullable=False)
    price_str: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[str] = mapped_column(TEXT, nullable=True)
    image: Mapped[str] = mapped_column(TEXT, nullable=False)
    image_hover: Mapped[str] = mapped_column(TEXT, nullable=False)