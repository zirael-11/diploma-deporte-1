from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Строка подключения к базе данных в Docker контейнере
DATABASE_URL = "postgresql://nika:admin@172.17.0.1:5432/deporte_shop"

# Создаем движок SQLAlchemy
engine = create_engine(DATABASE_URL)

# Создаем фабрику сессий для работы с запросами
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Базовый класс для наших будущих моделей таблиц
Base = declarative_base()

# Кастомная функция (Dependency) для автоматического закрытия сессий базы данных
def get_db():
    db = SessionLocal()
    try:
      yield db
    finally:
        db.close()