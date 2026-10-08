import uuid
import enum
from datetime import datetime
from decimal import Decimal
from typing import Optional
from sqlalchemy import JSON, String, Numeric, DateTime, func, CheckConstraint,ForeignKey, UniqueConstraint
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

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

    # Строковые ID совместимы с существующей базой; новые значения — UUID в виде строк.
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    main_category: Mapped[str] = mapped_column(String(100), nullable=False)
    country: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    club: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    year: Mapped[str] = mapped_column(String(10), nullable=False)
    type: Mapped[str] = mapped_column(String(100), nullable=False)

    #Цена через точный финансовый тип Decimal
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

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
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
    __table_args__ = (UniqueConstraint("user_id", "product_id", "selected_size", name="uq_cart_user_product_size"), CheckConstraint("quantity > 0", name="ck_cart_quantity_positive"), {"schema": "catalog"})

    # Строковый первичный ключ
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))

    # Внешние ключи соответствуют строковым ID пользователей и товаров
    user_id: Mapped[str] = mapped_column(ForeignKey("catalog.users.id", ondelete="CASCADE"), nullable=False)
    product_id: Mapped[str] = mapped_column(ForeignKey("catalog.products.id", ondelete="CASCADE"), nullable=False)

    # Обычные поля для количества и размера джерси маркетплейса DEPORTE
    quantity: Mapped[int] = mapped_column(server_default="1", default=1, nullable=False)
    selected_size: Mapped[str] = mapped_column(String(10), server_default="M", default="M", nullable=False)

class Order(Base):
    __tablename__ = "orders"
    __table_args__ = {"schema": "catalog"}
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(ForeignKey("catalog.users.id", ondelete="CASCADE"))
    full_name: Mapped[str] = mapped_column(String(255))
    phone: Mapped[str] = mapped_column(String(50))
    address: Mapped[str] = mapped_column(String(500))
    items: Mapped[list] = mapped_column(JSON)
    total: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Favorite(Base):
    __tablename__ = "favorites"
    __table_args__ = (UniqueConstraint("user_id", "product_id", name="uq_favorites_user_product"), {"schema": "catalog"})
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(ForeignKey("catalog.users.id", ondelete="CASCADE"), nullable=False)
    product_id: Mapped[str] = mapped_column(ForeignKey("catalog.products.id", ondelete="CASCADE"), nullable=False)
