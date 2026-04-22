"""Integration tests for lead briefing endpoints + service logic.

Coverage map (spec.md / tasks.md §US1 + §US2 + §US3):
  T015  GET returns 404 when no briefing exists         TestGetBriefing
  T016  POST creates briefing first time                 TestCreateOrRegenerateBriefing
  T017  POST rejects cross-org lead                      TestCreateOrRegenerateBriefing
  T018  POST on Groq failure does not write row          TestCreateOrRegenerateBriefing
  T019  POST with empty Groq output returns 502          TestCreateOrRegenerateBriefing
  T033  POST uses campaign briefing_prompt_override      TestCampaignPromptOverride
  T034  PATCH rejects empty briefing_prompt_override     TestCampaignPromptValidation
  T035  PATCH rejects >4000-char briefing prompt         TestCampaignPromptValidation
  T036  PATCH with null reverts to default               TestCampaignPromptValidation
  T046  POST regenerate replaces existing row            TestCreateOrRegenerateBriefing

Per project testing preferences: basic sync integration tests via
FastAPI TestClient, hitting the real dev DB, with `LLMClient.complete`
monkey-patched so Groq is never called.
"""
import uuid
from unittest.mock import patch

import pytest

from app.integrations.llm_client import LLMClient


FAKE_BRIEFING_DEFAULT = "דניאל, גר ברמת גן, מחפש דירת 3 חדרים עד 6500 ₪. זווית פתיחה: התעניין בתקציב."
FAKE_BRIEFING_CUSTOM = "דגש-תקציב: דניאל, תקציב 6500 ₪, מימון פתוח לבדיקה."


@pytest.fixture
def lead_factory(client):
    """Creates leads inside a given campaign and cleans them up at teardown —
    required because the campaign-cleanup in conftest cannot delete a campaign
    that still has leads (lead.campaign_id is NOT NULL)."""
    created: list[tuple[str, str, dict]] = []  # (campaign_id, lead_id, headers)

    def _make(campaign_id: str, headers: dict, *, extra_data=None):
        phone_number = f"+97255{uuid.uuid4().int % 10_000_000:07d}"
        payload = {
            "phone_number": phone_number,
            "name": "דניאל כהן",
            "email": "daniel@example.com",
        }
        if extra_data is not None:
            payload["extra_data"] = extra_data
        resp = client.post(
            f"/api/v1/leads/{campaign_id}/create",
            json=payload,
            headers=headers,
        )
        assert resp.status_code == 201, f"Lead create failed: {resp.text}"
        lead = resp.json()
        created.append((campaign_id, lead["lead_id"], headers))
        return lead

    yield _make

    # Teardown: delete leads in reverse creation order.
    for cid, lid, hdrs in reversed(created):
        client.delete(f"/api/v1/leads/{cid}/{lid}", headers=hdrs)


# ── GET /leads/{lead_id}/briefing ────────────────────────────────────────────

class TestGetBriefing:

    def test_get_returns_404_when_empty(self, client, org_a, campaign_a, lead_factory):
        """T015 — Agent opens a lead that has no briefing yet → 404 (empty state)."""
        lead = lead_factory(
            campaign_a["campaign_id"], org_a["headers"],
            extra_data={"neighborhood": "רמת גן", "budget": "6500"},
        )
        resp = client.get(
            f"/api/v1/leads/{lead['lead_id']}/briefing",
            headers=org_a["headers"],
        )
        assert resp.status_code == 404


# ── POST /leads/{lead_id}/briefing ───────────────────────────────────────────

