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
    
    # NEW: Added the Groq API Key!
    GROQ_API_KEY: str | None = None

    class Config:
        env_file = ".env"
        extra = "ignore"  # Tells Pydantic to ignore extra .env variables instead of crashing

settings = Settings()