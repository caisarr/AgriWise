from pydantic_settings import BaseSettings
from typing import List
import re

class Settings(BaseSettings):
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str
    GEMINI_API_KEY: str
    OPENWEATHERMAP_API_KEY: str = ""
    ALLOWED_ORIGINS: str = "http://localhost:3000"
    PORT: int = 8000

    @property
    def origins_list(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]

    class Config:
        env_file = ".env"

settings = Settings()
