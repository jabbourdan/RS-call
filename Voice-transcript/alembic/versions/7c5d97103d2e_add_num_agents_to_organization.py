"""add num_agents to organization

Revision ID: 7c5d97103d2e
Revises: 403a1fe5468c
Create Date: 2026-03-14 02:06:33.504588

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7c5d97103d2e'
down_revision: Union[str, Sequence[str], None] = '403a1fe5468c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Step 1 — add as nullable first
    op.add_column('organization', sa.Column('num_agents', sa.Integer(), nullable=True))
    
    # Step 2 — fill existing rows with default value 1
    op.execute('UPDATE organization SET num_agents = 1 WHERE num_agents IS NULL')
    
    # Step 3 — now make it NOT NULL
    op.alter_column('organization', 'num_agents', nullable=False)


def downgrade() -> None:
    op.drop_column('organization', 'num_agents')
