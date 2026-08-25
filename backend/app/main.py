from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import List, Optional

import app.models as models
from app.core.database import engine, get_async_db

app = FastAPI(title="DEPORTE Спортивный Интернет-Магазин API (SQLAlchemy Async)")

# НАСТРОЙКА CORS для интеграции с React фронтендом
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# СТРОГО ПО МАКЕТУ ПРЕПОДАВАТЕЛЯ: Создаем структуру таблиц асинхронно через метаданные SQLAlchemy
@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(models.Base.metadata.create_all)

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    name: str
    role: str

# 1. Получение всех товаров каталога из схемы catalog через асинхронный SQLAlchemy Select
@app.get("/products")
async def get_products(db: AsyncSession = Depends(get_async_db)):
    result = await db.execute(select(models.Product))
    return result.scalars().all()

# 2. Авторизация и Автоматическая регистрация пользователей через ORM 2.0 в схему catalog
@app.post("/auth/login", response_model=UserResponse)
async def login(user_data: UserLogin, db: AsyncSession = Depends(get_async_db)):
    if user_data.username.lower() == "admin" and user_data.password == "admin":
        return {"name": "Ника (Админ)", "role": "moderator"}

    result = await db.execute(select(models.User).filter(models.User.username == user_data.username))
    user = result.scalars().first()
    
    if not user:
        display_name = user_data.username.capitalize()
        new_user = models.User(
            username=user_data.username,
            password=user_data.password,
            name=display_name,
            role="user"
        )
        db.add(new_user)
        await db.commit()
        return {"name": display_name, "role": "user"}
    
    if user.password != user_data.password:
        raise HTTPException(status_code=401, detail="Неверный логин или пароль!")
        
    return {"name": user.name, "role": user.role}

# 3. Асинхронное удаление товара модератором из схемы catalog
@app.delete("/products/{product_id}")
async def delete_product(product_id: int, db: AsyncSession = Depends(get_async_db)):
    result = await db.execute(select(models.Product).filter(models.Product.id == product_id))
    product = result.scalars().first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Товар не найден")
        
    await db.execute(delete(models.Product).filter(models.Product.id == product_id))
    await db.commit()
    return {"status": "success", "message": f"Товар {product_id} успешно удален через SQLAlchemy Async"}