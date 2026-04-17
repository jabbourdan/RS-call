"""Basic tests for Organization Phone Numbers feature.
Tests model instantiation, schema validation, and field presence.
No end-to-end tests — sync verification only.
"""
import re
from uuid import uuid4
from datetime import datetime

import pytest
from pydantic import ValidationError


# ── Model Instantiation Tests ────────────────────────────────────────────────

class TestOrgPhoneNumberModel:
    def test_create_with_valid_fields(self):
        from app.models.base import OrgPhoneNumber
        phone = OrgPhoneNumber(
            org_id=uuid4(),
            phone_number="+972501234567",
            label="Support Line",
        )
        assert phone.phone_number == "+972501234567"
        assert phone.label == "Support Line"
        assert phone.is_active is True
        assert phone.phone_id is not None

    def test_defaults(self):
        from app.models.base import OrgPhoneNumber
        phone = OrgPhoneNumber(org_id=uuid4(), phone_number="+972501234567")
        assert phone.is_active is True
        assert phone.label is None


class TestOrganizationModel:
    def test_has_max_phone_numbers(self):
        from app.models.base import Organization
        org = Organization(org_name="Test Org")
        assert hasattr(org, "max_phone_numbers")
        assert org.max_phone_numbers == 2


class TestCampaignSettingsModel:
    def test_has_phone_id_fields(self):
        from app.models.base import CampaignSettings
        settings = CampaignSettings(campaign_id=uuid4())
        assert hasattr(settings, "primary_phone_id")
        assert hasattr(settings, "secondary_phone_id")
        assert settings.primary_phone_id is None
        assert settings.secondary_phone_id is None

    def test_no_old_phone_string_fields(self):
        from app.models.base import CampaignSettings
        settings = CampaignSettings(campaign_id=uuid4())
        assert not hasattr(settings, "phone_number_used1")
        assert not hasattr(settings, "phone_number_used2")


# ── Schema Validation Tests ──────────────────────────────────────────────────

class TestPhoneNumberCreateRequest:
    def test_valid_e164(self):
        from app.api.v1.org_phone_numbers import PhoneNumberCreateRequest
        req = PhoneNumberCreateRequest(phone_number="+972501234567", label="Test")
        assert req.phone_number == "+972501234567"

    def test_valid_us_number(self):
        from app.api.v1.org_phone_numbers import PhoneNumberCreateRequest
        req = PhoneNumberCreateRequest(phone_number="+14155551234")
        assert req.phone_number == "+14155551234"

    def test_rejects_no_plus(self):
        from app.api.v1.org_phone_numbers import PhoneNumberCreateRequest
        with pytest.raises(ValidationError):
            PhoneNumberCreateRequest(phone_number="972501234567")

    def test_rejects_empty(self):
        from app.api.v1.org_phone_numbers import PhoneNumberCreateRequest
        with pytest.raises(ValidationError):
            PhoneNumberCreateRequest(phone_number="")

    def test_rejects_local_format(self):
        from app.api.v1.org_phone_numbers import PhoneNumberCreateRequest
        with pytest.raises(ValidationError):
            PhoneNumberCreateRequest(phone_number="0501234567")

    def test_rejects_too_short(self):
        from app.api.v1.org_phone_numbers import PhoneNumberCreateRequest
        with pytest.raises(ValidationError):
            PhoneNumberCreateRequest(phone_number="+0")


class TestPhoneNumberResponse:
    def test_serializes_from_dict(self):
        from app.api.v1.org_phone_numbers import PhoneNumberResponse
        uid = uuid4()
        oid = uuid4()
        now = datetime.utcnow()
        resp = PhoneNumberResponse(
            phone_id=uid,
            org_id=oid,
            phone_number="+972501234567",
            label="Test",
            is_active=True,
            created_at=now,
        )
        assert resp.phone_id == uid
        assert resp.warning is None


class TestCampaignSettingsUpdateRequest:
    def test_accepts_uuid_phone_ids(self):
        from app.api.v1.campaigns import CampaignSettingsUpdateRequest
        uid1 = uuid4()
        uid2 = uuid4()
        req = CampaignSettingsUpdateRequest(
            primary_phone_id=uid1,
            secondary_phone_id=uid2,
        )
        assert req.primary_phone_id == uid1
        assert req.secondary_phone_id == uid2

    def test_no_old_phone_string_fields(self):
        from app.api.v1.campaigns import CampaignSettingsUpdateRequest
        req = CampaignSettingsUpdateRequest()
        assert not hasattr(req, "phone_number_used1")
        assert not hasattr(req, "phone_number_used2")


# ── E.164 Regex Test ─────────────────────────────────────────────────────────

class TestE164Regex:
    E164 = re.compile(r"^\+[1-9]\d{1,14}$")

    @pytest.mark.parametrize("number", [
        "+972501234567",
        "+14155551234",
        "+442071234567",
        "+81312345678",
    ])
    def test_valid_numbers(self, number):
        assert self.E164.match(number)

    @pytest.mark.parametrize("number", [
        "972501234567",
        "+0501234567",
        "0501234567",
        "+",
        "",
        "+972 50 123 4567",
    ])
    def test_invalid_numbers(self, number):
        assert not self.E164.match(number)
