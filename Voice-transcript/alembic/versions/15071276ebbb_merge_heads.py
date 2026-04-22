"""merge_heads

Revision ID: 15071276ebbb
Revises: 6f903a8a1ee5, d9fe8754c66c
Create Date: 2026-04-18 23:05:26.624267

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '15071276ebbb'
down_revision: Union[str, Sequence[str], None] = ('6f903a8a1ee5', 'd9fe8754c66c')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
