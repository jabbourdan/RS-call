"""add_org_phone_numbers

Revision ID: 2ad510ba51f1
Revises: 532492961e9c
Create Date: 2026-04-14 21:59:23.532511

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision: str = '2ad510ba51f1'
down_revision: Union[str, Sequence[str], None] = '532492961e9c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # 1. Create orgphonenumber table
    op.create_table('orgphonenumber',
        sa.Column('phone_id', sa.Uuid(), nullable=False),
        sa.Column('org_id', sa.Uuid(), nullable=False),
        sa.Column('phone_number', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('label', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['org_id'], ['organization.org_id'], ),
        sa.PrimaryKeyConstraint('phone_id'),
        sa.UniqueConstraint('org_id', 'phone_number')
    )
    op.create_index(op.f('ix_orgphonenumber_org_id'), 'orgphonenumber', ['org_id'], unique=False)

    # 2. Add max_phone_numbers to organization with server_default
    op.add_column('organization', sa.Column('max_phone_numbers', sa.Integer(), nullable=False, server_default='2'))

    # 3. Add FK columns to campaignsettings
    op.add_column('campaignsettings', sa.Column('primary_phone_id', sa.Uuid(), nullable=True))
    op.add_column('campaignsettings', sa.Column('secondary_phone_id', sa.Uuid(), nullable=True))
    op.create_foreign_key('fk_cs_primary_phone', 'campaignsettings', 'orgphonenumber', ['primary_phone_id'], ['phone_id'])
    op.create_foreign_key('fk_cs_secondary_phone', 'campaignsettings', 'orgphonenumber', ['secondary_phone_id'], ['phone_id'])

    # 4. Data migration: create OrgPhoneNumber rows from existing phone strings
    # Insert unique (org_id, phone_number) pairs from phone_number_used1
    op.execute("""
        INSERT INTO orgphonenumber (phone_id, org_id, phone_number, is_active, created_at)
        SELECT gen_random_uuid(), c.org_id, cs.phone_number_used1, true, NOW()
        FROM campaignsettings cs
        JOIN campaign c ON c.campaign_id = cs.campaign_id
        WHERE cs.phone_number_used1 IS NOT NULL
        ON CONFLICT (org_id, phone_number) DO NOTHING
    """)

    # Insert unique (org_id, phone_number) pairs from phone_number_used2
    op.execute("""
        INSERT INTO orgphonenumber (phone_id, org_id, phone_number, is_active, created_at)
        SELECT gen_random_uuid(), c.org_id, cs.phone_number_used2, true, NOW()
        FROM campaignsettings cs
        JOIN campaign c ON c.campaign_id = cs.campaign_id
        WHERE cs.phone_number_used2 IS NOT NULL
        ON CONFLICT (org_id, phone_number) DO NOTHING
    """)

    # Update campaignsettings to set primary_phone_id from phone_number_used1
    op.execute("""
        UPDATE campaignsettings
        SET primary_phone_id = opn.phone_id
        FROM campaign c, orgphonenumber opn
        WHERE c.campaign_id = campaignsettings.campaign_id
        AND opn.org_id = c.org_id
        AND opn.phone_number = campaignsettings.phone_number_used1
        AND campaignsettings.phone_number_used1 IS NOT NULL
    """)

    # Update campaignsettings to set secondary_phone_id from phone_number_used2
    op.execute("""
        UPDATE campaignsettings
        SET secondary_phone_id = opn.phone_id
        FROM campaign c, orgphonenumber opn
        WHERE c.campaign_id = campaignsettings.campaign_id
        AND opn.org_id = c.org_id
        AND opn.phone_number = campaignsettings.phone_number_used2
        AND campaignsettings.phone_number_used2 IS NOT NULL
    """)

    # 5. Drop old phone string columns
    op.drop_column('campaignsettings', 'phone_number_used1')
    op.drop_column('campaignsettings', 'phone_number_used2')


def downgrade() -> None:
    """Downgrade schema."""
    # Re-add old columns
    op.add_column('campaignsettings', sa.Column('phone_number_used1', sa.VARCHAR(), nullable=True))
    op.add_column('campaignsettings', sa.Column('phone_number_used2', sa.VARCHAR(), nullable=True))

    # Restore data from FK references
    op.execute("""
        UPDATE campaignsettings cs
        SET phone_number_used1 = opn.phone_number
        FROM orgphonenumber opn
        WHERE opn.phone_id = cs.primary_phone_id
    """)
    op.execute("""
        UPDATE campaignsettings cs
        SET phone_number_used2 = opn.phone_number
        FROM orgphonenumber opn
        WHERE opn.phone_id = cs.secondary_phone_id
    """)

    # Drop FK constraints and new columns
    op.drop_constraint('fk_cs_secondary_phone', 'campaignsettings', type_='foreignkey')
    op.drop_constraint('fk_cs_primary_phone', 'campaignsettings', type_='foreignkey')
    op.drop_column('campaignsettings', 'secondary_phone_id')
    op.drop_column('campaignsettings', 'primary_phone_id')
    op.drop_column('organization', 'max_phone_numbers')
    op.drop_index(op.f('ix_orgphonenumber_org_id'), table_name='orgphonenumber')
    op.drop_table('orgphonenumber')
