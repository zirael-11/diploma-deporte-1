import json
import os
import secrets
from contextlib import asynccontextmanager
from decimal import Decimal

import redis.asyncio as redis
from fastapi import Depends, FastAPI, HTTPException, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pwdlib import PasswordHash
from sqlalchemy import delete, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app import models
from app.core.database import get_async_db
from app.schemas.user import (UserCreateRequest, UserLogin, UserResponse,
                              ProductCreate, ProductUpdate, OrderCreate, GuestOrderCreate, CartWrite, FavoriteWrite, ShoppingImport)

password_hash = PasswordHash.recommended()
redis_client = redis.Redis(host=os.getenv("REDIS_HOST", "redis"),
                           port=int(os.getenv("REDIS_PORT", "6379")), decode_responses=True)
SESSION_TTL = 86400

def user_response(user):
    return {"id": str(user.id), "username": user.username, "email": user.email,
            "name": user.name, "role": user.role}

@asynccontextmanager
async def lifespan(app):
    from app.core.database import SessionLocal
    async with SessionLocal() as db:
        username = os.getenv("ADMIN_USERNAME", "admin")
        existing = await db.scalar(select(models.User).where(models.User.username == username))
        if not existing:
            db.add(models.User(username=username, email=os.getenv("ADMIN_EMAIL", "admin@deporte.ru"),
                               name="Администратор", role="admin",
                               password=password_hash.hash(os.getenv("ADMIN_PASSWORD", "admin"))))
            try:
                await db.commit()
            except IntegrityError:
                await db.rollback()
    yield
    await redis_client.aclose()

