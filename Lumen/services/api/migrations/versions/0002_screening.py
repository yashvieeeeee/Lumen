"""Consent-bound draft decisions; old receipts remain explicitly unscreened."""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import JSONB

revision = "0002"
down_revision = "0001"


def upgrade():
    op.add_column("input_event", sa.Column("screening", JSONB(none_as_null=True), nullable=True))
    op.create_check_constraint(
        "screening_requires_saved_text", "input_event", "screening IS NULL OR save_state = 'saved'"
    )


def downgrade():
    op.drop_constraint("screening_requires_saved_text", "input_event", type_="check")
    op.drop_column("input_event", "screening")
