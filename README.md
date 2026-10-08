# DEPORTE

Дипломный проект — интернет-магазин футбольной одежды и экипировки.

## Возможности

- Каталог товаров с фильтрами и выбором размера.
- Регистрация и вход в аккаунт.
- Корзина и избранное с сохранением для зарегистрированных пользователей.
- Оформление заказов. При заказе без регистрации создаётся аккаунт.
- Админка для управления товарами и просмотра пользователей и заказов.
- Светлая и тёмная темы.
- Переключение русского, английского и испанского языков с сохранением выбора.

Каталог содержит минимум 120 демонстрационных товаров. Онлайн-оплата не подключена.

## Технологии

- Frontend: React, React Router, Redux Toolkit, i18next, react-i18next, SCSS, Vite.
- Backend: Python, FastAPI, SQLAlchemy, Alembic.
- База данных: PostgreSQL. Сессии пользователей: Redis.
- Запуск серверной части: Docker Compose и Nginx.

## Запуск

Нужны Docker Desktop и Node.js 22.12+.

```bash
git clone https://github.com/zirael-11/diploma-deporte-1.git
cd diploma-deporte-1
docker compose -p deporte-preview -f docker.preview.fixed.yml up -d --build
npm ci
npm run dev
```

Сайт: http://127.0.0.1:5174

Документация API: http://127.0.0.1:8001/docs

Учебный аккаунт администратора: `admin` / `admin`. Эти данные предназначены для локального запуска.

## База данных

В базе `deporte_shop`, в схеме `catalog`, используются таблицы:

- `users` — пользователи;
- `products` — товары;
- `cart_items` — корзина;
- `favorites` — избранное;
- `orders` — заказы.

Подключение к базе из терминала:

```bash
docker compose -p deporte-preview -f docker.preview.fixed.yml exec database psql -U nika -d deporte_shop
```

## Остановка

Остановить frontend: `Ctrl+C` в терминале.

```bash
docker compose -p deporte-preview -f docker.preview.fixed.yml stop
```

Данные базы при остановке сохраняются.
