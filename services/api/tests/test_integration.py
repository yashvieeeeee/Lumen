import asyncio
import uuid
from datetime import UTC, datetime, timedelta

import asyncpg
import httpx
import pytest
from sqlalchemy import text
from sqlalchemy.engine import make_url

from lumen_api.db import owner_context, session_factory, settings
from lumen_api.main import app

PASSWORD = "synthetic-test-password-only"

MOOD_WINDOW = {
    "start": (datetime.now(UTC) - timedelta(days=1)).isoformat(),
    "end": (datetime.now(UTC) + timedelta(days=1)).isoformat(),
}


async def test_journal_edit_rescreens_replays_and_preserves_creation_receipt(client, monkeypatch):
    await account(client)
    await client.patch("/consent", json={"expected_revision": 1, "storage_enabled": True})
    key = str(uuid.uuid4())
    original = payload(2)
    created = (await client.post("/events", json=original, headers={"Idempotency-Key": key})).json()
    assert created["revision"] == 1 and created["mood"] is None
    change = {
        "text": "I feel sad.",
        "locale": "en",
        "mood": 1,
        "expected_revision": 1,
        "expected_consent_revision": 2,
    }
    edited = await client.patch(f"/events/{created['id']}", json=change)
    assert edited.status_code == 200
    result = edited.json()
    assert result["revision"] == 2 and result["text"] == change["text"] and result["mood"] == 1
    assert result["updated_at"] and result["recorded_at"] == created["recorded_at"]
    assert result["screening"]["action"] == "Moderate"
    monkeypatch.setattr(
        "lumen_api.main.screen_event", lambda *args, **kwargs: pytest.fail("Retry rescreened")
    )
    assert (await client.patch(f"/events/{created['id']}", json=change)).json() == result
    replay = await client.post(
        "/events", json=original | {"mood": None}, headers={"Idempotency-Key": key}
    )
    assert replay.status_code == 200 and replay.json() == result
    conflict = await client.patch(
        f"/events/{created['id']}", json=change | {"text": "Different edit"}
    )
    assert conflict.status_code == 409 and conflict.json()["detail"] == "ENTRY_CHANGED"
    assert (await client.get("/export")).json()["events"][0]["mood"] == 1
    await client.delete("/account")


async def test_journal_edit_is_owned_consent_bound_and_concurrent(client):
    original_owner = await account(client)
    await client.patch("/consent", json={"expected_revision": 1, "storage_enabled": True})
    journal = (await event(client, 2)).json()
    change = {
        "text": "Updated fictional note.",
        "locale": "en",
        "mood": 5,
        "expected_revision": 1,
        "expected_consent_revision": 2,
    }
    results = await asyncio.gather(
        client.patch(f"/events/{journal['id']}", json=change),
        client.patch(f"/events/{journal['id']}", json=change | {"text": "A competing note."}),
    )
    assert sorted(r.status_code for r in results) == [200, 409]
    chat = (
        await client.post(
            "/events",
            json=payload(2) | {"source": "chat"},
            headers={"Idempotency-Key": str(uuid.uuid4())},
        )
    ).json()
    assert (await client.patch(f"/events/{chat['id']}", json=change)).status_code == 409
    other = await account(client)
    assert (await client.patch(f"/events/{journal['id']}", json=change)).status_code == 404
    assert (await client.get("/moods", params=MOOD_WINDOW)).json()["points"] == []
    await client.delete("/account")
    await client.post(
        "/auth/login", data={"username": original_owner["email"], "password": PASSWORD}
    )
    client.headers["X-Lumen-Account"] = original_owner["id"]
    await client.patch("/consent", json={"expected_revision": 2, "storage_enabled": False})
    assert (await client.patch(f"/events/{journal['id']}", json=change)).status_code == 409
    row = (await client.get("/events")).json()["events"][-1]
    assert row["text"] is None and row["screening"] is None and row["mood"] is None
    await client.delete("/account")
    assert other["id"] != original_owner["id"]


