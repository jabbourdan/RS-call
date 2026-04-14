from alembic import op
import sqlalchemy as sa
import sqlmodel

revision = '319bd336473a'
down_revision = '52be30293418'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Step 1 — add as nullable first (existing rows have no value)
    op.add_column('campaignsettings', sa.Column('calling_algorithm', sa.String(), nullable=True))
    op.add_column('campaignsettings', sa.Column('cooldown_minutes', sa.Integer(), nullable=True))

    # Step 2 — fill existing rows with defaults
    op.execute("UPDATE campaignsettings SET calling_algorithm = 'priority' WHERE calling_algorithm IS NULL")
    op.execute("UPDATE campaignsettings SET cooldown_minutes = 120 WHERE cooldown_minutes IS NULL")

    # Step 3 — now make them NOT NULL
    op.alter_column('campaignsettings', 'calling_algorithm', nullable=False)
    op.alter_column('campaignsettings', 'cooldown_minutes', nullable=False)


def downgrade() -> None:
    op.drop_column('campaignsettings', 'cooldown_minutes')
    op.drop_column('campaignsettings', 'calling_algorithm')