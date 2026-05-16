from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DB_HOST: str = "mysql"
    DB_PORT: int = 3306
    DB_USER: str = "opspilot"
    DB_PASSWORD: str = "opspilot_secret"
    DB_NAME: str = "opspilot"

    JWT_SECRET: str = "change_me_in_production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60

    APP_ENV: str = "development"

    @property
    def DATABASE_URL(self) -> str:
        return (
            f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )

    class Config:
        env_file = ".env"


settings = Settings()