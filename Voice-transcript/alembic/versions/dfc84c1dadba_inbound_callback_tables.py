"""inbound_callback_tables

Revision ID: dfc84c1dadba
Revises: 2ef4b419bfaa
Create Date: 2026-04-23 19:19:01.008959

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel
import app.models.base


# revision identifiers, used by Alembic.
revision: str = 'dfc84c1dadba'
down_revision: Union[str, Sequence[str], None] = '2ef4b419bfaa'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # inboundgreetingconfig — per-org greeting
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
    op.create_index(op.f('ix_inboundgreetingconfig_org_id'), 'inboundgreetingconfig', ['org_id'], unique=False)

    # unknowninbound — inbound calls whose From did not match a lead
    op.create_table(
        'unknowninbound',
        sa.Column('unknown_id', sa.Uuid(), nullable=False),
        sa.Column('org_id', sa.Uuid(), nullable=False),
        sa.Column('caller_phone', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('caller_phone_domestic', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('to_phone', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('twilio_call_sid', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('received_at', sa.DateTime(), nullable=False),
        sa.Column('call_duration_sec', sa.Integer(), nullable=True),
        sa.Column('outcome', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('converted_to_lead_id', sa.Uuid(), nullable=True),
        sa.ForeignKeyConstraint(['converted_to_lead_id'], ['lead.lead_id']),
        sa.ForeignKeyConstraint(['org_id'], ['organization.org_id']),
        sa.PrimaryKeyConstraint('unknown_id'),
        sa.UniqueConstraint('twilio_call_sid', name='uq_unknowninbound_twilio_call_sid'),
    )
    op.create_index('ix_unknowninbound_org_caller_domestic', 'unknowninbound', ['org_id', 'caller_phone_domestic'], unique=False)
    op.create_index(op.f('ix_unknowninbound_org_id'), 'unknowninbound', ['org_id'], unique=False)
    op.create_index('ix_unknowninbound_org_received_at', 'unknowninbound', ['org_id', 'received_at'], unique=False)

    # inboundcallnotification — in-app notification consumed by NotificationService poll
    op.create_table(
        'inboundcallnotification',
        sa.Column('notification_id', sa.Uuid(), nullable=False),
        sa.Column('user_id', sa.Uuid(), nullable=False),
        sa.Column('org_id', sa.Uuid(), nullable=False),
        sa.Column('kind', sqlmodel.sql.sqltypes.AutoString(length=32), nullable=False),
        sa.Column('call_id', sa.Uuid(), nullable=True),
        sa.Column('unknown_id', sa.Uuid(), nullable=True),
        sa.Column('lead_id', sa.Uuid(), nullable=True),
        sa.Column('caller_display', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('campaign_name', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('read_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['call_id'], ['call.call_id']),
        sa.ForeignKeyConstraint(['lead_id'], ['lead.lead_id']),
        sa.ForeignKeyConstraint(['org_id'], ['organization.org_id']),
        sa.ForeignKeyConstraint(['unknown_id'], ['unknowninbound.unknown_id']),
        sa.ForeignKeyConstraint(['user_id'], ['user.user_id']),
        sa.PrimaryKeyConstraint('notification_id'),
    )
    op.create_index(op.f('ix_inboundcallnotification_org_id'), 'inboundcallnotification', ['org_id'], unique=False)
    op.create_index(op.f('ix_inboundcallnotification_user_id'), 'inboundcallnotification', ['user_id'], unique=False)
    op.create_index('ix_inboundnotif_user_read', 'inboundcallnotification', ['user_id', 'read_at'], unique=False)

    # Partial-unique indexes (idempotency per R-5 / data-model §3).
    op.execute(
        "CREATE UNIQUE INDEX uq_inboundnotif_user_call_kind "
        "ON inboundcallnotification (user_id, call_id, kind) "
        "WHERE call_id IS NOT NULL"
    )
    op.execute(
        "CREATE UNIQUE INDEX uq_inboundnotif_user_unknown_kind "
        "ON inboundcallnotification (user_id, unknown_id, kind) "
        "WHERE unknown_id IS NOT NULL"
    )

    # Partial-unique index on existing call.twilio_sid (per R-5). Non-unique
    # ix_call_twilio_sid stays in place — Postgres handles both.
    op.execute(
        "CREATE UNIQUE INDEX ix_call_twilio_sid_unique "
        "ON call (twilio_sid) "
        "WHERE twilio_sid IS NOT NULL"
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("DROP INDEX IF EXISTS ix_call_twilio_sid_unique")
    op.execute("DROP INDEX IF EXISTS uq_inboundnotif_user_unknown_kind")
    op.execute("DROP INDEX IF EXISTS uq_inboundnotif_user_call_kind")
    op.drop_index('ix_inboundnotif_user_read', table_name='inboundcallnotification')
    op.drop_index(op.f('ix_inboundcallnotification_user_id'), table_name='inboundcallnotification')
    op.drop_index(op.f('ix_inboundcallnotification_org_id'), table_name='inboundcallnotification')
    op.drop_table('inboundcallnotification')
    op.drop_index('ix_unknowninbound_org_received_at', table_name='unknowninbound')
    op.drop_index(op.f('ix_unknowninbound_org_id'), table_name='unknowninbound')
    op.drop_index('ix_unknowninbound_org_caller_domestic', table_name='unknowninbound')
    op.drop_table('unknowninbound')
    op.drop_index(op.f('ix_inboundgreetingconfig_org_id'), table_name='inboundgreetingconfig')
    op.drop_table('inboundgreetingconfig')