async def test_mood_is_optional_self_reported_and_removed_with_content(client):
    user = await account(client)
    body = payload() | {"mood": 1}
    unsaved = await client.post(
        "/events", json=body, headers={"Idempotency-Key": str(uuid.uuid4())}
    )
    assert unsaved.status_code == 201 and unsaved.json()["mood"] is None
    assert (await client.get("/moods", params=MOOD_WINDOW)).json()["points"] == []
    await client.patch("/consent", json={"expected_revision": 1, "storage_enabled": True})
    first = (
        await client.post(
            "/events", json=payload(2) | {"mood": 1}, headers={"Idempotency-Key": str(uuid.uuid4())}
        )
    ).json()
    second = (
        await client.post(
            "/events", json=payload(2) | {"mood": 5}, headers={"Idempotency-Key": str(uuid.uuid4())}
        )
    ).json()
    assert first["screening"]["action"] == second["screening"]["action"]
    series = (await client.get("/moods", params=MOOD_WINDOW)).json()
    assert series["owner_id"] == user["id"] and [p["mood"] for p in series["points"]] == [1, 5]
    assert all("text" not in point and "screening" not in point for point in series["points"])
    assert not series["truncated"]
    await client.delete(f"/events/{first['id']}")
    assert [
        p["mood"] for p in (await client.get("/moods", params=MOOD_WINDOW)).json()["points"]
    ] == [5]
    await client.patch("/consent", json={"expected_revision": 2, "storage_enabled": False})
    assert (await client.get("/moods", params=MOOD_WINDOW)).json()["points"] == []
    assert all(row["mood"] is None for row in (await client.get("/export")).json()["events"])
    await client.delete("/account")


async def test_mood_and_edit_boundaries_reject_invalid_and_unsaved_input(client):
    await account(client)
    for mood in (True, 0, 6, "3", 2.5):
        response = await client.post(
            "/events",
            json=payload() | {"mood": mood},
            headers={"Idempotency-Key": str(uuid.uuid4())},
        )
        assert response.status_code == 422 and response.json() == {"detail": "INVALID_REQUEST"}
    assert (
        await client.post(
            "/events",
            json=payload() | {"source": "chat", "mood": 3},
            headers={"Idempotency-Key": str(uuid.uuid4())},
        )
    ).status_code == 422
    unsaved = (await event(client)).json()
    edit = {
        "text": "Updated note",
        "locale": "en",
        "expected_revision": 1,
        "expected_consent_revision": 1,
    }
    assert (await client.patch(f"/events/{unsaved['id']}", json=edit)).status_code == 409
    await client.patch("/consent", json={"expected_revision": 1, "storage_enabled": True})
    assert (
        await client.patch(f"/events/{unsaved['id']}", json=edit | {"expected_consent_revision": 2})
    ).status_code == 409
    for params in (
        {"start": "2026-10-01", "end": "2026-10-08"},
        {"start": MOOD_WINDOW["end"], "end": MOOD_WINDOW["start"]},
        {"start": "2026-01-01T00:00:00Z", "end": MOOD_WINDOW["end"]},
    ):
        assert (await client.get("/moods", params=params)).status_code == 422
    await client.delete("/account")


async def test_mood_retention_and_entry_revision_constraints_are_enforced(client):
    from sqlalchemy.exc import IntegrityError

    user = await account(client)
    unsaved = (await event(client)).json()
    await client.patch("/consent", json={"expected_revision": 1, "storage_enabled": True})
    saved = (await event(client, 2)).json()
    for event_id, assignment in (
        (unsaved["id"], "mood=3"),
        (saved["id"], "mood=0"),
        (saved["id"], "mood=3, source='chat'"),
        (saved["id"], "revision=0"),
    ):
        async with session_factory() as session:
            await owner_context(session, uuid.UUID(user["id"]))
            with pytest.raises(IntegrityError):
                await session.execute(
                    text(f"UPDATE input_event SET {assignment} WHERE id=:id"),
                    {"id": uuid.UUID(event_id)},
                )
    await client.delete("/account")


async def test_mood_window_is_bounded_without_returning_private_text(client):
    from lumen_api.db import InputEvent

    user = await account(client)
    await client.patch("/consent", json={"expected_revision": 1, "storage_enabled": True})
    async with session_factory() as session:
        await owner_context(session, uuid.UUID(user["id"]))
        start = datetime(2026, 10, 8, tzinfo=UTC)
        session.add_all(
            [
                InputEvent(
                    user_id=uuid.UUID(user["id"]),
                    sequence=i + 1,
                    idempotency_key=uuid.uuid4(),
                    fingerprint="0" * 64,
                    source="journal",
                    locale="en",
                    consent_revision=2,
                    save_state="saved",
                    text="Fictional bound-check note.",
                    mood=3,
                    recorded_at=start + timedelta(seconds=i),
                )
                for i in range(1001)
            ]
        )
        await session.commit()
    series = (
        await client.get(
            "/moods", params={"start": "2026-10-01T00:00:00Z", "end": "2026-11-01T00:00:00Z"}
        )
    ).json()
    assert series["truncated"] and len(series["points"]) == 1000
    assert series["points"][0]["recorded_at"].startswith("2026-10-08T00:00:01")
    assert all(set(point) == {"event_id", "mood", "recorded_at"} for point in series["points"])
    await client.delete("/account")


