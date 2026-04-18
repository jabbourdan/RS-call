"""Integration tests for Campaign & CampaignSettings endpoints.

Coverage map (data-model.md §Validation Rules):
  V01  name length 2-255                        TestFieldBoundaries
  V02  primary_phone_id cross-tenant            TestPhoneValidation
  V03  secondary_phone_id cross-tenant          TestPhoneValidation
  V04  primary == secondary                     TestPhoneValidation
  V05  calling_algorithm allowed values         TestCallingAlgorithm
  V06  cooldown_minutes >= 0                    TestFieldBoundaries
  V07  max_calls_to_unanswered_lead >= 1        TestFieldBoundaries
  V08  change_number_after >= 1 or null         TestFieldBoundaries
  V09  campaign_status shape                    TestFieldBoundaries
  V10  partial-PATCH preservation               TestCampaignRoundTrip
  V11  settings response enrichment             TestCampaignRoundTrip
  V12  create auto-defaults                     TestCampaignRoundTrip
  V13  delete cascade                           TestCampaignRoundTrip
"""
import uuid
import pytest


# ── V12 + V10 + V11 + V13 ────────────────────────────────────────────────────

class TestCampaignRoundTrip:

    def test_create_auto_defaults(self, client, org_a):
        """V12 — POST with only name yields settings with documented defaults."""
        name = f"Def-{uuid.uuid4().hex[:8]}"
        resp = client.post("/api/v1/campaigns/", json={"name": name}, headers=org_a["headers"])
        assert resp.status_code == 201
        body = resp.json()
        s = body["settings"]
        assert s["max_calls_to_unanswered_lead"] == 3
        assert s["cooldown_minutes"] == 120
        assert s["calling_algorithm"] == "priority"
        assert s["campaign_status"] is not None
        assert "statuses" in s["campaign_status"]
        # cleanup
        client.delete(f"/api/v1/campaigns/{body['campaign_id']}", headers=org_a["headers"])

    def test_partial_patch_preserves_other_fields(self, client, org_a, campaign_a):
        """V10 — PATCH with only cooldown_minutes leaves all other fields unchanged."""
        cid = campaign_a["campaign_id"]
        # first, set a known algorithm
        client.patch(
            f"/api/v1/campaigns/{cid}/settings",
            json={"calling_algorithm": "random"},
            headers=org_a["headers"],
        )
        # now patch only cooldown
        resp = client.patch(
            f"/api/v1/campaigns/{cid}/settings",
            json={"cooldown_minutes": 30},
            headers=org_a["headers"],
        )
        assert resp.status_code == 200
        s = resp.json()
        assert s["cooldown_minutes"] == 30
        assert s["calling_algorithm"] == "random"          # preserved
        assert s["max_calls_to_unanswered_lead"] == 3      # preserved (default)

    def test_phone_enrichment_in_response(self, client, org_a, campaign_a):
        """V11 — PATCH with primary_phone_id returns primary_phone_number string."""
        if org_a["phone_id"] is None:
            pytest.skip("org_a has no phone — check conftest phone creation")
        cid = campaign_a["campaign_id"]
        resp = client.patch(
            f"/api/v1/campaigns/{cid}/settings",
            json={"primary_phone_id": org_a["phone_id"]},
            headers=org_a["headers"],
        )
        assert resp.status_code == 200
        s = resp.json()
        assert s["primary_phone_number"] == org_a["phone_number"]

    def test_delete_cascade(self, client, org_a):
        """V13 — DELETE removes both campaign and its settings (second GET → 404)."""
        name = f"Del-{uuid.uuid4().hex[:8]}"
        create = client.post("/api/v1/campaigns/", json={"name": name}, headers=org_a["headers"])
        assert create.status_code == 201
        cid = create.json()["campaign_id"]

        del_resp = client.delete(f"/api/v1/campaigns/{cid}", headers=org_a["headers"])
        assert del_resp.status_code == 204

        get_resp = client.get(f"/api/v1/campaigns/{cid}", headers=org_a["headers"])
        assert get_resp.status_code == 404


# ── V05 ───────────────────────────────────────────────────────────────────────

class TestCallingAlgorithm:

    @pytest.mark.parametrize("algorithm", ["priority", "random", "sequential"])
    def test_valid_algorithms_accepted(self, client, org_a, campaign_a, algorithm):
        """V05 happy — each of the three supported algorithms round-trips."""
        cid = campaign_a["campaign_id"]
        resp = client.patch(
            f"/api/v1/campaigns/{cid}/settings",
            json={"calling_algorithm": algorithm},
            headers=org_a["headers"],
        )
        assert resp.status_code == 200, resp.text
        assert resp.json()["calling_algorithm"] == algorithm

    @pytest.mark.parametrize("bad_value", ["fifo", "round_robin", "garbage"])
    def test_invalid_algorithms_rejected(self, client, org_a, campaign_a, bad_value):
        """V05 negative — legacy and unknown values return 400 naming supported values."""
        cid = campaign_a["campaign_id"]
        resp = client.patch(
            f"/api/v1/campaigns/{cid}/settings",
            json={"calling_algorithm": bad_value},
            headers=org_a["headers"],
        )
        assert resp.status_code == 400, resp.text
        detail = resp.json().get("detail", "")
        assert "priority" in detail
        assert "random" in detail
        assert "sequential" in detail


# ── V02 + V03 + V04 ──────────────────────────────────────────────────────────

