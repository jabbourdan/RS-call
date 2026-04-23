"""drop_inboundgreetingconfig_table

Revision ID: 55568dfa24bc
Revises: 5d2d8cee2af2
Create Date: 2026-04-23 23:01:35.885076

The per-org greeting config table became dead weight once we moved to the
simple design: `organization.greeting_audio_url` + English <Say> fallback.
No runtime code reads the table anymore. Dropping it.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel
import app.models.base


# revision identifiers, used by Alembic.
revision: str = '55568dfa24bc'
down_revision: Union[str, Sequence[str], None] = '5d2d8cee2af2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_index(op.f('ix_inboundgreetingconfig_org_id'), table_name='inboundgreetingconfig')
    op.drop_table('inboundgreetingconfig')


def downgrade() -> None:
    """Recreate the table with its original shape (no data restored)."""
    op.create_table(
        'inboundgreetingconfig',
        sa.Column('config_id', sa.Uuid(), nullable=False),
        sa.Column('org_id', sa.Uuid(), nullable=False),
        sa.Column('is_enabled', sa.Boolean(), nullable=False),
        sa.Column('greeting_text', app.models.base.HebrewJSON(), nullable=False),
        sa.Column('default_language', sqlmodel.sql.sqltypes.AutoString(length=2), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('updated_by', sa.Uuid(), nullable=True),
        sa.ForeignKeyConstraint(['org_id'], ['organization.org_id']),
        sa.ForeignKeyConstraint(['updated_by'], ['user.user_id']),
        sa.PrimaryKeyConstraint('config_id'),
        sa.UniqueConstraint('org_id', name='uq_inboundgreetingconfig_org_id'),
    )
    op.create_index(
        op.f('ix_inboundgreetingconfig_org_id'),
        'inboundgreetingconfig', ['org_id'], unique=False,
    )
