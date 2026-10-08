# ИСПОЛЬЗУЕМ СТАБИЛЬНЫЙ DEBIAN-SLIM (Репозитории Ubuntu работают идеально дома)
FROM python:3.12-slim AS base

ENV POETRY_VERSION=1.8.3 \
    POETRY_VIRTUALENVS_IN_PROJECT=true \
    POETRY_NO_INTERACTION=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# Создаем пользователя и группу appuser (требование преподавателя)
RUN groupadd -g 1000 appgroup && useradd -u 1000 -g appgroup -s /bin/sh appuser

# Устанавливаем Poetry напрямую через pip
RUN pip install --no-cache-dir "poetry==$POETRY_VERSION"

# Копируем конфигурационные файлы Poetry
COPY pyproject.toml poetry.lock* ./

# ЭТАП 2: Сборщик зависимостей (Builder)
FROM base AS builder
# Устанавливаем готовые бинарные пакеты без долгой компиляции gcc
RUN apt-get update && apt-get install -y --no-install-recommends libpq-dev \
    && poetry install --no-root --only main

# ЭТАП 3: Окружение для разработки (Dev)
FROM builder AS dev
RUN poetry install --no-root

# ЭТАП 4: Минимальное окружение для запуска (Runtime)
FROM base AS runtime
COPY --from=builder /app/.venv /app/.venv
ENV PATH="/app/.venv/bin:$PATH"

USER appuser

# ЭТАП 5: Финальный образ с кодом приложения (Production)
FROM runtime AS production
# Копируем всю структуру бэкенда (включая приложение, ini-файлы и migrations)
COPY --chown=appuser:appgroup . .

# Открываем порт и запускаем FastAPI для DEPORTE
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]