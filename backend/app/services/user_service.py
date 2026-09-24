from fastapi import Depends
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.user import User # Твоя SQLAlchemy-модель пользователя
from app.schemas.user import UserCreateRequest
from app.services.exceptions import DuplicateUserError

class UserService:
    def __init__(self, database: AsyncSession):
        self.database = database

    async def create(self, user_data: UserCreateRequest, hashed_password: str) -> User:
        #уникальность email
        if await self.get_by_email(user_data.email):
            raise DuplicateUserError("email", "Этот Email уже зарегистрирован в системе")
            
        #уникальность логина
        if await self.get_by_name(user_data.login):
            raise DuplicateUserError("login", "Этот логин уже занят другим футболистом")

        # Создаем объект модели для PostgreSQL
        user = User(
            email=user_data.email,
            username=user_data.login,
            hashed_password=hashed_password # Сохраняем уже готовый хэш из AuthService!
        )
        print(f"\n[SMS-SERVICE] Пользователь {user.username} оформил быстрый заказ!")
        print(f"[SMS-SERVICE] Сгенерированы доступы -> Логин: {user.email} | Временный пароль: [Цифры телефона из заказа]\n")
        self.database.add(user)
        await self.database.commit()
        await self.database.refresh(user)
        return user

    async def get_all(self, limit: int = 10):
        query = select(User).limit(limit)
        result = await self.database.scalars(query)
        return result.all()

    async def get_by_id(self, user_id: str) -> Optional[User]:
        query = select(User).where(User.id == user_id)
        result = await self.database.scalars(query)
        return result.first()

    async def get_by_email(self, email: str) -> Optional[User]:
        query = select(User).where(User.email == email)
        result = await self.database.scalars(query)
        return result.first()

    async def get_by_name(self, username: str) -> Optional[User]:
        query = select(User).where(User.username == username)
        result = await self.database.scalars(query)
        return result.first()