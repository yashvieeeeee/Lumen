"""Empty-schema foundation; no sample content belongs in a migration."""

import sqlalchemy as sa
from alembic import op

revision = "0001"
down_revision = None


def upgrade():
    op.create_table(
        "user",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("email", sa.String(320), nullable=False),
        sa.Column("hashed_password", sa.String(1024), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("is_superuser", sa.Boolean(), nullable=False),
        sa.Column("is_verified", sa.Boolean(), nullable=False),
        sa.Column("adult_confirmed", sa.Boolean(), nullable=False),
        sa.Column("notice_accepted", sa.Boolean(), nullable=False),
        sa.Column("storage_enabled", sa.Boolean(), nullable=False),
        sa.Column("consent_revision", sa.Integer(), nullable=False),
        sa.Column("event_sequence", sa.Integer(), nullable=False),
        sa.CheckConstraint("consent_revision >= 1 AND event_sequence >= 0"),
        sa.CheckConstraint("adult_confirmed AND notice_accepted"),
    )
    op.create_index("ix_user_email", "user", ["email"], unique=True)
    op.create_table(
        "accesstoken",
        sa.Column("token", sa.String(43), primary_key=True),
        sa.Column(
            "user_id", sa.Uuid(), sa.ForeignKey("user.id", ondelete="CASCADE"), nullable=False
        ),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()
        ),
    )
    op.create_index("ix_accesstoken_created_at", "accesstoken", ["created_at"])
    op.create_table(
        "consent_revision",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column(
            "user_id", sa.Uuid(), sa.ForeignKey("user.id", ondelete="CASCADE"), nullable=False
        ),
        sa.Column("revision", sa.Integer(), nullable=False),
        sa.Column("storage_enabled", sa.Boolean(), nullable=False),
        sa.Column(
            "recorded_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()
        ),
        sa.UniqueConstraint("user_id", "revision"),
        sa.CheckConstraint("revision >= 1"),
    )
    op.create_index("ix_consent_revision_user_id", "consent_revision", ["user_id"])
    op.create_table(
        "input_event",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column(
            "user_id", sa.Uuid(), sa.ForeignKey("user.id", ondelete="CASCADE"), nullable=False
        ),
        sa.Column("sequence", sa.Integer(), nullable=False),
        sa.Column("idempotency_key", sa.Uuid(), nullable=False),
        sa.Column("fingerprint", sa.String(64), nullable=False),
        sa.Column("source", sa.String(10), nullable=False),
        sa.Column("locale", sa.String(10), nullable=False),
        sa.Column("consent_revision", sa.Integer(), nullable=False),
        sa.Column("save_state", sa.String(10), nullable=False),
        sa.Column("text", sa.Text()),
        sa.Column("authored_at", sa.DateTime(timezone=True)),
        sa.Column(
            "recorded_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()
        ),
        sa.UniqueConstraint("user_id", "idempotency_key"),
        sa.UniqueConstraint("user_id", "sequence"),
        sa.CheckConstraint("sequence >= 1 AND consent_revision >= 1"),
        sa.CheckConstraint("source IN ('chat','journal')"),
        sa.CheckConstraint("save_state IN ('saved','not_saved','deleted')"),
        sa.CheckConstraint(
            "(save_state = 'saved' AND text IS NOT NULL) OR (save_state <> 'saved' AND text IS NULL)"
        ),
    )
    op.create_index("ix_input_event_user_id", "input_event", ["user_id"])
    # Auth tables must be readable before identity is known. Personal tables have FORCE RLS.
    for table in ("consent_revision", "input_event"):
        op.execute(f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY")
        op.execute(f"ALTER TABLE {table} FORCE ROW LEVEL SECURITY")
        op.execute(
            f"CREATE POLICY owner_only ON {table} USING (user_id = nullif(current_setting('lumen.user_id', true), '')::uuid) WITH CHECK (user_id = nullif(current_setting('lumen.user_id', true), '')::uuid)"
        )
    op.execute(
        'GRANT SELECT, INSERT, UPDATE, DELETE ON "user", accesstoken, consent_revision, input_event TO lumen_app'
    )


def downgrade():
    for table in ("input_event", "consent_revision", "accesstoken", "user"):
        op.drop_table(table)
