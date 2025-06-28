from pydantic import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL = "postgresql://postgres:postgres@db:5432/workflow_db"
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        env_file = ".env"

settings = Settings()