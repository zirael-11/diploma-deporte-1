from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field

class UserCreateRequest(BaseModel):
    username: str = Field(min_length=1, max_length=100)
    email: str = Field(min_length=3, max_length=255)
    name: Optional[str] = Field(default=None, max_length=255)
    password: str = Field(min_length=4, max_length=128)

class UserLogin(BaseModel):
    username: str = Field(min_length=1)
    password: str

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    name: str
    role: str

class ProductCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    main_category: str
    country: Optional[str] = None
    club: Optional[str] = None
    year: str
    type: str
    price_num: Decimal = Field(ge=0, max_digits=10, decimal_places=2)
    price_str: str
    description: Optional[str] = None
    image: str
    image_hover: str

class ProductUpdate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    price_num: Decimal = Field(ge=0, max_digits=10, decimal_places=2)
    description: Optional[str] = None

class OrderItemRequest(BaseModel):
    product_id: str
    quantity: int = Field(ge=1, le=100)
    size: str = Field(min_length=1, max_length=10)

class OrderCreate(BaseModel):
    full_name: str = Field(min_length=1, max_length=255)
    phone: str = Field(min_length=1, max_length=50)
    address: str = Field(min_length=1, max_length=500)
    items: list[OrderItemRequest] = Field(min_length=1, max_length=100)


class GuestOrderCreate(OrderCreate):
    email: str = Field(min_length=3, max_length=255)
    password: Optional[str] = Field(default=None, min_length=4, max_length=128)

class CartWrite(BaseModel):
    product_id: str
    size: str = Field(min_length=1, max_length=10)
    quantity: int = Field(ge=0, le=100)

class FavoriteWrite(BaseModel):
    product_id: str
    enabled: bool

class ShoppingImport(BaseModel):
    cart: list[OrderItemRequest] = Field(default_factory=list, max_length=100)
    favorites: list[str] = Field(default_factory=list, max_length=500)
