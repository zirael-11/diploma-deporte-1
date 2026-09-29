from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import uuid
import app.models as models
from app.models import UserRole
from sqlalchemy import select, delete, text
from app.core.database import engine, get_async_db
from app import schemas
import redis
from contextlib import asynccontextmanager


# ИСПРАВЛЕНО: Импортируем все валидационные схемы из папки schemas по канонам преподавателя
from app.schemas.user import UserCreateRequest, UserLogin, UserResponse, ProductCreate

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Автоматически создаем недостающие таблицы при старте Docker-контейнера
    async with engine.begin() as conn:
        await conn.execute(text("CREATE SCHEMA IF NOT EXISTS catalog;"))
        await conn.run_sync(models.Base.metadata.create_all)
    yield

# Инициализируем приложение, передавая созданный lifespan-менеджер
app = FastAPI(
    title="DEPORTE Спортивный Интернет-Магазин API (SQLAlchemy Async)",
    lifespan=lifespan
)

# Настройка CORS-политики для бесперебойной связи с React-фронтендом
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        # Принудительно создаем схему catalog, чтобы SQLAlchemy не падала с ошибкой 500!
        await conn.execute(text("CREATE SCHEMA IF NOT EXISTS catalog;"))
        # Спокойно создаем таблицы со всеми колонками (включая created_at)
        await conn.run_sync(models.Base.metadata.create_all)


# --- ЭНДПОИНТЫ API ---

@app.get("/products")
async def get_products(db: AsyncSession = Depends(get_async_db)):
    result = await db.execute(select(models.Product))
    return result.scalars().all()

@app.post("/products", status_code=status.HTTP_201_CREATED)
async def create_product(product_data: dict, db: AsyncSession = Depends(get_async_db)):
    try:
        new_product = models.Product(
            id=str(uuid.uuid4()),
            title=product_data.get("title"),
            main_category=product_data.get("main_category"),
            country=product_data.get("country"),
            club=product_data.get("club"),
            year=product_data.get("year"),
            type=product_data.get("type"),
            price_num=int(product_data.get("price_num", 0)),
            price_str=product_data.get("price_str"),
            description=product_data.get("description"),
            image=product_data.get("image"),
            image_hover=product_data.get("image_hover")
        )
        db.add(new_product)
        await db.commit()
        await db.refresh(new_product)
        return new_product
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
        
        return {"status": "success", "message": "Товар успешно добавлен в PostgreSQL", "product_id": new_product.id}
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Ошибка базы данных: {str(e)}")

@app.post("/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreateRequest, db: AsyncSession = Depends(get_async_db)):
    result = await db.execute(select(models.User).filter(models.User.username == user_data.username))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Пользователь с таким именем уже существует!")
    
    display_name = user_data.name if user_data.name else user_data.username.capitalize()
    
    new_user = models.User(
        username=user_data.username,
        password=user_data.password,
        name=display_name,
        role=UserRole.USER.value
    )
    db.add(new_user)
    await db.commit()
    return {"name": display_name, "role": UserRole.USER.value}

@app.post("/auth/login", response_model=UserResponse)
async def login(user_data: UserLogin, db: AsyncSession = Depends(get_async_db)):
    if user_data.username.lower() == "admin" and user_data.password == "admin":
        return {"name": "Ника (Админ)", "role": UserRole.ADMIN.value}
        
    result = await db.execute(select(models.User).filter(models.User.username == user_data.username))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден! Пожалуйста, зарегистрируйтесь.")
        
    if user.password != user_data.password:
        raise HTTPException(status_code=401, detail="Неверный логин или пароль!")
        
    return {"name": user.name, "role": user.role}

@app.delete("/products/{product_id}")
async def delete_product(product_id: uuid.UUID, db: AsyncSession = Depends(get_async_db)): # ИСПРАВЛЕНО: тип uuid.UUID
    result = await db.execute(select(models.Product).filter(models.Product.id == product_id))
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Товар не найден")
    await db.execute(delete(models.Product).filter(models.Product.id == product_id))
    await db.commit()
    return {"status": "success", "message": f"Товар {product_id} успешно удален через SQLAlchemy Async"}

import json
from fastapi import HTTPException, status

@app.post("/api/cart/add")
async def add_to_cart(cart_data: dict, db: AsyncSession = Depends(get_async_db)):
    user_id = cart_data.get("user_id") # Проверяем, авторизован ли пользователь
    product_id = cart_data.get("product_id")
    size = cart_data.get("selected_size", "M")
    
    if not product_id:
        raise HTTPException(status_code=400, detail="Product ID required")

    # ВАРИАНТ 1: ПОЛЬЗОВАТЕЛЬ АВТОРИЗОВАН -> ПИШЕМ В POSTGRESQL
    if user_id:
        try:
            # Ищем, нет ли уже такого товара у этого юзера в корзине
            result = await db.execute(
                select(models.CartItem).where(
                    models.CartItem.user_id == user_id, 
                    models.CartItem.product_id == product_id,
                    models.CartItem.selected_size == size
                )
            )
            existing_item = result.scalar_one_or_none()
            
            if existing_item:
                existing_item.quantity += 1
            else:
                new_item = models.CartItem(
                    id=str(uuid.uuid4()),
                    user_id=user_id,
                    product_id=product_id,
                    quantity=1,
                    selected_size=size
                )
                db.add(new_item)
                
            await db.commit()
            return {"status": "success", "storage": "postgresql", "message": "Добавлено в Postgres"}
        except Exception as e:
            await db.rollback()
            raise HTTPException(status_code=500, detail=str(e))

    #ВАРИАНТ 2: ГОСТЬ (АНОНИМ) -> ПИШЕМ В REDIS
    else:
        # В качестве ключа используем временный токен сессии гостя (например, guest_session_123)
        session_id = cart_data.get("session_id", "guest_anonymous_session")
        redis_key = f"cart:{session_id}"
        
        # Достаем текущую корзину гостя из оперативной памяти Redis
        current_cart_raw = redis_client.get(redis_key)
        current_cart = json.loads(current_cart_raw) if current_cart_raw else []
        
        # Проверяем, есть ли товар в массиве Redis
        item_found = False
        for item in current_cart:
            if item["product_id"] == product_id and item["selected_size"] == size:
                item["quantity"] += 1
                item_found = True
                break
                
        if not item_found:
            current_cart.append({"product_id": product_id, "quantity": 1, "selected_size": size})
            
        # Сохраняем обновленный массив обратно в Redis и ставим TTL 24 часа (время жизни корзины гостя)
        redis_client.setex(redis_key, 86400, json.dumps(current_cart))
        return {"status": "success", "storage": "redis", "message": "Добавлено в Redis кэш"}