"""Basic tests for the 008-settings-admin-edit feature.
Covers schema validation for OrgSettingsUpdateRequest and OrgSettingsResponse.
Follows the project's sync-test preference — no live DB or HTTP client.
"""
from uuid import uuid4

import pytest
from pydantic import ValidationError


# ── OrgSettingsUpdateRequest ────────────────────────────────────────────────

class TestOrgSettingsUpdateRequest:
    def test_all_fields_optional(self):
        from app.api.v1.org_phone_numbers import OrgSettingsUpdateRequest
        req = OrgSettingsUpdateRequest()
        assert req.org_name is None
        assert req.bus_type is None
        assert req.max_phone_numbers is None

    def test_partial_update_org_name_only(self):
        from app.api.v1.org_phone_numbers import OrgSettingsUpdateRequest
        req = OrgSettingsUpdateRequest(org_name="Acme Ltd")
        assert req.org_name == "Acme Ltd"
        assert req.bus_type is None
        assert req.max_phone_numbers is None

    def test_partial_update_bus_type_only(self):
        from app.api.v1.org_phone_numbers import OrgSettingsUpdateRequest
        req = OrgSettingsUpdateRequest(bus_type="Real Estate")
        assert req.bus_type == "Real Estate"

    def test_full_update(self):
        from app.api.v1.org_phone_numbers import OrgSettingsUpdateRequest
        req = OrgSettingsUpdateRequest(
            org_name="Acme", bus_type="Retail", max_phone_numbers=5
        )
        assert req.org_name == "Acme"
        assert req.bus_type == "Retail"
        assert req.max_phone_numbers == 5

    def test_rejects_org_name_too_short(self):
        from app.api.v1.org_phone_numbers import OrgSettingsUpdateRequest
        with pytest.raises(ValidationError):
            OrgSettingsUpdateRequest(org_name="A")

    def test_rejects_org_name_too_long(self):
        from app.api.v1.org_phone_numbers import OrgSettingsUpdateRequest
        with pytest.raises(ValidationError):
            OrgSettingsUpdateRequest(org_name="x" * 256)

    def test_trims_org_name_whitespace(self):
        from app.api.v1.org_phone_numbers import OrgSettingsUpdateRequest
        req = OrgSettingsUpdateRequest(org_name="  Acme  ")
        assert req.org_name == "Acme"

    def test_rejects_max_phone_numbers_below_one(self):
        from app.api.v1.org_phone_numbers import OrgSettingsUpdateRequest
        with pytest.raises(ValidationError):
            OrgSettingsUpdateRequest(max_phone_numbers=0)

    def test_ignores_unknown_plan_field(self):
        """FR-017: plan must not be bindable through the API. Extra fields
        are silently dropped by Pydantic's default config, so sending
        {"plan": "enterprise"} will not change the org's plan."""
        from app.api.v1.org_phone_numbers import OrgSettingsUpdateRequest
        req = OrgSettingsUpdateRequest.model_validate({"plan": "enterprise"})
        assert not hasattr(req, "plan") or getattr(req, "plan", None) is None
        assert req.org_name is None
        assert req.bus_type is None
        assert req.max_phone_numbers is None


# ── OrgSettingsResponse ─────────────────────────────────────────────────────

class TestOrgSettingsResponse:
    def test_serializes_from_dict(self):
        from app.api.v1.org_phone_numbers import OrgSettingsResponse
        resp = OrgSettingsResponse(
            org_id=uuid4(),
            org_name="Acme",
            plan="free",
            bus_type="Real Estate",
            max_phone_numbers=2,
            num_agents=1,
        )
        assert resp.org_name == "Acme"
        assert resp.plan == "free"
        assert resp.bus_type == "Real Estate"
        assert resp.max_phone_numbers == 2
        assert resp.num_agents == 1

    def test_bus_type_optional(self):
        from app.api.v1.org_phone_numbers import OrgSettingsResponse
        resp = OrgSettingsResponse(
            org_id=uuid4(),
            org_name="Acme",
            plan="free",
            max_phone_numbers=2,
            num_agents=1,
        )
        assert resp.bus_type is None


# ── Endpoint contract wiring ────────────────────────────────────────────────

class TestSettingsEndpointsWiring:
    def test_get_endpoint_registered(self):
        """GET /organizations/settings must be exposed by the router."""
        from app.api.v1.org_phone_numbers import router
        routes = [(r.path, tuple(sorted(r.methods))) for r in router.routes]
        assert ("/organizations/settings", ("GET",)) in routes

    def test_patch_endpoint_registered(self):
        from app.api.v1.org_phone_numbers import router
        routes = [(r.path, tuple(sorted(r.methods))) for r in router.routes]
        assert ("/organizations/settings", ("PATCH",)) in routes

    def test_patch_uses_admin_dependency(self):
        """FR-015/FR-016: writes require admin role. The handler must depend
        on require_admin so the framework enforces the gate before any DB work."""
        from app.api.v1 import org_phone_numbers as module
        from app.core.dependencies import require_admin
        # Inspect the handler's signature: its current_user default should be
        # Depends(require_admin).
        import inspect
        sig = inspect.signature(module.update_org_settings)
        current_user_param = sig.parameters["current_user"]
        # Depends(...) objects carry the dependency callable.
        assert current_user_param.default.dependency is require_admin

    def test_get_uses_current_user_dependency(self):
        from app.api.v1 import org_phone_numbers as module
        from app.core.dependencies import get_current_user
        import inspect
        sig = inspect.signature(module.get_org_settings)
        current_user_param = sig.parameters["current_user"]
        assert current_user_param.default.dependency is get_current_user
