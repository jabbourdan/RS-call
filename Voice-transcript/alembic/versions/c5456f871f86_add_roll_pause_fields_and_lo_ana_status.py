"""add_roll_pause_fields_and_lo_ana_status

Revision ID: c5456f871f86
Revises: 2ad510ba51f1
Create Date: 2026-04-16 18:04:19.792469

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = 'c5456f871f86'
down_revision: Union[str, Sequence[str], None] = '2ad510ba51f1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── Add roll_paused and roll_paused_at to campaignsettings ──────────────
    op.add_column('campaignsettings', sa.Column('roll_paused', sa.Boolean(), nullable=True))
    op.execute("UPDATE campaignsettings SET roll_paused = false WHERE roll_paused IS NULL")
    op.alter_column('campaignsettings', 'roll_paused', nullable=False, server_default='false')

    op.add_column('campaignsettings', sa.Column('roll_paused_at', sa.DateTime(), nullable=True))

    # ── Data migration: add "לא ענה" to existing lead.status options ────────
    op.execute(
        """
        UPDATE lead
        SET status = jsonb_set(
            status::jsonb,
            '{options}',
            (status::jsonb->'options') || '["לא ענה"]'::jsonb
        )
        WHERE status IS NOT NULL
          AND NOT (status::jsonb->'options') @> '"לא ענה"'::jsonb
        """
    )

    # ── Data migration: add "לא ענה" to campaign_status.statuses ───────────
    op.execute(
        """
        UPDATE campaignsettings
        SET campaign_status = jsonb_set(
            campaign_status::jsonb,
            '{statuses}',
            (campaign_status::jsonb->'statuses') || '["לא ענה"]'::jsonb
        )
        WHERE campaign_status IS NOT NULL
          AND NOT (campaign_status::jsonb->'statuses') @> '"לא ענה"'::jsonb
        """
    )


def downgrade() -> None:
    # ── Remove roll_paused columns ──────────────────────────────────────────
    op.drop_column('campaignsettings', 'roll_paused_at')
    op.drop_column('campaignsettings', 'roll_paused')

    # ── Data migration: remove "לא ענה" from lead.status options ───────────
    op.execute(
        """
        UPDATE lead
        SET status = jsonb_set(
            status::jsonb,
            '{options}',
            (
                SELECT jsonb_agg(elem)
                FROM jsonb_array_elements(status::jsonb->'options') AS elem
                WHERE elem::text != '"לא ענה"'
            )
        )
        WHERE status IS NOT NULL
          AND (status::jsonb->'options') @> '"לא ענה"'::jsonb
        """
    )

    # ── Data migration: remove "לא ענה" from campaign_status.statuses ──────
    op.execute(
        """
        UPDATE campaignsettings
        SET campaign_status = jsonb_set(
            campaign_status::jsonb,
            '{statuses}',
            (
                SELECT jsonb_agg(elem)
                FROM jsonb_array_elements(campaign_status::jsonb->'statuses') AS elem
                WHERE elem::text != '"לא ענה"'
            )
        )
        WHERE campaign_status IS NOT NULL
          AND (campaign_status::jsonb->'statuses') @> '"לא ענה"'::jsonb
        """
    )
