from app.services.user_service import UserService
# Импортируем твои Pydantic-схемы для пользователей
from app.schemas.user import UserCreateRequest, UserLoginRequest
from app.services.exceptions import AuthenticationError
from pwdlib import PasswordHash # Подключаем pwdlib со скриншота №3

pwd_context = PasswordHash.recommended()

class AuthService:
    def __init__(self, user_service: UserService):
        self.user_service = user_service

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

    def hash_password(self, password: str) -> str:
        return pwd_context.hash(password)

    async def create_user(self, user_data: UserCreateRequest):
        # Хэшируем сырой пароль перед записью в PostgreSQL!
        hashed_password = self.hash_password(user_data.password)
        # Передаем данные в UserService, подставляя зашифрованный пароль
        return await self.user_service.create(user_data, hashed_password)

    async def authenticate_user(self, login_data: UserLoginRequest):
        # Поиск пользователя по email в базе
        user = await self.user_service.get_by_email(login_data.email)
        if not user:
            raise AuthenticationError("Неверный email или пароль")
            
        # Проверяем хэш пароля
        if not self.verify_password(login_data.password, user.hashed_password):
            raise AuthenticationError("Неверный email или пароль")
            
        return user