@pytest.mark.parametrize("mutation", ["deletion", "withdrawal"])
async def test_edited_response_cannot_restore_removed_mood_or_screening(
    client, monkeypatch, mutation
):
    from sqlalchemy.ext.asyncio import AsyncSession

    from lumen_api.db import InputEvent

    await account(client)
    await client.patch("/consent", json={"expected_revision": 1, "storage_enabled": True})
    first = (await event(client, 2)).json()
    original_refresh = AsyncSession.refresh
    invoked = []

    async def mutate_before_refresh(session, instance, *args, **kwargs):
        if isinstance(instance, InputEvent) and not invoked:
            invoked.append(True)
            response = (
                await client.delete(f"/events/{instance.id}")
                if mutation == "deletion"
                else await client.patch(
                    "/consent", json={"expected_revision": 2, "storage_enabled": False}
                )
            )
            assert response.status_code in (200, 204)
        return await original_refresh(session, instance, *args, **kwargs)

    monkeypatch.setattr(AsyncSession, "refresh", mutate_before_refresh)
    result = await client.patch(
        f"/events/{first['id']}",
        json={
            "text": "I feel sad.",
            "locale": "en",
            "mood": 1,
            "expected_revision": 1,
            "expected_consent_revision": 2,
        },
    )
    assert result.status_code == 200 and invoked
    assert result.json()["save_state"] == "deleted"
    assert (
        result.json()["text"] is None
        and result.json()["screening"] is None
        and result.json()["mood"] is None
    )
    await client.delete("/account")


async def account(client):
    email = f"synthetic-{uuid.uuid4().hex}@example.com"
    response = await client.post(
        "/auth/register",
        json={
            "email": email,
            "password": PASSWORD,
            "adult_confirmed": True,
            "notice_accepted": True,
        },
    )
    assert response.status_code == 201, response.text
    user = response.json()
    assert not user["storage_enabled"] and not user["is_superuser"]
    response = await client.post("/auth/login", data={"username": email, "password": PASSWORD})
    assert response.status_code == 204, response.text
    assert (
        "HttpOnly" in response.headers["set-cookie"]
        and "SameSite=strict" in response.headers["set-cookie"]
    )
    client.headers["X-Lumen-Account"] = user["id"]
    return user


async def test_shared_cookie_account_change_cannot_write_to_another_account(client):
    original = await account(client)
    other = await account(client)
    client.headers["X-Lumen-Account"] = original["id"]
    response = await event(client)
    assert response.status_code == 409 and response.json()["detail"] == "ACCOUNT_CHANGED"
    assert (await client.get("/events")).status_code == 409
    client.headers["X-Lumen-Account"] = other["id"]
    assert (await client.get("/events")).json()["events"] == []
    await client.delete("/account")


def payload(revision=1):
    return {
        "source": "journal",
        "locale": "en",
        "text": "Synthetic exam-pressure entry. No participant material.",
        "expected_consent_revision": revision,
    }


async def event(client, revision=1, key=None):
    return await client.post(
        "/events", json=payload(revision), headers={"Idempotency-Key": str(key or uuid.uuid4())}
    )


