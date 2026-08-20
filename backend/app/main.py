from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import List, Optional

app = FastAPI(title="DEPORTE Спортивный Интернет-Магазин API")

# НАСТРОЙКА CORS для интеграции с React фронтендом
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Функция для создания чистого подключения к Docker БД 
def get_db_connection():
    return psycopg2.connect(
        host="database",  # Название сервиса из docker-compose.yml
        dbname="deporte_shop",
        user="nika",
        password="admin"
    )

# --- АВТОМАТИЧЕСКАЯ ИНИЦИАЛИЗАЦИЯ И НАПОЛНЕНИЕ БАЗЫ ДАННЫХ DEPORTE СОГЛАСНО ВИТРИНЕ ---
def init_db():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # 1. Создаем таблицу пользователей (если её нет)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(50) NOT NULL,
                name VARCHAR(100) NOT NULL,
                role VARCHAR(20) DEFAULT 'user'
            );
        """)
        
        # 2. Создаем таблицу товаров (если её нет)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                main_category VARCHAR(100) NOT NULL,
                country VARCHAR(100),
                club VARCHAR(100),
                year VARCHAR(10),
                type VARCHAR(50),
                price_num FLOAT NOT NULL,
                price_str VARCHAR(50) NOT NULL,
                description TEXT,
                image TEXT,
                image_hover TEXT
            );
        """)
        
        # Проверяем, пуста ли таблица товаров
        cur.execute("SELECT COUNT(*) FROM products;")
        if cur.fetchone()[0] == 0:
            print("База данных пуста. Начинаем генерацию каталога DEPORTE...")
            
            # Конструкторы данных (один в один как на фронтенде)
            countries_list = ['Испания', 'Германия', 'Англия', 'Франция', 'Италия', 'Россия']
            club_leagues = {
                'Испания': ['Реал Мадрид', 'Барселона', 'Севилья', 'Атлетико Мадрид', 'Жирона'],
                'Англия': ['Арсенал', 'Челси', 'Манчестер Юнайтед', 'Манчестер Сити'],
                'Франция': ['ПСЖ', 'Монако', 'Лион'],
                'Германия': ['Боруссия Дортмунд', 'Бавария', 'Унион Берлин'],
                'Италия': ['Милан', 'Ювентус', 'Интер', 'Парма']
            }
            types_list = ['Домашняя', 'Гостевая', 'Специальная коллекция']
            years_list = ['2026', '2025', '2024', '2023', '2022']
            
            # Пулы картинок [Лицо, Ховер] — ВСЕ в формате .png!
            spain_kits = [["spainfuria2026.png", "spain2furia2026.png"], ["spaindelafuente.png", "spaindelafuente2.png"], ["spainflores.png", "spainflores2.png"], ["spainrukav.png", "spainrukav2.png"], ["spainvratar.png", "spainvratar2.png"]]
            german_kits = [["germanhome2026.png", "german2home2026.png"], ["germangost2026.png", "german2gost2026.png"], ["germangost2022.png", "german2gost2022.png"], ["germantrenirovka26.png", "german2trenirovka26.png"], ["germancostume2024.png", "german2costume2024.png"]]
            italy_kits = [["italysbor2026.png", "italy2sbor2026.png"], ["italy2026.png", "italy20262.png"], ["italyspets2025.png", "italy2spets2025.png"], ["italyvratar.png", "italy2vratar.png"], ["italyvetrovka2024.png", "italy2vetrovka2024.png"]]
            england_kits = [["englandhome2026.png", "england2home2026.png"], ["englandguest2026.png", "england2guest2026.png"], ["englandhomecorto.png", "englandhomecorto2.png"], ["englandcorto2025.png", "england2corto2025.png"], ["englandspecial.png", "england2special.png"], ["englandcostume.png", "england2costume.png"]]
            russia_kits = [["russiaussr.png", "russiaussr2.png"]]

            # Вспомогательная функция безопасной вставки в БД
            def insert_product(title, cat, country, club, yr, tp, p_num, p_str, desc, img, img_h):
                cur.execute("""
                    INSERT INTO products (title, main_category, country, club, year, type, price_num, price_str, description, image, image_hover)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
                """, (title, cat, country, club, yr, tp, p_num, p_str, desc, img, img_h))

            # 1. ГЕНЕРАЦИЯ СБОРНЫХ
            for country in countries_list:
                for i in range(1, 5):
                    year = years_list[i % len(years_list)]
                    p_type = types_list[i % len(types_list)]
                    price_num = 4500.0 + i * 400
                    price_str = f"{int(price_num):,} ₽".replace(",", " ")

                    pool = spain_kits
                    if country == 'Германия': pool = german_kits
                    if country == 'Италия': pool = italy_kits
                    if country == 'Англия': pool = england_kits
                    if country == 'Россия': pool = russia_kits

                    img_pair = pool[i % len(pool)]
                    insert_product(
                        f"{p_type} форма сборной: {country} ({year})", "Форма сборных", country, None, year, p_type,
                        price_num, price_str, f"Официальная экипировка национальной команды {country} футбольного сезона {year}.",
                        img_pair[0], img_pair[1]
                    )

            # 2. ГЕНЕРАЦИЯ КЛУБОВ
            club_counter = 0
            for league_name, clubs in club_leagues.items():
                for club in clubs:
                    club_counter += 1
                    for i in range(1, 3):
                        pool = spain_kits
                        if league_name == 'Германия': pool = german_kits
                        if league_name == 'Италия': pool = italy_kits
                        if league_name == 'Англия': pool = england_kits

                        img_pair = pool[(club_counter + i) % len(pool)]
                        year = years_list[(club_counter + i) % len(years_list)]
                        p_type = types_list[(club_counter + i) % len(types_list)]
                        price_num = 5990.0 + i * 300
                        price_str = f"{int(price_num):,} ₽".replace(",", " ")

                        insert_product(
                            f"{p_type} форма ФК {club} {year}", "Форма по клубам", league_name, club, year, p_type,
                            price_num, price_str, f"Лицензионная форма футбольного клуба {club}. Модель {year} года.",
                            img_pair[0], img_pair[1]
                        )

            # 3. ГЕНЕРАЦИЯ БУТС И МЯЧЕЙ
            extra_kits = [
                {'cat': 'Бутсы', 'brands': ['Nike', 'Adidas', 'Puma']},
                {'cat': 'Мячи', 'brands': ['UCL Pro', 'Flight', 'Orbita']}
            ]
            for k in extra_kits:
                for i in range(1, 11):
                    pool = spain_kits
                    if i % 4 == 0: pool = german_kits
                    if i % 4 == 1: pool = italy_kits
                    if i % 4 == 2: pool = england_kits

                    img_pair = pool[i % len(pool)]
                    price_num = 11000.0 + i * 400 if k['cat'] == 'Бутсы' else 3500.0 + i * 300
                    price_str = f"{int(price_num):,} ₽".replace(",", " ")
                    brand_name = k['brands'][i % 3]

                    insert_product(
                        f"{'Бутсы' if k['cat'] == 'Бутсы' else 'Мяч'} {brand_name} Pro", k['cat'], None, None, "2026", "Специальная коллекция",
                        price_num, price_str, "Профессиональный футбольный инвентарь высшего качества.",
                        img_pair[0], img_pair[1]
                    )

            conn.commit()
            print("База данных успешно синхронизирована с фронтендом и заполнена!")
            
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Ошибка инициализации каталога БД: {e}")

