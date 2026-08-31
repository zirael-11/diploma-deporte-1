from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import List, Optional
import uuid
import app.models as models
from app.models import UserRole
from app.core.database import engine, get_async_db

# ИСПРАВЛЕНО: Импортируем все валидационные схемы из папки schemas по канонам преподавателя
from app.schemas.user import UserCreateRequest, UserLogin, UserResponse, ProductCreate

app = FastAPI(title="DEPORTE Спортивный Интернет-Магазин API (SQLAlchemy Async)")

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
        await conn.run_sync(models.Base.metadata.create_all)


# --- ЭНДПОИНТЫ API ---

@app.get("/products")
async def get_products(db: AsyncSession = Depends(get_async_db)):
    result = await db.execute(select(models.Product))
    return result.scalars().all()

@app.post("/products", status_code=status.HTTP_201_CREATED)
async def create_product(product_data: ProductCreate, db: AsyncSession = Depends(get_async_db)):
    try:
        new_product = models.Product(
            title=product_data.title,
            main_category=product_data.main_category,
            country=product_data.country,
            club=product_data.club,
            year=product_data.year,
            type=product_data.type,
            price_num=product_data.price_num,
            price_str=product_data.price_str,
            description=product_data.description,
            image=product_data.image,
            image_hover=product_data.image_hover
        )
        db.add(new_product)
        await db.commit()
        await db.refresh(new_product)
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