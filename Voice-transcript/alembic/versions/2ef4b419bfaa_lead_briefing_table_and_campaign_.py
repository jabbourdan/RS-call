"""lead briefing table and campaign briefing prompt

Revision ID: 2ef4b419bfaa
Revises: 42837b6870f3
Create Date: 2026-04-22 20:43:30.437790

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2ef4b419bfaa'
down_revision: Union[str, Sequence[str], None] = '42837b6870f3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'leadbriefing',
        sa.Column('briefing_id', sa.Uuid(), nullable=False),
        sa.Column('lead_id', sa.Uuid(), nullable=False),
        sa.Column('org_id', sa.Uuid(), nullable=False),
        sa.Column('briefing_text', sa.Text(), nullable=False),
        sa.Column('prompt_used', sa.Text(), nullable=False),
        sa.Column('prompt_version', sa.String(length=32), nullable=False),
        sa.Column('generated_by', sa.Uuid(), nullable=False),
        sa.Column('generated_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['generated_by'], ['user.user_id'], ),
        sa.ForeignKeyConstraint(['lead_id'], ['lead.lead_id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['org_id'], ['organization.org_id'], ),
        sa.PrimaryKeyConstraint('briefing_id'),
    )
    op.create_index(op.f('ix_leadbriefing_lead_id'), 'leadbriefing', ['lead_id'], unique=True)
    op.create_index(op.f('ix_leadbriefing_org_id'), 'leadbriefing', ['org_id'], unique=False)

    op.add_column(
        'campaignsettings',
        sa.Column('briefing_prompt_override', sa.Text(), nullable=True),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('campaignsettings', 'briefing_prompt_override')
    op.drop_index(op.f('ix_leadbriefing_org_id'), table_name='leadbriefing')
    op.drop_index(op.f('ix_leadbriefing_lead_id'), table_name='leadbriefing')
    op.drop_table('leadbriefing')
