from pathlib import Path

from pydantic import SecretStr, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.engine import make_url


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parents[3] / ".env.local",
        extra="ignore",
        hide_input_in_errors=True,
    )
    database_url: SecretStr
    database_migration_url: SecretStr
    receipt_key: SecretStr
    web_origin: str = "http://localhost:3180"
    cookie_secure: bool = True
    development: bool = False

    @model_validator(mode="after")
    def secure_configuration(self):
        if len(self.receipt_key.get_secret_value()) < 32:
            raise ValueError("Receipt key must contain at least 32 characters")
        if not self.development and (
            not self.cookie_secure or not self.web_origin.startswith("https://")
        ):
            raise ValueError("HTTPS and secure cookies are required outside local development")
        return self


def local_database_urls(config):
    admin = make_url(config.database_migration_url.get_secret_value())
    app = make_url(config.database_url.get_secret_value())
    for url, role in ((admin, "lumen_admin"), (app, "lumen_app")):
        if url.query:
            raise RuntimeError("Local database URLs must not contain connection overrides")
        if (url.drivername, url.host, url.port, url.database, url.username) != (
            "postgresql+asyncpg",
            "127.0.0.1",
            55432,
            "lumen",
            role,
        ):
            raise RuntimeError(
                "Local helpers require Lumen's dedicated localhost cluster and roles"
            )
    return admin, app