async def test_save_consent_replay_withdrawal_and_account_delete(client):
    user = await account(client)
    first = await event(client)
    assert first.status_code == 201 and first.json()["text"] is None
    assert first.json()["save_state"] == "not_saved"
    assert (
        await client.patch("/consent", json={"expected_revision": 1, "storage_enabled": True})
    ).status_code == 200
    assert (await event(client, 1)).status_code == 409
    key = uuid.uuid4()
    saved = await event(client, 2, key)
    assert saved.status_code == 201 and saved.json()["text"] == payload()["text"]
    replay = await event(client, 2, key)
    assert replay.status_code == 200 and replay.json()["id"] == saved.json()["id"]
    conflict = await client.post(
        "/events",
        json=payload(2) | {"text": "Different sample"},
        headers={"Idempotency-Key": str(key)},
    )
    assert conflict.status_code == 409
    export = (await client.get("/export")).json()
    assert export["account"]["id"] == user["id"] and len(export["events"]) == 2
    assert len(export["consent"]) == 2
    assert (
        await client.patch("/consent", json={"expected_revision": 1, "storage_enabled": False})
    ).status_code == 409
    assert (
        await client.patch("/consent", json={"expected_revision": 2, "storage_enabled": False})
    ).status_code == 200
    replay = (await event(client, 2, key)).json()
    assert replay["save_state"] == "deleted" and replay["text"] is None
    assert all(row["text"] is None for row in (await client.get("/export")).json()["events"])
    token = client.cookies.get("lumen_session")
    assert (await client.delete("/account")).status_code == 204
    assert (
        await client.get("/me", headers={"Cookie": f"lumen_session={token}"})
    ).status_code == 401
    url = make_url(settings.database_migration_url.get_secret_value())
    connection = await asyncpg.connect(
        user=url.username,
        password=url.password,
        host=url.host,
        port=url.port,
        database=url.database,
    )
    try:
        for table in ("input_event", "consent_revision", "accesstoken"):
            assert (
                await connection.fetchval(
                    f"SELECT count(*) FROM {table} WHERE user_id=$1", uuid.UUID(user["id"])
                )
                == 0
            )
    finally:
        await connection.close()


async def test_two_users_database_rls_and_http_ownership(client):
    a = await account(client)
    await client.patch("/consent", json={"expected_revision": 1, "storage_enabled": True})
    row = (await event(client, 2)).json()
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app, client=(uuid.uuid4().hex, 123)),
        base_url="http://localhost:8060",
        headers={"Origin": "http://localhost:3180"},
    ) as second:
        b = await account(second)
        assert (await second.get("/events")).json()["events"] == []
        assert (await second.get("/export")).json()["account"]["id"] == b["id"]
        assert (await second.delete(f"/events/{row['id']}")).status_code == 404
        assert (await second.get("/review/events")).status_code == 404
        async with session_factory() as session:
            role = (
                await session.execute(
                    text("SELECT rolsuper, rolbypassrls FROM pg_roles WHERE rolname=current_user")
                )
            ).one()
            assert not role.rolsuper and not role.rolbypassrls
            assert (
                await session.execute(text("SELECT count(*) FROM input_event"))
            ).scalar_one() == 0
            await owner_context(session, b["id"])
            assert (
                await session.execute(text("SELECT count(*) FROM input_event"))
            ).scalar_one() == 0
            await owner_context(session, a["id"])
            assert (
                await session.execute(text("SELECT count(*) FROM input_event"))
            ).scalar_one() == 1
        # Pool reuse starts a new transaction with no personal context.
        async with session_factory() as session:
            assert (
                await session.execute(text("SELECT count(*) FROM input_event"))
            ).scalar_one() == 0
        await second.delete("/account")
    assert (await client.delete(f"/events/{row['id']}")).status_code == 204
    assert (await client.get("/events")).json()["events"][0]["save_state"] == "deleted"
    await client.delete("/account")


async def test_concurrent_requests_are_ordered_and_idempotent(client):
    await account(client)
    key = uuid.uuid4()
    responses = await asyncio.gather(event(client, key=key), event(client, key=key))
    assert sorted(r.status_code for r in responses) == [200, 201]
    assert responses[0].json()["id"] == responses[1].json()["id"]
    responses = await asyncio.gather(event(client), event(client))
    assert sorted(r.json()["sequence"] for r in responses) == [2, 3]
    latest = (await client.get("/events?limit=1")).json()
    assert latest["events"][0]["sequence"] == latest["next_before"] == 3
    earlier = (await client.get("/events?limit=1&before=3")).json()
    assert earlier["events"][0]["sequence"] == 2
    await client.delete("/account")


async def test_logout_revokes_stolen_cookie_and_wrong_password_fails(client):
    await account(client)
    token = client.cookies.get("lumen_session")
    assert (await client.post("/auth/logout")).status_code == 204
    assert (
        await client.get("/me", headers={"Cookie": f"lumen_session={token}"})
    ).status_code == 401
    assert (
        await client.post(
            "/auth/login", data={"username": "absent@example.com", "password": "wrong-password"}
        )
    ).status_code == 400


