"""
Phase 5 Tests: Authentication, Role-Based Access Control, Interventions & Audit Trail.
"""

import pytest
from fastapi.testclient import TestClient
from src.api.app import app

client = TestClient(app)

def test_login_success_admin():
    res = client.post("/api/auth/login", json={"username": "admin", "password": "sih26017"})
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["role"] == "Admin"
    assert data["user"]["username"] == "admin"
    assert "Ministry of Rural Development" in data["user"]["department"] or "MoRD" in data["user"]["department"]

def test_login_success_viewer():
    res = client.post("/api/auth/login", json={"username": "viewer", "password": "viewer123"})
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["role"] == "Viewer"
    assert data["user"]["username"] == "viewer"

def test_login_failure_invalid_credentials():
    res = client.post("/api/auth/login", json={"username": "admin", "password": "wrongpassword"})
    assert res.status_code == 401
    assert "Invalid credentials" in res.json()["detail"]

def test_get_me_unauthorized():
    res = client.get("/api/auth/me")
    assert res.status_code == 401

def test_get_me_authorized():
    # Login as admin
    login_res = client.post("/api/auth/login", json={"username": "admin", "password": "sih26017"})
    token = login_res.json()["access_token"]

    res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert res.json()["username"] == "admin"
    assert res.json()["role"] == "Admin"

def test_intervention_rbac_viewer_forbidden():
    # Login as viewer
    viewer_res = client.post("/api/auth/login", json={"username": "viewer", "password": "viewer123"})
    viewer_token = viewer_res.json()["access_token"]

    # Attempt to post intervention
    res = client.post(
        "/api/interventions",
        json={
            "project_code": "1",
            "intervention_type": "Joint Survey",
            "notes": "Testing unauthorized action"
        },
        headers={"Authorization": f"Bearer {viewer_token}"}
    )
    assert res.status_code == 403
    assert "Requires MoRD Administrative clearance" in res.json()["detail"]

def test_intervention_creation_and_audit_trail():
    # Login as admin
    admin_res = client.post("/api/auth/login", json={"username": "admin", "password": "sih26017"})
    admin_token = admin_res.json()["access_token"]

    # 1. Fetch valid project code
    list_res = client.get("/projects?page_size=1")
    project_code = list_res.json()["projects"][0]["project_code"]

    # 2. Record intervention as admin
    notes = "Convene SLAO joint field verification with District Collector"
    int_res = client.post(
        "/api/interventions",
        json={
            "project_code": project_code,
            "intervention_type": "SLAO Field Deployment",
            "notes": notes
        },
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert int_res.status_code == 201
    int_data = int_res.json()
    assert int_data["project_code"] == project_code
    assert int_data["username"] == "admin"
    assert int_data["intervention_type"] == "SLAO Field Deployment"

    # 3. Retrieve project interventions
    fetch_res = client.get(f"/api/projects/{project_code}/interventions")
    assert fetch_res.status_code == 200
    interventions = fetch_res.json()
    assert len(interventions) >= 1
    assert any(i["notes"] == notes for i in interventions)

    # 4. Check audit log as admin
    audit_res = client.get("/api/audit-logs", headers={"Authorization": f"Bearer {admin_token}"})
    assert audit_res.status_code == 200
    audit_data = audit_res.json()
    assert audit_data["total"] > 0
    actions = [item["action"] for item in audit_data["items"]]
    assert "INTERVENTION_CREATED" in actions
