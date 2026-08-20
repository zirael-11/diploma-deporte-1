# ЭТАП 1: Базовый образ с настройками окружения и чистой установкой Poetry
FROM python:3.12-alpine3.20 AS base
ENV POETRY_VERSION=1.8.3 \
    POETRY_VIRTUALENVS_IN_PROJECT=true \
    POETRY_NO_INTERACTION=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# Устанавливаем системные зависимости для СУБД и создаем пользователя
RUN apk add --no-cache libpq \
    && addgroup -g 1000 -S appgroup \
    && adduser -u 1000 -S appuser -G appgroup

# Безопасная установка Poetry напрямую через pip
RUN pip install --no-cache-dir "poetry==$POETRY_VERSION"

# ИСПРАВЛЕНО: Копируем только pyproject.toml, без упоминания lock-файла!
COPY pyproject.toml ./

# ЭТАП 2: Сборщик зависимостей (Builder) с компиляторами
FROM base AS builder
RUN apk add --no-cache gcc musl-dev postgresql-dev 
# ИСПРАВЛЕНО: Флаг --no-root заставит Poetry самому создать лок-файл на лету
RUN poetry install --no-root --only main

# ЭТАП 3: Окружение для разработки (Dev)
FROM builder AS dev
RUN poetry install --no-root --with dev --no-cache

# ЭТАП 4: Минимальное окружение для запуска (Runtime)
FROM base AS runtime
COPY --from=builder /app/.venv /app/.venv
ENV PATH="/app/.venv/bin:$PATH"

USER appuser

# ЭТАП 5: Финальный образ с кодом приложения
FROM base AS production
COPY ./app ./app

# Открываем порт и запускаем FastAPI для DEPORTE
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]