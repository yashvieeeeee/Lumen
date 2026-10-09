import uuid
from datetime import datetime
from typing import Literal

from fastapi_users import schemas
from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    StrictBool,
    StrictInt,
    field_validator,
    model_validator,
)


class UserCreate(schemas.BaseUserCreate):
    # Public registration must never accept library privilege flags.
    model_config = ConfigDict(extra="forbid")
    is_active: None = Field(default=None, exclude=True)
    is_superuser: None = Field(default=None, exclude=True)
    is_verified: None = Field(default=None, exclude=True)
    password: str = Field(min_length=12, max_length=128)
    adult_confirmed: Literal[True]
    notice_accepted: Literal[True]

    @field_validator("adult_confirmed", "notice_accepted", mode="before")
    @classmethod
    def explicit_confirmation(cls, value):
        if value is not True:
            raise ValueError("An explicit confirmation is required")
        return value


class UserRead(schemas.BaseUser[uuid.UUID]):
    adult_confirmed: bool
    notice_accepted: bool
    storage_enabled: bool
    consent_revision: int


class ConsentChange(BaseModel):
    model_config = ConfigDict(extra="forbid")
    expected_revision: StrictInt = Field(ge=1)
    storage_enabled: StrictBool


class EventCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    source: Literal["chat", "journal"]
    locale: Literal["en", "hi-Deva", "mr-Deva", "hi-Latn", "mr-Latn"]
    text: str = Field(min_length=1, max_length=10000)
    expected_consent_revision: StrictInt = Field(ge=1)
    authored_at: datetime | None = None
    mood: StrictInt | None = Field(default=None, ge=1, le=5)

    @model_validator(mode="after")
    def journal_mood(self):
        if self.source != "journal" and self.mood is not None:
            raise ValueError("Mood is an optional journal observation")
        return self

    @field_validator("text")
    @classmethod
    def nonblank(cls, value):
        if not value.strip() or "\x00" in value:
            raise ValueError("Entry must contain text without NUL characters")
        return value

    @field_validator("authored_at")
    @classmethod
    def timezone_required(cls, value):
        if value is not None and value.tzinfo is None:
            raise ValueError("Timestamp requires a timezone")
        return value


class EventEdit(EventCreate):
    source: Literal["journal"] = "journal"
    authored_at: None = None
    expected_revision: StrictInt = Field(ge=1)


class EvidenceSpan(BaseModel):
    model_config = ConfigDict(extra="forbid")
    rule_id: str = Field(pattern=r"^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$")
    start: StrictInt = Field(ge=0, le=10000)
    end: StrictInt = Field(ge=1, le=10000)

    @model_validator(mode="after")
    def ordered(self):
        if self.end <= self.start:
            raise ValueError("Evidence offsets must be ordered")
        return self


class ScreeningResult(BaseModel):
    model_config = ConfigDict(extra="forbid")
    schema_version: Literal[1] = 1
    status: Literal["rule_only", "uncertain", "unavailable"]
    action: Literal["Low", "Moderate", "Elevated", "Critical", "Uncertain"] | None
    reason: str = Field(pattern=r"^[a-z_]{1,80}$")
    source: Literal["chat", "journal"]
    locale: Literal["en", "hi-Deva", "mr-Deva", "hi-Latn", "mr-Latn"]
    policy_review_status: Literal["draft_unreviewed"] = "draft_unreviewed"
    policy_version: str | None = Field(default=None, max_length=80)
    policy_sha256: str | None = Field(default=None, pattern=r"^[a-f0-9]{64}$")
    baseline_sha256: str | None = Field(default=None, pattern=r"^[a-f0-9]{64}$")
    rule_ids: list[str] = Field(default_factory=list, max_length=100)
    evidence_coordinate_system: Literal["normalized_unicode_codepoints"] = (
        "normalized_unicode_codepoints"
    )
    evidence_spans: list[EvidenceSpan] = Field(default_factory=list, max_length=50)
    evidence_truncated: bool = False

    @model_validator(mode="after")
    def available_decision(self):
        if self.status == "unavailable":
            if self.action is not None:
                raise ValueError("Unavailable screening cannot assign an action")
        elif self.status == "uncertain" and self.action != "Uncertain":
            raise ValueError("Uncertain screening must retain its uncertainty")
        elif self.status == "rule_only" and self.action == "Uncertain":
            raise ValueError("Uncertainty cannot be labeled a rule-only action")
        elif (
            not self.policy_version
            or not self.policy_sha256
            or not self.baseline_sha256
            or self.action is None
        ):
            raise ValueError("An available decision requires policy provenance and an action")
        return self
