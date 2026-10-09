import uuid

from fastapi import Depends, Header, HTTPException
from fastapi_users import BaseUserManager, FastAPIUsers, UUIDIDMixin
from fastapi_users.authentication import AuthenticationBackend, CookieTransport
from fastapi_users.authentication.strategy.db import DatabaseStrategy
from fastapi_users.db import SQLAlchemyUserDatabase
from fastapi_users_db_sqlalchemy.access_token import SQLAlchemyAccessTokenDatabase

from .db import AccessToken, ConsentRevision, User, get_session, owner_context, settings


async def get_user_db(session=Depends(get_session)):
    yield SQLAlchemyUserDatabase(session, User)


class UserManager(UUIDIDMixin, BaseUserManager[User, uuid.UUID]):
    async def on_after_register(self, user, request=None):
        session = self.user_db.session
        await owner_context(session, user.id)
        session.add(ConsentRevision(user_id=user.id, revision=1, storage_enabled=False))
        await session.commit()


async def get_user_manager(user_db=Depends(get_user_db)):
    yield UserManager(user_db)


async def get_strategy(session=Depends(get_session)):
    return DatabaseStrategy(
        SQLAlchemyAccessTokenDatabase(session, AccessToken), lifetime_seconds=3600
    )


cookie = CookieTransport(
    cookie_name="lumen_session",
    cookie_max_age=3600,
    cookie_secure=settings.cookie_secure,
    cookie_httponly=True,
    cookie_samesite="strict",
)
backend = AuthenticationBackend(name="cookie", transport=cookie, get_strategy=get_strategy)
users = FastAPIUsers[User, uuid.UUID](get_user_manager, [backend])
authenticated_user = users.current_user(active=True)


async def current_user(
    user=Depends(authenticated_user), expected_account: uuid.UUID = Header(alias="X-Lumen-Account")
):
    # A consistency check, never an authorization source. Cookies still authenticate the user.
    if expected_account != user.id:
        raise HTTPException(409, "ACCOUNT_CHANGED")
    return user
