from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "sqlite:///./vacation_rental.db"
    auth_secret: str = "change-me-in-development"
    frontend_origin: str = "http://localhost:5173"
    google_maps_api_key: str = ""
    seed_demo_data: bool = True

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False, extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
