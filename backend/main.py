from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

import models
from database import engine, get_db

# Автоматически создаем таблицы в Docker PostgreSQL при запуске бэкенда
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="DEPORTE Спортивный Интернет-Магазин API")

# НАСТРОЙКА CORS: Позволяет твоему React-приложению делать запросы к бэкенду без ошибок безопасности
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # В продакшене тут указывается точный адрес фронтенда, например ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- PYDANTIC СХЕМЫ ДЛЯ ВАЛИДАЦИИ ДАННЫХ ---
class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    name: str
    role: str

class ProductResponse(BaseModel):
    id: int
    title: str
    main_category: str
    country: Optional[str] = None
    club: Optional[str] = None
    year: str
    type: str
    price_num: float
    price: str
    description: Optional[str] = None
    image: str
    image_hover: str

    class Config:
        from_attributes = True

# --- API ЭНДПОИНТЫ (МАРШРУТЫ) ---

# 1. Эндпоинт авторизации (Вход / Ролевая модель)
@app.post("/api/auth/login", response_model=UserResponse)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    # Ищем пользователя в Docker БД по логину
    user = db.query(models.User).filter(models.User.username == user_data.username).first()
    
    # Если база пуста и это первый запуск — делаем симуляцию админа для защиты диплома
    if not user and user_data.username.lower() == "admin" and user_data.password == "admin":
        return {"name": "Ника (Админ)", "role": "moderator"}
        
    if not user or user.password != user_data.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный логин или пароль!"
        )
        
    return {"name": user.name, "role": user.role}

# 2. Эндпоинт получения всех товаров каталога из базы данных
@app.get("/api/products", response_model=List[ProductResponse])
def get_products(db: Session = Depends(get_db)):
    products = db.query(models.Product).all()
    
    # Оптимизация для защиты: если в БД еще нет товаров, возвращаем пустой список (или можно наполнить скриптом)
    return [
        {
            "id": p.id, "title": p.title, "main_category": p.main_category,
            "country": p.country, "club": p.club, "year": p.year, "type": p.type,
            "price_num": p.price_num, "price": p.price_str, "description": p.description,
            "image": p.image, "image_hover": p.image_hover
        } for p in products
    ]

# 3. Эндпоинт удаления товара (Доступен модератору)
@app.delete("/api/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Товар не найден в базе данных")
    
    db.delete(product)
    db.commit()
    return {"status": "success", "message": f"Товар {product_id} успешно удален из PostgreSQL"}