async def test_request_bounds_csrf_and_private_validation_errors(client):
    assert (await client.get("/health")).json()["status"] == "ok"
    assert (
        await client.post("/auth/login", headers={"Origin": "https://evil.example"})
    ).status_code == 403
    assert (await client.post("/events", content="x" * 65537)).status_code == 413
    assert (await client.post("/events", json=payload())).status_code == 401
    await account(client)
    assert (await client.get("/me")).status_code == 200
    duplicate = await client.post(
        "/events",
        content='{"source":"journal","locale":"en","text":"first","text":"second","expected_consent_revision":1}',
        headers={"Content-Type": "application/json", "Idempotency-Key": str(uuid.uuid4())},
    )
    assert duplicate.status_code == 422
    response = await client.post(
        "/events",
        json=payload() | {"user_id": "secret-marker"},
        headers={"Idempotency-Key": str(uuid.uuid4())},
    )
    assert (
        response.status_code == 422
        and "secret-marker" not in response.text
        and payload()["text"] not in response.text
    )
    assert (await client.get("/events?limit=1000")).status_code == 422
    assert (
        await client.post("/events", json=payload(), headers={"Idempotency-Key": "invalid"})
    ).status_code == 422
    await client.delete("/account")


async def test_rate_limit(client):
    responses = [
        await client.post(
            "/auth/login", data={"username": "absent@example.com", "password": "wrong"}
        )
        for _ in range(61)
    ]
    assert responses[-1].status_code == 429


async def test_screening_is_shared_and_does_not_retain_unsaved_decisions(client):
    await account(client)
    for locale, sample in {
        "en": "I plan to end my life tonight.",
        "hi-Deva": "मैं अभी खुद को सुरक्षित नहीं रख सकता।",
        "mr-Deva": "मी आत्ता स्वतःला सुरक्षित ठेवू शकत नाही.",
        "hi-Latn": "Main abhi khud ko safe nahi rakh sakta.",
        "mr-Latn": "Mi atta swatala safe thevu shakat nahi.",
    }.items():
        decisions = []
        for source in ("chat", "journal"):
            response = await client.post(
                "/events",
                json=payload() | {"text": sample, "locale": locale, "source": source},
                headers={"Idempotency-Key": str(uuid.uuid4())},
            )
            assert response.status_code == 201
            decision = response.json()["screening"]
            assert decision["action"] == "Critical" and decision["status"] == "rule_only"
            assert decision["policy_review_status"] == "draft_unreviewed"
            assert decision["policy_version"] == "rules-0.1.1-draft"
            assert len(decision["policy_sha256"]) == 64
            assert decision["evidence_spans"] and sample not in str(decision)
            decisions.append(decision | {"source": "same"})
        assert decisions[0] == decisions[1]
    assert all(row["screening"] is None for row in (await client.get("/export")).json()["events"])
    await client.delete("/account")


async def test_saved_decisions_replay_and_deletion_do_not_rescreen(client, monkeypatch):
    from lumen_api import main as endpoints

    await account(client)
    await client.patch("/consent", json={"expected_revision": 1, "storage_enabled": True})
    key = uuid.uuid4()
    body = payload(2) | {"text": "My friend said I want to die."}
    first = await client.post("/events", json=body, headers={"Idempotency-Key": str(key)})
    assert first.status_code == 201
    assert first.json()["screening"]["status"] == "uncertain"

    def should_not_rescreen(*args, **kwargs):
        raise AssertionError("An acknowledged receipt must not be screened again")

    monkeypatch.setattr(endpoints, "screen_event", should_not_rescreen)
    replay = await client.post("/events", json=body, headers={"Idempotency-Key": str(key)})
    assert replay.status_code == 200 and replay.json() == first.json()
    assert (await client.get("/events")).json()["events"][0]["screening"] == first.json()[
        "screening"
    ]
    await client.delete(f"/events/{first.json()['id']}")
    replay = await client.post("/events", json=body, headers={"Idempotency-Key": str(key)})
    assert replay.json()["screening"] is None and replay.json()["text"] is None
    await client.delete("/account")


