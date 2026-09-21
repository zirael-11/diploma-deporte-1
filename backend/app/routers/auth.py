from fastapi import APIRouter, status, Depends, Response
# Импортируем схемы запросов и ответов
from app.schemas.user import UserCreateRequest, UserLoginRequest, UserResponse
# Импортируем наши фабрики зависимостей
from app.services.services import get_auth_service, get_session_service
from app.services.auth_service import AuthService
from app.services.session_service import SessionService

router = APIRouter(prefix="/auth", tags=["Authentication"])

# 1. ЭНДПОИНТ РЕГИСТРАЦИИ ПОЛЬЗОВАТЕЛЯ
@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreateRequest,
    auth_service: AuthService = Depends(get_auth_service)
):
    # Вызываем слой трехслойной бизнес-логики для хэширования и записи в PostgreSQL
    new_user = await auth_service.create_user(user_data)
    return new_user

# 2. ЭНДПОИНТ ВХОДА (ЛОГИНА) С ДЕСАНТОМ СЕССИИ В REDIS
@router.post("/login")
async def login(
    login_data: UserLoginRequest,
    response: Response,
    auth_service: AuthService = Depends(get_auth_service),
    session_service: SessionService = Depends(get_session_service)
):
    # Проверяем email и Argon2 хэш пароля в базе данных
    user = await auth_service.authenticate_user(login_data)
    
    # Генерируем сессию в оперативной памяти Redis
    session_id = await session_service.create_session(user_id=str(user.id))
    
    # Устанавливаем куку с сессией в браузер покупателя для безопасности
    response.set_cookie(key="session_id", value=session_id, httponly=True)
    
    return {
        "status": "success",
        "message": "Успешная авторизация в магазине DEPORTE",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email
        }
    }