import redis.asyncio as aioredis
from app.core.config import settings  # Подтягиваем переменные окружения REDIS_HOST и REDIS_PORT

class RedisManager:
    def __init__(self):
        # Строим URL подключения к контейнеру Redis внутри сети Docker
        self.redis_url = f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}"
        self._client = None

    def get_client(self) -> aioredis.Redis:
        # Если клиент ещё не создан, инициализируем асинхронное подключение
        if not self._client:
            self._client = aioredis.from_url(
                self.redis_url,
                encoding="utf-8",
                decode_responses=True  # Чтобы Redis сразу отдавал нам текст, а не байты!
            )
        return self._client

# Создаем один глобальный менеджер для всего бэкенда диплома
redis_manager = RedisManager()

# Та самая функция-генератор, которую мы указали вDepends() наших сервисов!
async def get_redis():
    return redis_manager.get_client()