async def test_withdrawal_removes_derived_screening_and_receipt_retries(client):
    await account(client)
    await client.patch("/consent", json={"expected_revision": 1, "storage_enabled": True})
    first = await event(client, 2)
    assert first.json()["screening"]["reason"] == "no_rule_match_not_assurance"
    assert first.json()["screening"]["action"] == "Low"
    await client.patch("/consent", json={"expected_revision": 2, "storage_enabled": False})
    exported = (await client.get("/export")).json()
    assert all(row["screening"] is None and row["text"] is None for row in exported["events"])
    await client.delete("/account")


async def test_screening_fault_never_becomes_low_and_database_fault_has_no_receipt(
    client, monkeypatch
):
    from lumen_api import main as endpoints
    from lumen_api import screening

    await account(client)

    def broken_policy():
        raise RuntimeError("private-policy-failure-marker")

    monkeypatch.setattr(screening, "get_baseline", broken_policy)
    response = await event(client)
    assert response.status_code == 201
    assert response.json()["screening"]["status"] == "unavailable"
    assert response.json()["screening"]["action"] is None
    assert "private-policy-failure-marker" not in response.text
    before = (await client.get("/events")).json()["events"]
    original = endpoints.lock_owner

    async def unavailable_database(*args):
        from sqlalchemy.exc import SQLAlchemyError

        raise SQLAlchemyError("private-database-failure-marker")

    monkeypatch.setattr(endpoints, "lock_owner", unavailable_database)
    response = await event(client)
    assert response.status_code == 503 and response.json() == {"detail": "SERVICE_UNAVAILABLE"}
    monkeypatch.setattr(endpoints, "lock_owner", original)
    assert (await client.get("/events")).json()["events"] == before
    await client.delete("/account")


async def test_screening_retention_constraint_is_enforced_by_database(client):
    from sqlalchemy.exc import IntegrityError

    user = await account(client)
    first = (await event(client)).json()
    async with session_factory() as session:
        await owner_context(session, user["id"])
        with pytest.raises(IntegrityError):
            await session.execute(
                text("UPDATE input_event SET screening='{}'::jsonb WHERE id=:id"),
                {"id": uuid.UUID(first["id"])},
            )
    await client.delete("/account")


@pytest.mark.parametrize("mutation", ["deletion", "withdrawal"])
async def test_postcommit_privacy_mutation_cannot_restore_decision_in_first_response(
    client, monkeypatch, mutation
):
    from sqlalchemy.ext.asyncio import AsyncSession

    from lumen_api.db import InputEvent

    await account(client)
    await client.patch("/consent", json={"expected_revision": 1, "storage_enabled": True})
    original_refresh = AsyncSession.refresh
    invoked = []

    async def mutate_before_refresh(session, instance, *args, **kwargs):
        if isinstance(instance, InputEvent) and not invoked:
            invoked.append(True)
            response = (
                await client.delete(f"/events/{instance.id}")
                if mutation == "deletion"
                else await client.patch(
                    "/consent", json={"expected_revision": 2, "storage_enabled": False}
                )
            )
            assert response.status_code in (200, 204)
        return await original_refresh(session, instance, *args, **kwargs)

    monkeypatch.setattr(AsyncSession, "refresh", mutate_before_refresh)
    response = await event(client, 2)
    assert invoked and response.status_code == 201
    assert response.json()["save_state"] == "deleted"
    assert response.json()["text"] is None and response.json()["screening"] is None
    await client.delete("/account")


async def test_actual_native_connection_failure_is_private_service_unavailable(client):
    import socket

    from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

    from lumen_api.db import get_session

    await account(client)
    # Reserve our own loopback port without listening; cannot hit another local database.
    with socket.socket() as reserved:
        reserved.bind(("127.0.0.1", 0))
        port = reserved.getsockname()[1]
        unreachable = create_async_engine(
            f"postgresql+asyncpg://synthetic:private-connection-marker@127.0.0.1:{port}/synthetic",
            connect_args={"timeout": 1},
        )
        factory = async_sessionmaker(unreachable)

        async def disconnected_session():
            async with factory() as session:
                yield session

        app.dependency_overrides[get_session] = disconnected_session
        try:
            response = await client.get("/events")
            assert response.status_code == 503
            assert response.json() == {"detail": "SERVICE_UNAVAILABLE"}
            assert "private-connection-marker" not in response.text
        finally:
            app.dependency_overrides.pop(get_session)
            await unreachable.dispose()
    await client.delete("/account")
