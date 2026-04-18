from typing import Optional, List, Dict, Any
from uuid import UUID, uuid4
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship, Column, JSON
from sqlalchemy import types, UniqueConstraint
import json

# =========================
# Custom JSON Type — saves Hebrew as real characters
# =========================
class HebrewJSON(types.TypeDecorator):
    impl = types.JSON
    cache_ok = True

    def process_bind_param(self, value, dialect):
        """Prepares the Python dict for the Database (Save as Hebrew)"""
        if value is not None:
            return json.loads(json.dumps(value, ensure_ascii=False))
        return value

    def process_result_value(self, value, dialect):
        """Handles the value coming out of the Database"""
        return value

# =========================
# Organization
# =========================
class Organization(SQLModel, table=True):
    org_id: UUID = Field(default_factory=uuid4, primary_key=True)
    org_name: str = Field(unique=True)
    plan: str = Field(default="free")
    bus_type: Optional[str] = None
    calls_destination: Optional[str] = None
    is_active: bool = Field(default=True)
    num_agents: int = Field(default=1)
    max_phone_numbers: int = Field(default=2)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    users: List["User"] = Relationship(back_populates="organization")
    contacts: List["Contact"] = Relationship(back_populates="organization")
    calls: List["Call"] = Relationship(back_populates="organization")
    campaigns: List["Campaign"] = Relationship(back_populates="organization")
    leads: List["Lead"] = Relationship(back_populates="organization")
    phone_numbers: List["OrgPhoneNumber"] = Relationship(back_populates="organization")

# =========================
# OrgPhoneNumber
# =========================
class OrgPhoneNumber(SQLModel, table=True):
    __table_args__ = (UniqueConstraint("org_id", "phone_number"),)

    phone_id: UUID = Field(default_factory=uuid4, primary_key=True)
    org_id: UUID = Field(foreign_key="organization.org_id", index=True)
    phone_number: str
    label: Optional[str] = None
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    organization: Optional[Organization] = Relationship(back_populates="phone_numbers")

# =========================
# User
# =========================
class User(SQLModel, table=True):
    user_id: UUID = Field(default_factory=uuid4, primary_key=True)
    org_id: UUID = Field(foreign_key="organization.org_id", index=True)

    email: str = Field(index=True, unique=True)
    full_name: str
    hashed_password: str
    role: str = Field(default="member")

    is_active: bool = Field(default=True)
    is_verified: bool = Field(default=False)
    email_verification_token: Optional[str] = None

    failed_login_attempts: int = Field(default=0)
    locked_until: Optional[datetime] = None
    last_login_at: Optional[datetime] = None
    last_login_ip: Optional[str] = None
    refresh_token_hash: Optional[str] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    organization: Optional[Organization] = Relationship(back_populates="users")
    calls: List["Call"] = Relationship(back_populates="user")
    campaigns: List["Campaign"] = Relationship(
        back_populates="creator",
        sa_relationship_kwargs={"foreign_keys": "[Campaign.created_by]"}
    )
    lead_created: List["Lead"] = Relationship(
        back_populates="creator",
        sa_relationship_kwargs={"foreign_keys": "[Lead.created_by]"}
    )
    lead_called: List["Lead"] = Relationship(
        back_populates="called_by_user",
        sa_relationship_kwargs={"foreign_keys": "[Lead.called_by]"}
    )
    lead_comments: List["LeadComment"] = Relationship(back_populates="user")
    lead_status_changes: List["LeadStatusHistory"] = Relationship(back_populates="user")

# =========================
# Contact
# =========================
class Contact(SQLModel, table=True):
    contact_id: UUID = Field(default_factory=uuid4, primary_key=True)
    org_id: UUID = Field(foreign_key="organization.org_id", index=True)

    name: str
    phone_number: str = Field(index=True)
    email: Optional[str] = None
    extra_data: Optional[Dict[str, Any]] = Field(
        default=None, sa_column=Column(HebrewJSON)
    )
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    organization: Optional[Organization] = Relationship(back_populates="contacts")
    calls: List["Call"] = Relationship(back_populates="contact")

