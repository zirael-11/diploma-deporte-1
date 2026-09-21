from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db          # Твой генератор сессий PostgreSQL
from app.core.redis_manager import get_redis  # Функция получения клиента Redis
from app.services.user_service import UserService
from app.services.auth_service import AuthService
from app.services.session_service import SessionService

# 1. Фабрика для сервиса пользователей (работает с СУБД PostgreSQL)
def get_user_service(database: AsyncSession = Depends(get_db)) -> UserService:
    return UserService(database)

# 2. Фабрика для сервиса авторизации (принимает сервис пользователей и pwdlib)
def get_auth_service(user_service: UserService = Depends(get_user_service)) -> AuthService:
    return AuthService(user_service)

# 3. Фабрика для сессий Redis (будет управлять быстрыми токенами в ОЗУ)
def get_session_service(redis_client = Depends(get_redis)) -> SessionService:
    return SessionService(redis_client)