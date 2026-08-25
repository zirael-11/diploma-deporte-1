from typing import Optional
from pydantic import Field, PostgresDsn, field_validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # App Settings
    app_name: str = Field("DEPORTE Sports Shop")
    debug: bool = True
    testing: bool = False

    # Database Settings
    postgres_host: str = "deporte-database"
    postgres_port: int = Field(5432)
    postgres_user: str = "nika"
    postgres_password: str = "admin"
    postgres_db: str = "deporte_shop"

    # Test Database Settings
    test_postgres_host: str = "localhost"
    test_postgres_port: int = Field(5432)
    test_postgres_user: str = "nika"
    test_postgres_password: str = "admin"
    test_postgres_db: str = "deporte_shop_test"

    database_url: Optional[PostgresDsn] = None

    @field_validator("database_url", mode="before")
    @classmethod
    def assembly_database_url(cls, v, info):
        if v:
            return v
        
        if info.data.get("testing"):
            return PostgresDsn.build(
                scheme="postgresql+asyncpg", # ПРИНУДИТЕЛЬНО АСИНХРОННЫЙ ДРАЙВЕР
                username=info.data.get("test_postgres_user"),
                password=info.data.get("test_postgres_password"),
                host=info.data.get("test_postgres_host"),
                port=info.data.get("test_postgres_port"),
                path=info.data.get("test_postgres_db"),
            )
        
        return PostgresDsn.build(
            scheme="postgresql+asyncpg", # ПРИНУДИТЕЛЬНО АСИНХРОННЫЙ ДРАЙВЕР
            username=info.data.get("postgres_user"),
            password=info.data.get("postgres_password"),
            host=info.data.get("postgres_host"),
            port=info.data.get("postgres_port"),
            path=info.data.get("postgres_db"),
        )

settings = Settings()