"""add is_roll to call and roll_active to campaignsettings

Revision ID: fe18252261a3
Revises: aa7b618943ab
Create Date: 2026-03-20 01:18:51.738270

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


revision: str = 'fe18252261a3'
down_revision: Union[str, Sequence[str], None] = 'aa7b618943ab'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # ── Add is_roll to call ───────────────────────────────────────
    op.add_column('call', sa.Column('is_roll', sa.Boolean(), nullable=True))
    op.execute("UPDATE call SET is_roll = false WHERE is_roll IS NULL")
    op.alter_column('call', 'is_roll', nullable=False, server_default='false')

    # ── Add roll_active to campaignsettings ───────────────────────
    op.add_column('campaignsettings', sa.Column('roll_active', sa.Boolean(), nullable=True))
    op.execute("UPDATE campaignsettings SET roll_active = false WHERE roll_active IS NULL")
    op.alter_column('campaignsettings', 'roll_active', nullable=False, server_default='false')


def downgrade() -> None:
    op.drop_column('campaignsettings', 'roll_active')
    op.drop_column('call', 'is_roll')