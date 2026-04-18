"""Shared pytest fixtures for campaign endpoint integration tests.

Uses FastAPI TestClient (synchronous) backed by the real dev database.
Session-scoped fixtures create test orgs/users once per test run using
unique UUIDs in names to avoid cross-run collisions.
Function-scoped campaign fixtures create/delete per test for isolation.
"""
import uuid
from typing import Optional
import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:
        yield c


def _register_org(client: TestClient, suffix: str, phone_number: Optional[str] = None) -> dict:
    resp = client.post("/api/v1/auth/register", json={
        "org_name": f"TestOrg-{suffix}",
        "full_name": "Test Owner",
        "email": f"owner-{suffix}@example.com",
        "password": "Password123!",
        "max_phone_numbers": 5,
    })
    assert resp.status_code == 201, f"Register failed: {resp.text}"
    data = resp.json()
    token = data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    result = {
        "org_id": data["org_id"],
        "token": token,
        "headers": headers,
        "phone_id": None,
        "phone_number": None,
    }
    if phone_number:
        ph = client.post(
            "/api/v1/organizations/phone-numbers",
            json={"phone_number": phone_number, "label": "test"},
            headers=headers,
        )
        assert ph.status_code == 201, f"Phone create failed: {ph.text}"
        result["phone_id"] = ph.json()["phone_id"]
        result["phone_number"] = ph.json()["phone_number"]
    return result


@pytest.fixture(scope="session")
def org_a(client):
    """Primary test org with one phone number."""
    suffix = uuid.uuid4().hex[:10]
    yield _register_org(client, f"A-{suffix}", phone_number="+972500000001")


@pytest.fixture(scope="session")
def org_b(client):
    """Secondary test org for cross-tenant validation tests."""
    suffix = uuid.uuid4().hex[:10]
    yield _register_org(client, f"B-{suffix}")


@pytest.fixture
def campaign_a(client, org_a):
    """Campaign in org_a — created fresh, deleted after each test."""
    name = f"Camp-{uuid.uuid4().hex[:8]}"
    resp = client.post("/api/v1/campaigns/", json={"name": name}, headers=org_a["headers"])
    assert resp.status_code == 201, f"Campaign create failed: {resp.text}"
    campaign = resp.json()
    yield campaign
    client.delete(f"/api/v1/campaigns/{campaign['campaign_id']}", headers=org_a["headers"])


@pytest.fixture
def campaign_b(client, org_b):
    """Campaign in org_b — created fresh, deleted after each test."""
    name = f"Camp-{uuid.uuid4().hex[:8]}"
    resp = client.post("/api/v1/campaigns/", json={"name": name}, headers=org_b["headers"])
    assert resp.status_code == 201, f"Campaign create failed: {resp.text}"
    campaign = resp.json()
    yield campaign
    client.delete(f"/api/v1/campaigns/{campaign['campaign_id']}", headers=org_b["headers"])
