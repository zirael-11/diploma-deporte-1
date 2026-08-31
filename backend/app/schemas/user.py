from pydantic import BaseModel, Field, model_validator
from typing import Optional

# Валидация создания аккаунта
class UserCreateRequest(BaseModel):
    username: str
    email: str 
    name: Optional[str] = None
    password: str = Field(..., min_length=4)
    confirm_password: str

    @model_validator(mode="after")
    def validate_passwords(self):
        if self.password != self.confirm_password:
            raise ValueError("Пароли не совпадают!")
        return self

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    name: str
    role: str

class ProductCreate(BaseModel):
    title: str
    main_category: str
    country: Optional[str] = None
    club: Optional[str] = None
    year: str
    type: str
    price_num: int
    price_str: str
    description: Optional[str] = None
    image: str
    image_hover: str