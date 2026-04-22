"""structured_summary_and_prompt_override

Revision ID: 42837b6870f3
Revises: 15071276ebbb
Create Date: 2026-04-18 23:08:11.181865

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '42837b6870f3'
down_revision: Union[str, Sequence[str], None] = '15071276ebbb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('callanalysis', sa.Column('summary_sections', sa.JSON(), nullable=True))
    op.add_column('callanalysis', sa.Column('summary_status', sa.String(length=32), nullable=False, server_default='unstructured_legacy'))
    op.add_column('callanalysis', sa.Column('prompt_version_used', sa.String(length=32), nullable=True))
    op.add_column('campaignsettings', sa.Column('summary_prompt_override', sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column('campaignsettings', 'summary_prompt_override')
    op.drop_column('callanalysis', 'prompt_version_used')
    op.drop_column('callanalysis', 'summary_status')
    op.drop_column('callanalysis', 'summary_sections')
