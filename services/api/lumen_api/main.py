import hashlib
import hmac
import uuid
from datetime import datetime, timedelta

from fastapi import Depends, FastAPI, Header, HTTPException, Query, Response
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy import delete, func, select, update
from sqlalchemy.exc import SQLAlchemyError

from .auth import authenticated_user, backend, cookie, current_user, users
from .boundary import Boundary
from .db import ConsentRevision, InputEvent, User, get_session, owner_context, settings
from .schemas import ConsentChange, EventCreate, EventEdit, UserCreate, UserRead
from .screening import screen_event

app = FastAPI(title="Lumen local foundation", docs_url=None, redoc_url=None, openapi_url=None)
app.add_middleware(Boundary, origin=settings.web_origin)
app.include_router(users.get_auth_router(backend), prefix="/auth")
app.include_router(users.get_register_router(UserRead, UserCreate), prefix="/auth")


@app.exception_handler(RequestValidationError)
async def invalid_request(request, exception):
    # Pydantic's default response echoes input, including private entries and passwords.
    return JSONResponse({"detail": "INVALID_REQUEST"}, status_code=422)


@app.exception_handler(SQLAlchemyError)
@app.exception_handler(OSError)
async def unavailable_database(request, exception):
    return JSONResponse({"detail": "SERVICE_UNAVAILABLE"}, status_code=503)


@app.get("/health")
async def health():
    return {"status": "ok", "scope": "local-synthetic-foundation"}


@app.get("/me", response_model=UserRead)
async def me(user=Depends(authenticated_user)):
    return user


async def lock_owner(session, user):
    await owner_context(session, user.id)
    return (
        await session.execute(
            select(User)
            .where(User.id == user.id)
            .with_for_update()
            .execution_options(populate_existing=True)
        )
    ).scalar_one()


def receipt(event):
    return {
        "id": str(event.id),
        "sequence": event.sequence,
        "source": event.source,
        "locale": event.locale,
        "consent_revision": event.consent_revision,
        "save_state": event.save_state,
        "text": event.text,
        "authored_at": event.authored_at,
        "recorded_at": event.recorded_at,
        "screening": event.screening,
        "mood": event.mood,
        "revision": event.revision,
        "updated_at": event.updated_at,
    }


@app.patch("/consent")
async def consent(change: ConsentChange, user=Depends(current_user), session=Depends(get_session)):
    owner = await lock_owner(session, user)
    if change.expected_revision != owner.consent_revision:
        raise HTTPException(409, "CONSENT_CHANGED")
    owner.consent_revision += 1
    owner.storage_enabled = change.storage_enabled
    session.add(
        ConsentRevision(
            user_id=user.id, revision=owner.consent_revision, storage_enabled=owner.storage_enabled
        )
    )
    if not owner.storage_enabled:
        await session.execute(
            update(InputEvent)
            .where(InputEvent.user_id == user.id, InputEvent.save_state == "saved")
            .values(
                text=None,
                screening=None,
                mood=None,
                save_state="deleted",
                revision=InputEvent.revision + 1,
                updated_at=func.now(),
            )
        )
    await session.commit()
    return {"consent_revision": owner.consent_revision, "storage_enabled": owner.storage_enabled}


@app.post("/events", status_code=201)
async def submit(
    event: EventCreate,
    response: Response,
    idempotency_key: uuid.UUID = Header(),
    user=Depends(current_user),
    session=Depends(get_session),
):
    owner = await lock_owner(session, user)
    fingerprint = hmac.new(
        settings.receipt_key.get_secret_value().encode(),
        # Keep legacy no-mood idempotency fingerprints stable across schema expansion.
        event.model_dump_json(exclude={"mood"} if event.mood is None else None).encode(),
        hashlib.sha256,
    ).hexdigest()
    previous = (
        await session.execute(
            select(InputEvent).where(
                InputEvent.user_id == user.id, InputEvent.idempotency_key == idempotency_key
            )
        )
    ).scalar_one_or_none()
    if previous:
        if not hmac.compare_digest(previous.fingerprint, fingerprint):
            raise HTTPException(409, "IDEMPOTENCY_CONFLICT")
        response.status_code = 200
        return receipt(previous)
    if event.expected_consent_revision != owner.consent_revision:
        raise HTTPException(409, "CONSENT_CHANGED")
    owner.event_sequence += 1
    initially_unsaved = not owner.storage_enabled
    screening = screen_event(event, development=settings.development)
    row = InputEvent(
        user_id=user.id,
        sequence=owner.event_sequence,
        idempotency_key=idempotency_key,
        fingerprint=fingerprint,
        source=event.source,
        locale=event.locale,
        consent_revision=owner.consent_revision,
        text=event.text if owner.storage_enabled else None,
        screening=screening if owner.storage_enabled else None,
        mood=event.mood if owner.storage_enabled else None,
        save_state="saved" if owner.storage_enabled else "not_saved",
        authored_at=event.authored_at,
    )
    session.add(row)
    await session.commit()
    await owner_context(session, user.id)
    await session.refresh(row)
    result = receipt(row)
    if initially_unsaved and row.save_state == "not_saved":
        result["screening"] = screening
    return result


