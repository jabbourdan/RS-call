"""migrate_calling_algorithm_vocabulary

One-time data migration (no schema change) to rename legacy calling_algorithm
values to the vocabulary used by the frontend:
  fifo       -> random
  round_robin -> sequential
  priority   (unchanged)

Feature: specs/004-campaign-settings-audit
Clarification: user chose backend moves to match frontend vocabulary (Q1/B).

Revision ID: d9fe8754c66c
Revises: c5456f871f86
Create Date: 2026-04-18
"""
from typing import Sequence, Union

from alembic import op


revision: str = 'd9fe8754c66c'
down_revision: Union[str, Sequence[str], None] = 'c5456f871f86'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
        UPDATE campaignsettings
        SET calling_algorithm = 'random'
        WHERE calling_algorithm = 'fifo'
    """)
    op.execute("""
        UPDATE campaignsettings
        SET calling_algorithm = 'sequential'
        WHERE calling_algorithm = 'round_robin'
    """)


def downgrade() -> None:
    # Reverses the rename; note that after code deploys, new writes use the
    # new vocabulary. A downgrade here only restores column values, not
    # app behaviour.
    op.execute("""
        UPDATE campaignsettings
        SET calling_algorithm = 'fifo'
        WHERE calling_algorithm = 'random'
    """)
    op.execute("""
        UPDATE campaignsettings
        SET calling_algorithm = 'round_robin'
        WHERE calling_algorithm = 'sequential'
    """)