class TestCreateOrRegenerateBriefing:

    def test_post_creates_briefing_first_time(self, client, org_a, campaign_a, lead_factory):
        """T016 — First POST creates a briefing using the system default prompt."""
        lead = lead_factory(
            campaign_a["campaign_id"], org_a["headers"],
            extra_data={"neighborhood": "רמת גן", "budget": "6500", "bedrooms": 3},
        )

        with patch.object(LLMClient, "complete", return_value=FAKE_BRIEFING_DEFAULT):
            resp = client.post(
                f"/api/v1/leads/{lead['lead_id']}/briefing",
                headers=org_a["headers"],
            )

        assert resp.status_code == 201, resp.text
        body = resp.json()
        assert body["lead_id"] == lead["lead_id"]
        assert body["briefing_text"] == FAKE_BRIEFING_DEFAULT
        assert body["prompt_version"] == "default-v1"
        assert body["generated_at"] is not None

        # GET now returns the briefing
        get_resp = client.get(
            f"/api/v1/leads/{lead['lead_id']}/briefing",
            headers=org_a["headers"],
        )
        assert get_resp.status_code == 200
        assert get_resp.json()["briefing_text"] == FAKE_BRIEFING_DEFAULT

    def test_post_rejects_cross_org_lead(self, client, org_a, org_b, campaign_b, lead_factory):
        """T017 — org_a user calling POST on a lead in org_b → 404; no row written."""
        # Seed a lead in org_b
        lead_b = lead_factory(campaign_b["campaign_id"], org_b["headers"])

        with patch.object(LLMClient, "complete", return_value=FAKE_BRIEFING_DEFAULT) as mock_complete:
            resp = client.post(
                f"/api/v1/leads/{lead_b['lead_id']}/briefing",
                headers=org_a["headers"],
            )
        assert resp.status_code == 404
        # Groq must not have been called for a cross-org request.
        mock_complete.assert_not_called()

        # And GET from the real owner (org_b) still returns 404 (no row written).
        get_resp = client.get(
            f"/api/v1/leads/{lead_b['lead_id']}/briefing",
            headers=org_b["headers"],
        )
        assert get_resp.status_code == 404

    def test_post_groq_failure_does_not_write_row(self, client, org_a, campaign_a, lead_factory):
        """T018 — Groq raises → 502 and no row is persisted."""
        lead = lead_factory(campaign_a["campaign_id"], org_a["headers"])

        def _boom(*_, **__):
            raise RuntimeError("groq down")

        with patch.object(LLMClient, "complete", side_effect=_boom):
            resp = client.post(
                f"/api/v1/leads/{lead['lead_id']}/briefing",
                headers=org_a["headers"],
            )
        assert resp.status_code == 502

        get_resp = client.get(
            f"/api/v1/leads/{lead['lead_id']}/briefing",
            headers=org_a["headers"],
        )
        assert get_resp.status_code == 404

    def test_post_groq_returns_empty_string(self, client, org_a, campaign_a, lead_factory):
        """T019 — Groq returns whitespace → 502; no row written."""
        lead = lead_factory(campaign_a["campaign_id"], org_a["headers"])

        with patch.object(LLMClient, "complete", return_value="   "):
            resp = client.post(
                f"/api/v1/leads/{lead['lead_id']}/briefing",
                headers=org_a["headers"],
            )
        assert resp.status_code == 502

        get_resp = client.get(
            f"/api/v1/leads/{lead['lead_id']}/briefing",
            headers=org_a["headers"],
        )
        assert get_resp.status_code == 404

    def test_post_regenerates_replaces_existing_row(self, client, org_a, campaign_a, lead_factory):
        """T046 — Second POST upserts: same briefing_id, new text, newer generated_at."""
        lead = lead_factory(campaign_a["campaign_id"], org_a["headers"])

        with patch.object(LLMClient, "complete", return_value="first briefing"):
            first = client.post(
                f"/api/v1/leads/{lead['lead_id']}/briefing",
                headers=org_a["headers"],
            )
        assert first.status_code == 201
        first_body = first.json()

        with patch.object(LLMClient, "complete", return_value="second briefing"):
            second = client.post(
                f"/api/v1/leads/{lead['lead_id']}/briefing",
                headers=org_a["headers"],
            )
        assert second.status_code == 200   # regenerate → 200, not 201
        second_body = second.json()

        assert second_body["briefing_id"] == first_body["briefing_id"]
        assert second_body["briefing_text"] == "second briefing"
        assert second_body["generated_at"] >= first_body["generated_at"]


