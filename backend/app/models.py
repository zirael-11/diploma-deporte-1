import uuid
import enum
from datetime import datetime
from decimal import Decimal
from typing import Optional
from sqlalchemy import String, Numeric, DateTime, func, CheckConstraint,ForeignKey
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID as PG_UUID

class Base(DeclarativeBase):
    pass

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    USER = "user"
    GUEST = "guest"

# --- МОДЕЛЬ ТОВАРА---
class Product(Base):
    __tablename__ = "products"
    __table_args__ = (
        CheckConstraint("price_num >= 0", name="check_products_price_positive"),
        {"schema": "catalog"}
    )

    #Первичный ключ на базе UUID
    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        server_default=func.gen_random_uuid() # База данных сама генерирует ключ!
)
    
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    main_category: Mapped[str] = mapped_column(String(100), nullable=False)
    country: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    club: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    year: Mapped[str] = mapped_column(String(10), nullable=False)
    type: Mapped[str] = mapped_column(String(100), nullable=False)
    
    #Цена через точный финансовый тип Decimal (Numeric 10,2)
    price_num: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    price_str: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
    image: Mapped[str] = mapped_column(String(255), nullable=False)
    image_hover: Mapped[str] = mapped_column(String(255), nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    
    # Внедрено из класса: Поле автоматического обновления даты изменения товара
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )


# ---МОДЕЛЬ ПОЛЬЗОВАТЕЛЯ ---
class User(Base):
    __tablename__ = "users"
    __table_args__ = ({"schema": "catalog"})

    id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    username: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(String(50), server_default=UserRole.USER.value, nullable=False)
    
    is_active: Mapped[bool] = mapped_column(server_default="true", nullable=False)
    is_verified: Mapped[bool] = mapped_column(server_default="false", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    last_login: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)


class CartItem(Base):
    __tablename__ = "cart_items"
    __table_args__ = {"schema": "catalog"}  # Складываем в схему каталога

    # Используем Mapped[uuid.UUID]
    id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Внешние ключи связываем с типами UUID твоих таблиц пользователей и товаров
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("catalog.users.id", ondelete="CASCADE"), nullable=False)
    product_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("catalog.products.id", ondelete="CASCADE"), nullable=False)
    
    # Обычные поля для количества и размера джерси маркетплейса DEPORTE
    quantity: Mapped[int] = mapped_column(server_default="1", default=1, nullable=False)
    selected_size: Mapped[str] = mapped_column(String(10), server_default="M", default="M", nullable=False)