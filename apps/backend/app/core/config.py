from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DB_HOST: str = "mysql"
    DB_PORT: int = 3306
    DB_USER: str = "opspilot"
    DB_PASSWORD: str = "opspilot_secret"
    DB_NAME: str = "opspilot"

    JWT_SECRET: str = "change_me_to_a_long_random_string_in_production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60

    APP_ENV: str = "development"

    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-3.5-flash"
    GEMINI_MAX_OUTPUT_TOKENS: int = 8192
    GEMINI_THINKING_LEVEL: str = "high"
    GEMINI_THINKING_BUDGET: int = -1
    GEMINI_TIMEOUT_SECONDS: int = 120

    CORS_ORIGINS: str = "http://localhost:3000"

    @property
    def DATABASE_URL(self) -> str:
        return (
            f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


settings = Settings()
