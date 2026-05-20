from pydantic_settings import BaseSettings


class Settings(BaseSettings):

    DATABASE_URL: str

    APP_NAME: str
    APP_VERSION: str

    DEBUG: bool

    OLLAMA_URL: str
    OLLAMA_MODEL: str

    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    class Config:
        env_file = ".env"


settings = Settings()