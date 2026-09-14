"""
Unit and Integration Tests for SIH26017 FastAPI Backend.
"""

import os
import sys

# Ensure repository root is in python path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

import pytest
from fastapi.testclient import TestClient
from src.api.app import app

client = TestClient(app)


def test_api_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "Operational"
    assert "Ministry of Rural Development" in data["authority"]

def test_list_projects():
    response = client.get("/projects?page=1&page_size=10")
    assert response.status_code == 200
    data = response.json()
    assert data["total_projects"] == 1477
    assert len(data["projects"]) == 10
    first = data["projects"][0]
    assert "project_code" in first
    assert "risk_score" in first
    assert "risk_category" in first

def test_filter_projects_by_sector():
    response = client.get("/projects?sector=POWER&page_size=5")
    assert response.status_code == 200
    data = response.json()
    assert data["total_projects"] > 0
    for p in data["projects"]:
        assert p["sector"] == "POWER"

def test_risks_summary():
    response = client.get("/risks")
    assert response.status_code == 200
    data = response.json()
    assert data["total_projects"] == 1477
    assert "CRITICAL" in data["counts_by_risk_category"]
    assert "HIGH" in data["counts_by_risk_category"]
    assert len(data["priority_queue"]) > 0

def test_geo_projects():
    response = client.get("/geo/projects")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1477
    first = data[0]
    assert "latitude" in first
    assert "longitude" in first
    assert "State-level centroid" in first["geo_precision"]

def test_project_detail_and_risk_and_explanation():
    # Fetch first project code from list
    list_res = client.get("/projects?page_size=1")
    code = list_res.json()["projects"][0]["project_code"]

    # 1. Detail
    detail_res = client.get(f"/projects/{code}")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["project_code"] == code
    assert "recommended_action" in detail

    # 2. Risk
    risk_res = client.get(f"/projects/{code}/risk")
    assert risk_res.status_code == 200
    risk = risk_res.json()
    assert 0 <= risk["risk_score"] <= 100
    assert risk["risk_category"] in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]

    # 3. Explanation
    expl_res = client.get(f"/projects/{code}/explanation")
    assert expl_res.status_code == 200
    expl = expl_res.json()
    assert len(expl["top_risk_drivers"]) > 0
    assert "disclaimer" in expl
    assert "DECISION SUPPORT ONLY" in expl["disclaimer"]

def test_missing_project_error():
    response = client.get("/projects/NONEXISTENT_CODE_9999")
    assert response.status_code == 404

if __name__ == "__main__":
    sys.exit(pytest.main([__file__, "-v"]))