app = FastAPI(title="DEPORTE API", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
                   allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

async def current_user(request: Request, db: AsyncSession = Depends(get_async_db)):
    token = request.cookies.get("session_id")
    user_id = await redis_client.get(f"session:{token}") if token else None
    user = await db.get(models.User, user_id) if user_id else None
    if not user or not user.is_active:
        raise HTTPException(401, "Войдите в аккаунт")
    return user

async def admin_user(user=Depends(current_user)):
    if user.role != "admin":
        raise HTTPException(403, "Недостаточно прав")
    return user

async def start_session(user, request, response):
    old_token = request.cookies.get("session_id")
    if old_token:
        await redis_client.delete(f"session:{old_token}")
    token = secrets.token_urlsafe(32)
    await redis_client.setex(f"session:{token}", SESSION_TTL, str(user.id))
    response.set_cookie("session_id", token, max_age=SESSION_TTL, httponly=True,
                        samesite="lax", secure=os.getenv("COOKIE_SECURE", "false").lower() == "true")

@app.post("/auth/register", response_model=UserResponse, status_code=201)
async def register(data: UserCreateRequest, db: AsyncSession = Depends(get_async_db)):
    username, email = data.username.strip(), data.email.strip().lower()
    if not username or "@" not in email or email.startswith("@") or email.endswith("@"):
        raise HTTPException(422, "Укажите логин и корректный email")
    existing = await db.scalar(select(models.User).where(or_(models.User.username == username,
                                                            models.User.email == email)))
    if existing:
        raise HTTPException(409, "Логин или email уже зарегистрирован")
    user = models.User(username=username, email=email, name=(data.name or username).strip() or username,
                       password=password_hash.hash(data.password), role="user")
    db.add(user)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(409, "Логин или email уже зарегистрирован")
    return user_response(user)

@app.post("/auth/login", response_model=UserResponse)
async def login(data: UserLogin, request: Request, response: Response,
                db: AsyncSession = Depends(get_async_db)):
    identifier = data.username.strip()
    user = await db.scalar(select(models.User).where(or_(models.User.username == identifier,
                                                       models.User.email == identifier.lower())))
    valid = False
    if user and user.is_active:
        if user.password.startswith("$argon2"):
            try:
                valid = password_hash.verify(data.password, user.password)
            except Exception:
                valid = False
        else:

            valid = secrets.compare_digest(data.password.encode(), user.password.encode())
            if valid:
                user.password = password_hash.hash(data.password)
                await db.commit()
    if not valid:
        raise HTTPException(401, "Неверный логин/email или пароль")
    await start_session(user, request, response)
    return user_response(user)

@app.get("/auth/me", response_model=UserResponse)
async def me(user=Depends(current_user)):
    return user_response(user)

@app.post("/auth/logout")
async def logout(request: Request, response: Response):
    token = request.cookies.get("session_id")
    if token:
        await redis_client.delete(f"session:{token}")
    response.delete_cookie("session_id")
    return {"status": "success"}

@app.get("/users")
async def users(admin=Depends(admin_user), db: AsyncSession = Depends(get_async_db)):
    rows = (await db.scalars(select(models.User).order_by(models.User.created_at.desc()))).all()
    orders = (await db.scalars(select(models.Order).order_by(models.Order.created_at.desc()))).all()
    latest = {}
    for order in orders:
        latest.setdefault(order.user_id, order)
    result = []
    for user in rows:
        order = latest.get(user.id)
        summary = (f"DEPORTE-{order.id[:8]}: " + "; ".join(
            f"{item['title']}, {item['size']}, {item['quantity']} шт." for item in order.items)) if order else "Нет заказов"
        result.append({**user_response(user), "order": summary})
    return result

@app.delete("/users/{user_id}")
async def delete_user(user_id: str, admin=Depends(admin_user), db: AsyncSession = Depends(get_async_db)):
    user = await db.get(models.User, user_id)
    if not user:
        raise HTTPException(404, "Пользователь не найден")
    if user.role == "admin":
        raise HTTPException(400, "Удаление администратора запрещено")
    await db.delete(user)
    await db.commit()
    return {"status": "success"}

@app.get("/products")
async def products(db: AsyncSession = Depends(get_async_db)):
    return (await db.scalars(select(models.Product).order_by(models.Product.created_at, models.Product.id))).all()

@app.post("/products", status_code=201)
async def create_product(data: ProductCreate, admin=Depends(admin_user), db: AsyncSession = Depends(get_async_db)):
    product = models.Product(**data.model_dump())
    db.add(product)
    await db.commit()
    await db.refresh(product)
    return product

@app.patch("/products/{product_id}")
async def update_product(product_id: str, data: ProductUpdate, admin=Depends(admin_user), db: AsyncSession = Depends(get_async_db)):
    product = await db.get(models.Product, product_id)
    if not product:
        raise HTTPException(404, "Товар не найден")
    for key, value in data.model_dump().items():
        setattr(product, key, value)
    product.price_str = f"{data.price_num:,.2f}".replace(",", " ") + " ₽"
    await db.commit()
    return product

@app.delete("/products/{product_id}")
async def delete_product(product_id: str, admin=Depends(admin_user), db: AsyncSession = Depends(get_async_db)):
    product = await db.get(models.Product, product_id)
    if not product:
        raise HTTPException(404, "Товар не найден")
    await db.delete(product)
    await db.commit()
    return {"status": "success"}

def product_response(product):
    return {column.name: getattr(product, column.name) for column in product.__table__.columns}

async def lock_shopping(user, db):
    # Serialize per-user changes to avoid duplicate rows or lost quantity updates.
    await db.scalar(select(models.User).where(models.User.id == user.id).with_for_update())

async def shopping_response(user, db):
    rows = (await db.execute(select(models.CartItem, models.Product).join(models.Product,
        models.CartItem.product_id == models.Product.id).where(models.CartItem.user_id == user.id))).all()
    favorite_rows = (await db.scalars(select(models.Product).join(models.Favorite,
        models.Favorite.product_id == models.Product.id).where(models.Favorite.user_id == user.id))).all()
    return {"cart": [{**product_response(product), "size": item.selected_size, "quantity": item.quantity}
                     for item, product in rows], "favorites": [product_response(p) for p in favorite_rows]}

@app.get("/shopping")
async def shopping(user=Depends(current_user), db: AsyncSession = Depends(get_async_db)):
    return await shopping_response(user, db)

async def set_cart_item(user, db, product_id, size, quantity, merge=False):
    if not await db.get(models.Product, product_id):
        raise HTTPException(404, "Товар больше не существует")
    item = await db.scalar(select(models.CartItem).where(models.CartItem.user_id == user.id,
                          models.CartItem.product_id == product_id, models.CartItem.selected_size == size))
    if quantity == 0:
        if item: await db.delete(item)
    elif item:
        item.quantity = max(item.quantity, quantity) if merge else quantity
    else:
        db.add(models.CartItem(user_id=user.id, product_id=product_id, selected_size=size, quantity=quantity))
    await db.flush()

@app.put("/cart")
async def write_cart(data: CartWrite, user=Depends(current_user), db: AsyncSession = Depends(get_async_db)):
    await lock_shopping(user, db)
    await set_cart_item(user, db, data.product_id, data.size, data.quantity)
    await db.commit()
    return await shopping_response(user, db)

async def set_favorite(user, db, product_id, enabled):
    if not await db.get(models.Product, product_id):
        raise HTTPException(404, "Товар больше не существует")
    favorite = await db.scalar(select(models.Favorite).where(models.Favorite.user_id == user.id,
                               models.Favorite.product_id == product_id))
    if enabled and not favorite:
        db.add(models.Favorite(user_id=user.id, product_id=product_id))
    elif not enabled and favorite:
        await db.delete(favorite)
    await db.flush()

@app.put("/favorites")
async def write_favorite(data: FavoriteWrite, user=Depends(current_user), db: AsyncSession = Depends(get_async_db)):
    await lock_shopping(user, db)
    await set_favorite(user, db, data.product_id, data.enabled)
    await db.commit()
    return await shopping_response(user, db)

@app.post("/shopping/import")
async def import_shopping(data: ShoppingImport, user=Depends(current_user), db: AsyncSession = Depends(get_async_db)):
    await lock_shopping(user, db)
    for item in data.cart:
        # Skip deleted products in old guest data; repeat imports are idempotent.
        if await db.get(models.Product, item.product_id):
            await set_cart_item(user, db, item.product_id, item.size, item.quantity, merge=True)
    for product_id in set(data.favorites):
        if await db.get(models.Product, product_id):
            await set_favorite(user, db, product_id, True)
    await db.commit()
    return await shopping_response(user, db)

async def order_contents(data, db):
    items, total = [], Decimal("0")
    for item in data.items:
        product = await db.get(models.Product, item.product_id)
        if not product:
            raise HTTPException(400, "В корзине есть товар, которого больше нет в каталоге")
        total += product.price_num * item.quantity
        items.append({"product_id": product.id, "title": product.title, "size": item.size,
                      "quantity": item.quantity, "price": str(product.price_num)})
    return items, total

def order_response(order):
    return {"id": order.id, "number": f"DEPORTE-{order.id[:8]}", "total": str(order.total)}

@app.post("/orders", status_code=201)
async def create_order(data: OrderCreate, user=Depends(current_user), db: AsyncSession = Depends(get_async_db)):
    await lock_shopping(user, db)
    items, total = await order_contents(data, db)
    order = models.Order(user_id=user.id, full_name=data.full_name, phone=data.phone,
                         address=data.address, items=items, total=total)
    db.add(order)
    await db.execute(delete(models.CartItem).where(models.CartItem.user_id == user.id))
    await db.commit()
    return order_response(order)

@app.post("/orders/guest", status_code=201)
async def guest_order(data: GuestOrderCreate, request: Request, response: Response,
                      db: AsyncSession = Depends(get_async_db)):
    email = data.email.strip().lower()
    if "@" not in email or email.startswith("@") or email.endswith("@"):
        raise HTTPException(422, "Укажите корректный email")
    if await db.scalar(select(models.User).where(models.User.email == email)):
        raise HTTPException(409, "Этот email уже зарегистрирован. Войдите в аккаунт, чтобы оформить заказ.")
    items, total = await order_contents(data, db)
    password = data.password or secrets.token_urlsafe(12)
    username = "buyer_" + secrets.token_hex(6)
    user = models.User(username=username, email=email, name=data.full_name,
                       password=password_hash.hash(password), role="user")
    db.add(user)
    try:
        await db.flush()
        order = models.Order(user_id=user.id, full_name=data.full_name, phone=data.phone,
                             address=data.address, items=items, total=total)
        db.add(order)
        await db.flush()

        await start_session(user, request, response)
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(409, "Email уже зарегистрирован. Войдите в аккаунт.")
    return {**order_response(order), "user": user_response(user),
            "credentials": {"email": email, "username": username, "password": password}}