class TestPhoneValidation:

    def test_cross_tenant_primary_phone_rejected(self, client, org_a, org_b, campaign_b):
        """V02 — using org_a's phone as primary_phone_id in org_b's campaign → 400."""
        if org_a["phone_id"] is None:
            pytest.skip("org_a has no phone")
        cid = campaign_b["campaign_id"]
        resp = client.patch(
            f"/api/v1/campaigns/{cid}/settings",
            json={"primary_phone_id": org_a["phone_id"]},
            headers=org_b["headers"],
        )
        assert resp.status_code == 400, resp.text

    def test_cross_tenant_secondary_phone_rejected(self, client, org_a, org_b, campaign_b):
        """V03 — using org_a's phone as secondary_phone_id in org_b's campaign → 400."""
        if org_a["phone_id"] is None:
            pytest.skip("org_a has no phone")
        cid = campaign_b["campaign_id"]
        resp = client.patch(
            f"/api/v1/campaigns/{cid}/settings",
            json={"secondary_phone_id": org_a["phone_id"]},
            headers=org_b["headers"],
        )
        assert resp.status_code == 400, resp.text

    def test_same_phone_for_primary_and_secondary_rejected(self, client, org_a, campaign_a):
        """V04 — same UUID for both primary and secondary → 400 with clear message."""
        if org_a["phone_id"] is None:
            pytest.skip("org_a has no phone")
        cid = campaign_a["campaign_id"]
        resp = client.patch(
            f"/api/v1/campaigns/{cid}/settings",
            json={
                "primary_phone_id": org_a["phone_id"],
                "secondary_phone_id": org_a["phone_id"],
            },
            headers=org_a["headers"],
        )
        assert resp.status_code == 400, resp.text
        detail = resp.json().get("detail", "")
        assert "different" in detail.lower() or "same" in detail.lower() or "primary" in detail.lower()


# ── V01 + V06 + V07 + V08 + V09 ─────────────────────────────────────────────

class TestFieldBoundaries:

    # V01 — campaign name
    def test_name_too_short_rejected(self, client, org_a):
        resp = client.post("/api/v1/campaigns/", json={"name": "A"}, headers=org_a["headers"])
        assert resp.status_code == 422

    def test_name_min_length_accepted(self, client, org_a):
        name = f"AB-{uuid.uuid4().hex[:6]}"
        resp = client.post("/api/v1/campaigns/", json={"name": name}, headers=org_a["headers"])
        assert resp.status_code == 201
        client.delete(f"/api/v1/campaigns/{resp.json()['campaign_id']}", headers=org_a["headers"])

    def test_name_too_long_rejected(self, client, org_a):
        resp = client.post("/api/v1/campaigns/", json={"name": "X" * 256}, headers=org_a["headers"])
        assert resp.status_code == 422

    # V06 — cooldown_minutes
    def test_cooldown_negative_rejected(self, client, org_a, campaign_a):
        resp = client.patch(
            f"/api/v1/campaigns/{campaign_a['campaign_id']}/settings",
            json={"cooldown_minutes": -1},
            headers=org_a["headers"],
        )
        assert resp.status_code == 422

    def test_cooldown_zero_accepted(self, client, org_a, campaign_a):
        resp = client.patch(
            f"/api/v1/campaigns/{campaign_a['campaign_id']}/settings",
            json={"cooldown_minutes": 0},
            headers=org_a["headers"],
        )
        assert resp.status_code == 200
        assert resp.json()["cooldown_minutes"] == 0

    # V07 — max_calls_to_unanswered_lead
    def test_max_calls_zero_rejected(self, client, org_a, campaign_a):
        resp = client.patch(
            f"/api/v1/campaigns/{campaign_a['campaign_id']}/settings",
            json={"max_calls_to_unanswered_lead": 0},
            headers=org_a["headers"],
        )
        assert resp.status_code == 422

    def test_max_calls_one_accepted(self, client, org_a, campaign_a):
        resp = client.patch(
            f"/api/v1/campaigns/{campaign_a['campaign_id']}/settings",
            json={"max_calls_to_unanswered_lead": 1},
            headers=org_a["headers"],
        )
        assert resp.status_code == 200
        assert resp.json()["max_calls_to_unanswered_lead"] == 1

    # V08 — change_number_after
    def test_change_number_after_zero_rejected(self, client, org_a, campaign_a):
        resp = client.patch(
            f"/api/v1/campaigns/{campaign_a['campaign_id']}/settings",
            json={"change_number_after": 0},
            headers=org_a["headers"],
        )
        assert resp.status_code == 422

    def test_change_number_after_one_accepted(self, client, org_a, campaign_a):
        resp = client.patch(
            f"/api/v1/campaigns/{campaign_a['campaign_id']}/settings",
            json={"change_number_after": 1},
            headers=org_a["headers"],
        )
        assert resp.status_code == 200
        assert resp.json()["change_number_after"] == 1

    def test_change_number_after_null_accepted(self, client, org_a, campaign_a):
        resp = client.patch(
            f"/api/v1/campaigns/{campaign_a['campaign_id']}/settings",
            json={"change_number_after": None},
            headers=org_a["headers"],
        )
        assert resp.status_code == 200

    # V09 — campaign_status shape
    def test_campaign_status_valid_list_accepted(self, client, org_a, campaign_a):
        resp = client.patch(
            f"/api/v1/campaigns/{campaign_a['campaign_id']}/settings",
            json={"campaign_status": {"statuses": ["ממתין", "ענה", "Active"]}},
            headers=org_a["headers"],
        )
        assert resp.status_code == 200
        assert resp.json()["campaign_status"]["statuses"] == ["ממתין", "ענה", "Active"]

    def test_campaign_status_non_dict_rejected(self, client, org_a, campaign_a):
        resp = client.patch(
            f"/api/v1/campaigns/{campaign_a['campaign_id']}/settings",
            json={"campaign_status": "not-a-dict"},
            headers=org_a["headers"],
        )
        assert resp.status_code == 422