# =========================
# Campaign
# =========================
class Campaign(SQLModel, table=True):
    campaign_id: UUID = Field(default_factory=uuid4, primary_key=True)
    org_id: UUID = Field(foreign_key="organization.org_id", index=True)
    created_by: UUID = Field(foreign_key="user.user_id")

    name: str
    description: Optional[str] = None
    status: str = Field(default="active")

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    organization: Optional[Organization] = Relationship(back_populates="campaigns")
    creator: Optional["User"] = Relationship(
        back_populates="campaigns",
        sa_relationship_kwargs={"foreign_keys": "[Campaign.created_by]"}
    )
    settings: Optional["CampaignSettings"] = Relationship(back_populates="campaign")
    leads: List["Lead"] = Relationship(back_populates="campaign")
    calls: List["Call"] = Relationship(back_populates="campaign")

# =========================
# CampaignSettings
# =========================
class CampaignSettings(SQLModel, table=True):
    # Exposure notes:
    #   settings_id, campaign_id, primary_phone_id, secondary_phone_id,
    #   change_number_after, max_calls_to_unanswered_lead, calling_algorithm,
    #   cooldown_minutes, campaign_status — API: returned & accepted
    #   roll_active, roll_paused, roll_paused_at — internal only, not in API responses
    settings_id: UUID = Field(default_factory=uuid4, primary_key=True)
    campaign_id: UUID = Field(foreign_key="campaign.campaign_id", unique=True)

    primary_phone_id: Optional[UUID] = Field(default=None, foreign_key="orgphonenumber.phone_id")
    secondary_phone_id: Optional[UUID] = Field(default=None, foreign_key="orgphonenumber.phone_id")
    change_number_after: Optional[int] = None
    max_calls_to_unanswered_lead: int = Field(default=3)
    calling_algorithm: str = Field(default="priority")
    cooldown_minutes: int = Field(default=120)

    campaign_status: Optional[Dict[str, Any]] = Field(
        default={
            "statuses": [
                "ממתין", "ענה", "לא רלוונטי",
                "עסקה נסגרה", "פולו אפ", "אל תתקשר"
            ]
        },
        sa_column=Column(HebrewJSON)
    )
    roll_active: bool = Field(default=False)
    roll_paused: bool = Field(default=False)
    roll_paused_at: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    campaign: Optional[Campaign] = Relationship(back_populates="settings")
    primary_phone: Optional["OrgPhoneNumber"] = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[CampaignSettings.primary_phone_id]"}
    )
    secondary_phone: Optional["OrgPhoneNumber"] = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[CampaignSettings.secondary_phone_id]"}
    )

