import uuid
import json
from datetime import datetime, timezone
from app.core.redis_manager import RedisManager # Твой менеджер Redis подключений

class SessionService:
    def __init__(self, redis_client: RedisManager):
        self.redis_manager = redis_manager
        self.redis_client = redis_manager.get_client()
        self.timeout = 86400 # 24 часа жизни сессии футболиста

    def _session_key(self, session_id: str):
        return f"session:{session_id}"

    def _user_key(self, user_id: str):
        return f"user:{user_id}"

    async def create_session(self, user_id: str) -> str:
        session_id = str(uuid.uuid4()) # Генерируем уникальный токен сессии
        now = datetime.now(timezone.utc).isoformat()
        
        # Данные сессии для сохранения в кэш
        session_data = {
            "user_id": user_id,
            "created_at": now,
            "last_activity": now
        }
        
        # Записываем в Redis с ограничением по времени (TTL)
        await self.redis_client.setex(
            self._session_key(session_id),
            self.timeout,
            json.dumps(session_data)
        )
        
        # Добавляем ID сессии в множество сессий конкретного пользователя
        await self.redis_client.sadd(self._user_key(user_id), session_id)
        
        return session_id

    async def get_session(self, session_id: str):
        data = await self.redis_client.get(self._session_key(session_id))
        if data:
            return json.loads(data)
        return None

    async def delete_session(self, session_id: str):
        session = await self.get_session(session_id)
        if session:
            user_id = session.get("user_id")
            await self.redis_client.delete(self._session_key(session_id))
            await self.redis_client.srem(self._user_key(user_id), session_id)