@app.get("/events")
async def history(
    before: int | None = Query(default=None, ge=1),
    limit: int = Query(default=30, ge=1, le=100),
    user=Depends(current_user),
    session=Depends(get_session),
):
    await owner_context(session, user.id)
    query = select(InputEvent).where(InputEvent.user_id == user.id)
    if before is not None:
        query = query.where(InputEvent.sequence < before)
    rows = (
        (await session.execute(query.order_by(InputEvent.sequence.desc()).limit(limit)))
        .scalars()
        .all()
    )
    return {
        "owner_id": str(user.id),
        "events": [receipt(row) for row in rows],
        "next_before": rows[-1].sequence if len(rows) == limit else None,
    }


@app.delete("/events/{event_id}", status_code=204)
async def remove_event(
    event_id: uuid.UUID, user=Depends(current_user), session=Depends(get_session)
):
    await lock_owner(session, user)
    row = (
        await session.execute(
            select(InputEvent).where(InputEvent.id == event_id, InputEvent.user_id == user.id)
        )
    ).scalar_one_or_none()
    if row is None:
        raise HTTPException(404, "NOT_FOUND")
    row.text, row.screening, row.mood, row.save_state = None, None, None, "deleted"
    row.revision += 1
    row.updated_at = func.now()
    await session.commit()
    return Response(status_code=204)


@app.patch("/events/{event_id}")
async def edit_event(
    event_id: uuid.UUID,
    change: EventEdit,
    user=Depends(current_user),
    session=Depends(get_session),
):
    owner = await lock_owner(session, user)
    row = (
        await session.execute(
            select(InputEvent).where(
                InputEvent.id == event_id,
                InputEvent.user_id == user.id,
            )
        )
    ).scalar_one_or_none()
    if row is None:
        raise HTTPException(404, "NOT_FOUND")
    if change.expected_consent_revision != owner.consent_revision or not owner.storage_enabled:
        raise HTTPException(409, "CONSENT_CHANGED")
    if row.source != "journal" or row.save_state != "saved":
        raise HTTPException(409, "ENTRY_NOT_EDITABLE")
    if change.expected_revision != row.revision:
        # A lost successful response can be retried once without rerunning the check.
        if (
            row.revision == change.expected_revision + 1
            and row.text == change.text
            and row.locale == change.locale
            and row.mood == change.mood
            and row.consent_revision == owner.consent_revision
        ):
            return receipt(row)
        raise HTTPException(409, "ENTRY_CHANGED")
    row.text, row.locale, row.mood = change.text, change.locale, change.mood
    row.screening = screen_event(change, development=settings.development)
    row.revision += 1
    row.consent_revision = owner.consent_revision
    row.updated_at = func.now()
    await session.commit()
    await owner_context(session, user.id)
    await session.refresh(row)
    return receipt(row)


@app.get("/moods")
async def mood_history(
    start: datetime,
    end: datetime,
    user=Depends(current_user),
    session=Depends(get_session),
):
    if (
        start.tzinfo is None
        or end.tzinfo is None
        or not timedelta(0) < end - start <= timedelta(days=32)
    ):
        raise HTTPException(422, "INVALID_REQUEST")
    await owner_context(session, user.id)
    rows = (
        (
            await session.execute(
                select(InputEvent)
                .where(
                    InputEvent.user_id == user.id,
                    InputEvent.save_state == "saved",
                    InputEvent.mood.is_not(None),
                    InputEvent.recorded_at >= start,
                    InputEvent.recorded_at < end,
                )
                .order_by(InputEvent.recorded_at.desc(), InputEvent.sequence.desc())
                .limit(1001)
            )
        )
        .scalars()
        .all()
    )
    return {
        "owner_id": str(user.id),
        "truncated": len(rows) > 1000,
        "points": [
            {"event_id": str(row.id), "mood": row.mood, "recorded_at": row.recorded_at}
            for row in reversed(rows[:1000])
        ],
    }


@app.get("/export")
async def export(user=Depends(current_user), session=Depends(get_session)):
    await owner_context(session, user.id)
    rows = (
        (
            await session.execute(
                select(InputEvent)
                .where(InputEvent.user_id == user.id)
                .order_by(InputEvent.sequence)
            )
        )
        .scalars()
        .all()
    )
    revisions = (
        (
            await session.execute(
                select(ConsentRevision)
                .where(ConsentRevision.user_id == user.id)
                .order_by(ConsentRevision.revision)
            )
        )
        .scalars()
        .all()
    )
    return {
        "schema_version": 1,
        "account": {"id": str(user.id), "email": user.email},
        "consent": [
            {
                "revision": r.revision,
                "storage_enabled": r.storage_enabled,
                "recorded_at": r.recorded_at,
            }
            for r in revisions
        ],
        "events": [receipt(row) for row in rows],
    }


@app.delete("/account", status_code=204)
async def remove_account(user=Depends(current_user), session=Depends(get_session)):
    await lock_owner(session, user)
    await session.execute(delete(User).where(User.id == user.id))
    await session.commit()
    return await cookie.get_logout_response()
