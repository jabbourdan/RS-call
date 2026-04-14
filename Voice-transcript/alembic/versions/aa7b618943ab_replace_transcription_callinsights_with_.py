"""replace transcription callinsights with callanalysis update call table

Revision ID: aa7b618943ab
Revises: 319bd336473a
Create Date: 2026-03-18 00:02:08.189564

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import sqlmodel

# revision identifiers, used by Alembic.
revision: str = 'aa7b618943ab'
down_revision: Union[str, Sequence[str], None] = '319bd336473a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # ── Create callanalysis table ─────────────────────────────────
    op.create_table('callanalysis',
        sa.Column('analysis_id', sa.Uuid(), nullable=False),
        sa.Column('call_id', sa.Uuid(), nullable=False),
        sa.Column('job_name', sa.String(), nullable=True),
        sa.Column('transcription_status', sa.String(), nullable=False, server_default='queued'),
        sa.Column('s3_uri', sa.String(), nullable=True),
        sa.Column('transcript', sa.String(), nullable=True),
        sa.Column('transcript_json', sa.JSON(), nullable=True),
        sa.Column('summary', sa.String(), nullable=True),
        sa.Column('sentiment', sa.String(), nullable=True),
        sa.Column('key_points', sa.JSON(), nullable=True),
        sa.Column('next_action', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['call_id'], ['call.call_id'], ),
        sa.PrimaryKeyConstraint('analysis_id'),
        sa.UniqueConstraint('call_id')
    )
    op.create_index('ix_callanalysis_call_id', 'callanalysis', ['call_id'])
    op.create_index('ix_callanalysis_job_name', 'callanalysis', ['job_name'])

    # ── Drop old tables ───────────────────────────────────────────
    op.drop_index('ix_transcription_job_name', table_name='transcription')
    op.drop_table('transcription')
    op.drop_table('callinsights')

    # ── Add new columns to call (nullable first) ──────────────────
    op.add_column('call', sa.Column('recording_url', sa.String(), nullable=True))
    op.add_column('call', sa.Column('direction', sa.String(), nullable=True))

    # ── Fill existing rows with default ───────────────────────────
    op.execute("UPDATE call SET direction = 'outbound' WHERE direction IS NULL")

    # ── Now make direction NOT NULL ───────────────────────────────
    op.alter_column('call', 'direction', nullable=False)

    # ── Drop old column ───────────────────────────────────────────
    op.drop_column('call', 'session_folder')


def downgrade() -> None:
    op.add_column('call', sa.Column('session_folder', sa.String(), nullable=True))
    op.drop_column('call', 'direction')
    op.drop_column('call', 'recording_url')
    op.drop_table('callanalysis')