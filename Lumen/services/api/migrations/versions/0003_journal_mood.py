"""Journal revisions and optional consent-bound self-reported mood."""

import sqlalchemy as sa
from alembic import op

revision = "0003"
down_revision = "0002"


def upgrade():
    op.add_column("input_event", sa.Column("mood", sa.Integer(), nullable=True))
    op.add_column(
        "input_event", sa.Column("revision", sa.Integer(), nullable=False, server_default="1")
    )
    op.add_column("input_event", sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True))
    op.create_check_constraint("positive_entry_revision", "input_event", "revision >= 1")
    op.create_check_constraint(
        "mood_requires_saved_journal",
        "input_event",
        "mood IS NULL OR (save_state = 'saved' AND source = 'journal' AND mood BETWEEN 1 AND 5)",
    )


def downgrade():
    op.drop_constraint("mood_requires_saved_journal", "input_event", type_="check")
    op.drop_constraint("positive_entry_revision", "input_event", type_="check")
    for column in ("updated_at", "revision", "mood"):
        op.drop_column("input_event", column)
