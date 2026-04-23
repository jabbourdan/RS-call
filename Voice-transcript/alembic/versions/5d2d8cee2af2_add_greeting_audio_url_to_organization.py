"""add_greeting_audio_url_to_organization

Revision ID: 5d2d8cee2af2
Revises: dfc84c1dadba
Create Date: 2026-04-23 22:46:32.703960

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = '5d2d8cee2af2'
down_revision: Union[str, Sequence[str], None] = 'dfc84c1dadba'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add greeting_audio_url to organization.

    Public URL of a pre-recorded MP3 played to inbound callers. Twilio has
    no Hebrew TTS voice, so we <Play> this instead of <Say>. NULL → the
    inbound-voice webhook falls back to an English <Say>.
    """
    op.add_column(
        'organization',
        sa.Column('greeting_audio_url', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column('organization', 'greeting_audio_url')