# =========================
# Lead
# =========================
class Lead(SQLModel, table=True):
    lead_id: UUID = Field(default_factory=uuid4, primary_key=True)
    org_id: UUID = Field(foreign_key="organization.org_id", index=True)
    campaign_id: UUID = Field(foreign_key="campaign.campaign_id", index=True)
    phone_number: str = Field(index=True)
    created_by: UUID = Field(foreign_key="user.user_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    campaign_name: Optional[str] = None
    name: Optional[str] = None
    email: Optional[str] = None

    last_call_at: Optional[datetime] = None
    tried_to_reach: int = Field(default=0)
    sum_calls_performed: int = Field(default=0)
    number_called_from: Optional[str] = None
    called_by: Optional[UUID] = Field(default=None, foreign_key="user.user_id")

    follow_up_date: Optional[datetime] = None

    status: Optional[Dict[str, Any]] = Field(
        default={
            "current": "ממתין",
            "options": [
                "ממתין", "ענה", "לא ענה", "לא רלוונטי",
                "עסקה נסגרה", "פולו אפ", "אל תתקשר"
            ]
        },
        sa_column=Column(HebrewJSON)
    )

    extra_data: Optional[Dict[str, Any]] = Field(
        default=None, sa_column=Column(HebrewJSON)
    )

    # Relationships
    organization: Optional[Organization] = Relationship(back_populates="leads")
    campaign: Optional[Campaign] = Relationship(back_populates="leads")
    creator: Optional[User] = Relationship(
        back_populates="lead_created",
        sa_relationship_kwargs={"foreign_keys": "[Lead.created_by]"}
    )
    called_by_user: Optional[User] = Relationship(
        back_populates="lead_called",
        sa_relationship_kwargs={"foreign_keys": "[Lead.called_by]"}
    )
    calls: List["Call"] = Relationship(back_populates="lead")
    comments: List["LeadComment"] = Relationship(back_populates="lead")
    status_history: List["LeadStatusHistory"] = Relationship(back_populates="lead")

# =========================
# Call
# =========================
class Call(SQLModel, table=True):
    call_id: UUID = Field(default_factory=uuid4, primary_key=True)
    org_id: UUID = Field(foreign_key="organization.org_id", index=True)
    user_id: UUID = Field(foreign_key="user.user_id")
    contact_id: Optional[UUID] = Field(default=None, foreign_key="contact.contact_id")
    campaign_id: Optional[UUID] = Field(default=None, foreign_key="campaign.campaign_id")
    lead_id: Optional[UUID] = Field(default=None, foreign_key="lead.lead_id")

    twilio_sid: Optional[str] = Field(default=None, index=True)
    recording_sid: Optional[str] = Field(default=None)
    recording_url: Optional[str] = None
    destination: Optional[str] = None
    direction: str = Field(default="outbound")
    duration: int = Field(default=0)
    is_roll: bool = Field(default=False)
    status: str = Field(default="initiated")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    organization: Optional[Organization] = Relationship(back_populates="calls")
    user: Optional[User] = Relationship(back_populates="calls")
    contact: Optional[Contact] = Relationship(back_populates="calls")
    campaign: Optional[Campaign] = Relationship(back_populates="calls")
    lead: Optional[Lead] = Relationship(back_populates="calls")
    analysis: Optional["CallAnalysis"] = Relationship(back_populates="call")

# =========================
# CallAnalysis
# =========================
class CallAnalysis(SQLModel, table=True):
    analysis_id: UUID = Field(default_factory=uuid4, primary_key=True)
    call_id: UUID = Field(foreign_key="call.call_id", unique=True, index=True)

    job_name: Optional[str] = Field(default=None, index=True)
    transcription_status: str = Field(default="queued")
    s3_uri: Optional[str] = None
    transcript: Optional[str] = None
    transcript_json: Optional[List[Dict]] = Field(
        default=None, sa_column=Column(HebrewJSON)
    )

    summary: Optional[str] = None
    sentiment: Optional[str] = None
    key_points: Optional[List[Dict]] = Field(
        default=None, sa_column=Column(HebrewJSON)
    )
    next_action: Optional[str] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    call: Optional[Call] = Relationship(back_populates="analysis")

# =========================
# LeadComment
# =========================
class LeadComment(SQLModel, table=True):
    comment_id: UUID = Field(default_factory=uuid4, primary_key=True)
    lead_id: UUID = Field(foreign_key="lead.lead_id", index=True)
    org_id: UUID = Field(foreign_key="organization.org_id", index=True)
    user_id: UUID = Field(foreign_key="user.user_id")

    content: str

    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    lead: Optional["Lead"] = Relationship(back_populates="comments")
    user: Optional["User"] = Relationship(back_populates="lead_comments")

# =========================
# LeadStatusHistory
# =========================
class LeadStatusHistory(SQLModel, table=True):
    history_id: UUID = Field(default_factory=uuid4, primary_key=True)
    lead_id: UUID = Field(foreign_key="lead.lead_id", index=True)
    org_id: UUID = Field(foreign_key="organization.org_id", index=True)
    user_id: UUID = Field(foreign_key="user.user_id")

    old_status: str
    new_status: str
    follow_up_date: Optional[datetime] = None
    comment: Optional[str] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    lead: Optional["Lead"] = Relationship(back_populates="status_history")
    user: Optional["User"] = Relationship(back_populates="lead_status_changes")