# Запускаем генерацию структуры при старте файла
init_db()

# --- PYDANTIC СХЕМЫ ДЛЯ ВАЛИДАЦИИ ДАННЫХ ---
class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    name: str
    role: str

# --- API ЭНДПОИНТЫ (МАРШРУТЫ СТРОГО ПО МАКЕТУ ПРЕПОДАВАТЕЛЯ) ---

@app.get("/")
def root():
    return {"message": "Hello World"}

@app.get("/health")
def health():
    return {"status": "ok"}

# 1. Получение всех товаров каталога напрямую через SQL-запрос и RealDictCursor
@app.get("/products")
async def get_products():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("SELECT * FROM products;")
    products = cur.fetchall()
    
    cur.close()
    conn.close()
    return products

# 2. Авторизация (Вход / Ролевая модель) через прямой SQL-запрос
@app.post("/auth/login", response_model=UserResponse)
async def login(user_data: UserLogin):
    if user_data.username.lower() == "admin" and user_data.password == "admin":
        return {"name": "Ника (Админ)", "role": "moderator"}

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("SELECT * FROM users WHERE username = %s;", (user_data.username,))
    user = cur.fetchone()
    
    cur.close()
    conn.close()
    
    if not user or user["password"] != user_data.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный логин или пароль!"
        )
        
    return {"name": user["name"], "role": user["role"]}

# КЛАСС ВАЛИДАЦИИ ДАННЫХ ДЛЯ ДОБАВЛЕНИЯ ТОВАРА
class ProductCreate(BaseModel):
    title: str
    main_category: str
    country: Optional[str] = None
    club: Optional[str] = None
    year: str
    type: str
    price_num: float
    price_str: str
    description: Optional[str] = None
    image: str
    image_hover: str

# НОВЫЙ ЭНДПОИНТ: Добавление товара модератором через SQL-команду INSERT INTO
@app.post("/products")
async def create_product(product: ProductCreate):
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("""
        INSERT INTO products (title, main_category, country, club, year, type, price_num, price_str, description, image, image_hover)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id;
    """, (
        product.title, product.main_category, product.country, product.club, 
        product.year, product.type, product.price_num, product.price_str, 
        product.description, product.image, product.image_hover
    ))
    
    new_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    
    return {"status": "success", "id": new_id, "message": "Товар успешно добавлен в базу данных PostgreSQL!"}

# 3. Удаление товара модератором через SQL-команду DELETE
@app.delete("/products/{product_id}")
async def delete_product(product_id: int):
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Проверяем существование товара в базе данных
    cur.execute("SELECT id FROM products WHERE id = %s;", (product_id,))
    if not cur.fetchone():
        cur.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Товар не найден в базе данных")
        
    # Выполняем удаление товара по его ID
    cur.execute("DELETE FROM products WHERE id = %s;", (product_id,))
    conn.commit()
    
    cur.close()
    conn.close()
    return {"status": "success", "message": f"Товар {product_id} успешно удален из PostgreSQL"}