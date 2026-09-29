"""
Automated Unit and Integration Tests for Phase 6:
What-If Counterfactual Simulation Engine & RFCTLARR Act 2013 Statutory Compliance.
"""

import pytest
from fastapi.testclient import TestClient
from src.api.app import app
from src.api.service import get_service
from src.regulatory.rfctlarr import RFCTLARRStatutoryEngine

client = TestClient(app)

def test_rfctlarr_statutory_evaluation():
    """Verifies that RFCTLARR statutory engine properly detects Section 25 lapsing risk."""
    project_high_delay = {
        'project_code': 'TEST_PROJ_01',
        'project_name': 'Expressway Corridor Expansion',
        'sector': 'ROAD TRANSPORT AND HIGHWAYS',
        'state': 'MAHARASHTRA',
        'orig_cost_cr': 1800.0,
        'delay_months': 36,
        'is_delayed': 1,
        'risk_score': 88
    }
    
    evaluation = RFCTLARRStatutoryEngine.evaluate_project_compliance(project_high_delay)
    
    assert evaluation['project_code'] == 'TEST_PROJ_01'
    assert evaluation['lapsing_risk_level'] == 'CRITICAL'
    assert evaluation['section_25_deadline_flag'] is True
    assert evaluation['urgency_clause_eligible'] is True
    assert len(evaluation['statutory_directives']) >= 2
    
    refs = [d['statutory_ref'] for d in evaluation['statutory_directives']]
    assert any('Section 25' in r for r in refs)

def test_rfctlarr_notice_generation():
    """Verifies generation of formal Government of India executive compliance memorandum."""
    project_data = {
        'project_code': 'TEST_PROJ_02',
        'project_name': 'Interstate High Speed Rail',
        'agency': 'NHSRCL',
        'sector': 'RAILWAYS',
        'state': 'GUJARAT',
        'orig_cost_cr': 4500.0,
        'delay_months': 14,
        'is_delayed': 1,
        'risk_score': 76
    }
    
    memo = RFCTLARRStatutoryEngine.generate_executive_memorandum(
        project_data,
        recipient_title="District Collector & District Magistrate",
        custom_notes="Complete Joint Measurement Survey before upcoming assembly session."
    )
    
    assert "MINISTRY OF RURAL DEVELOPMENT" in memo['formatted_document']
    assert "MEMORANDUM NO:" in memo['formatted_document']
    assert "TEST_PROJ_02" in memo['formatted_document']
    assert "Section 25" in memo['formatted_document']
    assert "Complete Joint Measurement Survey" in memo['formatted_document']

def test_simulation_engine_reduces_risk():
    """Verifies that applying counterfactual policy levers decreases the predicted delay risk."""
    service = get_service()
    summary = service.get_risks_summary()
    assert len(summary['priority_queue']) > 0
    top_project = summary['priority_queue'][0]
    p_code = top_project['project_code']

    res_base = service.simulate_project(
        project_code=p_code,
        package_split_count=1,
        contingency_budget_pct=0.0,
        dedicated_slao_taskforce=False,
        parallel_statutory_hearings=False,
        row_pre_possession_pct=50.0,
        execution_buffer_months=0
    )
    assert res_base is not None
    assert res_base['baseline']['risk_score'] > 0

    res_mitigated = service.simulate_project(
        project_code=p_code,
        package_split_count=3,
        contingency_budget_pct=15.0,
        dedicated_slao_taskforce=True,
        parallel_statutory_hearings=True,
        row_pre_possession_pct=90.0,
        execution_buffer_months=6
    )
    assert res_mitigated is not None
    
    assert res_mitigated['simulated']['risk_score'] < res_mitigated['baseline']['risk_score']
    assert res_mitigated['metrics']['risk_score_delta'] < 0
    assert res_mitigated['metrics']['months_overrun_avoided'] >= 0
    assert res_mitigated['metrics']['capital_escalation_saved_cr'] >= 0
    assert len(res_mitigated['lever_breakdown']) >= 4

def test_api_simulation_endpoint():
    """Tests POST /api/projects/{code}/simulate endpoint."""
    service = get_service()
    first_project = service.df.iloc[0]['project_code']

    response = client.post(
        f"/api/projects/{first_project}/simulate",
        json={
            "package_split_count": 2,
            "contingency_budget_pct": 10.0,
            "dedicated_slao_taskforce": True,
            "parallel_statutory_hearings": True,
            "row_pre_possession_pct": 85.0,
            "execution_buffer_months": 4
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "baseline" in data
    assert "simulated" in data
    assert "metrics" in data
    assert data["metrics"]["percentage_reduction"] >= 0

def test_api_custom_simulation_endpoint():
    """Tests POST /api/simulation/custom endpoint for pre-sanction testing."""
    response = client.post(
        "/api/simulation/custom",
        json={
            "sector": "ROAD TRANSPORT AND HIGHWAYS",
            "state": "BIHAR",
            "agency": "NHAI",
            "orig_cost_cr": 2400.0,
            "planned_duration_months": 36.0,
            "approval_year": 2024,
            "simulation_levers": {
                "package_split_count": 3,
                "contingency_budget_pct": 12.0,
                "dedicated_slao_taskforce": True,
                "parallel_statutory_hearings": True,
                "row_pre_possession_pct": 80.0,
                "execution_buffer_months": 6
            }
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["simulated"]["risk_score"] < data["baseline"]["risk_score"]

def test_api_statutory_endpoints():
    """Tests GET /api/projects/{code}/statutory and POST notice generation."""
    service = get_service()
    first_project = service.df.iloc[0]['project_code']

    get_res = client.get(f"/api/projects/{first_project}/statutory")
    assert get_res.status_code == 200
    data = get_res.json()
    assert "current_statutory_stage" in data
    assert "lapsing_risk_level" in data
    assert len(data["statutory_directives"]) > 0

    login_res = client.post(
        "/api/auth/login",
        json={"username": "admin", "password": "sih26017"}
    )
    token = login_res.json()["access_token"]

    notice_res = client.post(
        f"/api/projects/{first_project}/statutory/notice",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "recipient_title": "District Magistrate & CALA Officer",
            "custom_instructions": "Review parcel demarcation before Friday CSPCC conference."
        }
    )
    assert notice_res.status_code == 200
    notice_data = notice_res.json()
    assert "formatted_document" in notice_data
    assert "Review parcel demarcation" in notice_data["formatted_document"]