# ── Campaign-scoped prompt override ──────────────────────────────────────────

class TestCampaignPromptOverride:

    def test_post_uses_campaign_override(self, client, org_a, campaign_a, lead_factory):
        """T033 — briefing_prompt_override on the campaign wins; prompt_version flips."""
        cid = campaign_a["campaign_id"]
        custom = "הדגש במיוחד תקציב ומימון עבור הליד הזה."
        patch_resp = client.patch(
            f"/api/v1/campaigns/{cid}/settings",
            json={"briefing_prompt_override": custom},
            headers=org_a["headers"],
        )
        assert patch_resp.status_code == 200, patch_resp.text
        assert patch_resp.json()["briefing_prompt_override"] == custom

        lead = lead_factory(cid, org_a["headers"])

        captured = {}

        def _capture(system_prompt, user_prompt, **_):
            captured["system"] = system_prompt
            captured["user"] = user_prompt
            return FAKE_BRIEFING_CUSTOM

        with patch.object(LLMClient, "complete", side_effect=_capture):
            resp = client.post(
                f"/api/v1/leads/{lead['lead_id']}/briefing",
                headers=org_a["headers"],
            )
        assert resp.status_code == 201, resp.text
        body = resp.json()
        assert body["prompt_version"] == "campaign-custom"
        assert body["briefing_text"] == FAKE_BRIEFING_CUSTOM
        # The captured system_prompt must be exactly the override (stripped).
        assert captured["system"] == custom


class TestCampaignPromptValidation:

    def test_patch_rejects_empty_briefing_prompt(self, client, org_a, campaign_a):
        """T034 — Empty string on briefing_prompt_override → 422."""
        cid = campaign_a["campaign_id"]
        resp = client.patch(
            f"/api/v1/campaigns/{cid}/settings",
            json={"briefing_prompt_override": "   "},
            headers=org_a["headers"],
        )
        assert resp.status_code == 422, resp.text

    def test_patch_rejects_long_briefing_prompt(self, client, org_a, campaign_a):
        """T035 — >4000-char briefing_prompt_override → 422."""
        cid = campaign_a["campaign_id"]
        resp = client.patch(
            f"/api/v1/campaigns/{cid}/settings",
            json={"briefing_prompt_override": "א" * 4001},
            headers=org_a["headers"],
        )
        assert resp.status_code == 422, resp.text

    def test_revert_briefing_prompt_flag_reverts_to_default(self, client, org_a, campaign_a, lead_factory):
        """T036 — revert_briefing_prompt=true clears the override; subsequent briefing
        uses default-v1. Mirrors the `revert_summary_prompt` pattern from feature 005.
        """
        cid = campaign_a["campaign_id"]
        custom = "הדגש במיוחד תקציב ומימון עבור הליד הזה."
        # First set a custom prompt.
        set_resp = client.patch(
            f"/api/v1/campaigns/{cid}/settings",
            json={"briefing_prompt_override": custom},
            headers=org_a["headers"],
        )
        assert set_resp.status_code == 200, set_resp.text
        # Then clear it via the revert flag.
        clear_resp = client.patch(
            f"/api/v1/campaigns/{cid}/settings",
            json={"revert_briefing_prompt": True},
            headers=org_a["headers"],
        )
        assert clear_resp.status_code == 200
        assert clear_resp.json()["briefing_prompt_override"] is None

        lead = lead_factory(cid, org_a["headers"])
        with patch.object(LLMClient, "complete", return_value=FAKE_BRIEFING_DEFAULT):
            resp = client.post(
                f"/api/v1/leads/{lead['lead_id']}/briefing",
                headers=org_a["headers"],
            )
        assert resp.status_code == 201, resp.text
        assert resp.json()["prompt_version"] == "default-v1"
