"""Small runnable check of the request boundary before a database is needed."""

import importlib.util
from pathlib import Path
from types import SimpleNamespace

import pytest
from pydantic import SecretStr, ValidationError

from lumen_api.config import Settings
from lumen_api.schemas import ConsentChange, EventCreate, UserCreate


def test_account_requires_adult_and_notice_and_forbids_privilege_fields():
    account = {
        "email": "sample@example.com",
        "password": "a-long-sample-password",
        "adult_confirmed": True,
        "notice_accepted": True,
    }
    assert UserCreate(**account).adult_confirmed is True
    for extra in (
        {"adult_confirmed": False},
        {"notice_accepted": False},
        {"is_superuser": True},
        {"adult_confirmed": 1},
    ):
        with pytest.raises(ValidationError):
            UserCreate(**(account | extra))


def test_events_and_consent_are_bounded_and_explicit():
    event = {
        "source": "journal",
        "locale": "en",
        "text": "Sample entry",
        "expected_consent_revision": 1,
    }
    assert EventCreate(**event).source == "journal"
    for extra in (
        {"text": " "},
        {"text": "x" * 10001},
        {"locale": "unknown"},
        {"expected_consent_revision": True},
        {"user_id": "other"},
        {"text": "contains\x00NUL"},
        {"authored_at": "2026-10-08T10:00:00"},
    ):
        with pytest.raises(ValidationError):
            EventCreate(**(event | extra))
    with pytest.raises(ValidationError):
        ConsentChange(expected_revision=1, storage_enabled=True, memory_enabled=True)
    with pytest.raises(ValidationError):
        ConsentChange(expected_revision=1, storage_enabled="false")
    assert (
        EventCreate(**(event | {"authored_at": "2026-10-08T10:00:00Z"})).authored_at.tzinfo
        is not None
    )


def test_non_development_configuration_requires_https_and_hides_credentials():
    config = Settings()
    values = config.model_dump()
    for change in (
        {"receipt_key": "short-key-marker"},
        {"development": False, "cookie_secure": False},
    ):
        with pytest.raises(ValidationError) as failure:
            Settings(**(values | change))
        assert config.database_url.get_secret_value() not in str(failure.value)
        assert "short-key-marker" not in str(failure.value)
    assert Settings(
        **(
            values
            | {"development": False, "cookie_secure": True, "web_origin": "https://lumen.example"}
        )
    ).cookie_secure


async def test_local_bootstrap_refuses_other_databases_before_connecting(monkeypatch):
    path = Path(__file__).resolve().parents[3] / "scripts/bootstrap-db.py"
    spec = importlib.util.spec_from_file_location("local_bootstrap", path)
    bootstrap = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(bootstrap)
    admin = "postgresql+asyncpg://lumen_admin:synthetic@127.0.0.1:55432/lumen"
    app = "postgresql+asyncpg://lumen_app:synthetic@127.0.0.1:55432/lumen"
    connected = []

    async def unexpected_connect(**kwargs):
        connected.append(True)
        raise AssertionError("Must reject the configuration before opening a connection")

    monkeypatch.setattr(bootstrap.asyncpg, "connect", unexpected_connect)
    for admin_url, app_url in (
        (admin.replace("55432", "5432"), app),
        (admin.replace("/lumen", "/other"), app),
        (admin.replace("lumen_admin:", "other:"), app),
        (admin, app.replace("127.0.0.1", "remote.example")),
        (admin, app.replace("lumen_app:", "other:")),
        (admin + "?host=remote.example&port=5432", app),
        (admin.replace("postgresql+asyncpg", "other"), app),
    ):
        monkeypatch.setattr(
            bootstrap,
            "Settings",
            lambda admin_url=admin_url, app_url=app_url: SimpleNamespace(
                database_migration_url=SecretStr(admin_url), database_url=SecretStr(app_url)
            ),
        )
        with pytest.raises(RuntimeError):
            await bootstrap.main()
    assert not connected
