"""
Unit & Integration Tests for Advanced Roadmapped Features (Phases 7, 8, 9).
Tests:
- Dynamic Survival Analysis & Weibull Delay Hazard Modeling
- Geospatial Corridor Alignment, Haversine Distance & Land Friction
- Multi-Relational Infrastructure Knowledge Graph & Cascade Simulator
"""

import os
import sys
import pytest

# Ensure repository root is in python path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from fastapi.testclient import TestClient
from src.api.app import app
from src.api.service import get_service
from src.modeling.survival import SurvivalHazardEngine
from src.geospatial.corridor import CorridorIntelligenceEngine, haversine_distance_km
from src.modeling.contagion import InfrastructureContagionEngine

client = TestClient(app)


def test_phase7_survival_analysis_calculation():
    """Verifies that Weibull survival curves and hazard rates are computed accurately."""
    sample_proj = {
        'project_code': 'TEST_WEIBULL_01',
        'project_name': 'Test Expressway Sector Alignment',
        'planned_duration_months': 36,
        'orig_cost_cr': 1200.0,
        'is_linear_infrastructure': 1,
        'sector': 'ROAD TRANSPORT AND HIGHWAYS',
        'risk_score': 82
    }
    res = SurvivalHazardEngine.calculate_survival_curve(sample_proj, max_months=48)
    assert 'weibull_parameters' in res
    assert 'hazard_curve' in res
    assert 'peak_danger_window' in res
    assert 'forecasting' in res

    curve = res['hazard_curve']
    assert len(curve) == 48

    # Survival S(t) should start near 1.0 and decrease monotonically
    assert curve[0]['survival_probability'] > curve[-1]['survival_probability']
    # Cumulative hazard should increase monotonically
    assert curve[0]['cumulative_hazard'] < curve[-1]['cumulative_hazard']

    # Peak danger window should be within reasonable boundaries
    peak_info = res['peak_danger_window']
    assert 6 <= peak_info['peak_month'] <= 42


def test_phase8_corridor_sample_and_analysis():
    """Verifies Haversine distance, segmenting, and corridor environmental friction metrics."""
    samples = CorridorIntelligenceEngine.get_sample_corridors()
    assert len(samples) >= 3

    # Pick Delhi-Mumbai Expressway sample
    dme = samples[0]
    assert len(dme['coordinates']) >= 5

    analysis = CorridorIntelligenceEngine.analyze_corridor(
        coordinates=dme['coordinates'],
        sector=dme['sector'],
        state=dme['state'],
        name=dme['name']
    )

    assert analysis['total_distance_km'] > 500.0
    assert len(analysis['segments']) == len(dme['coordinates']) - 1
    assert 'environmental_metrics' in analysis
    assert analysis['environmental_metrics']['forest_overlap_pct'] > 0
    assert analysis['environmental_metrics']['river_crossings_count'] >= 1
    assert 'vulnerability_assessment' in analysis
    assert analysis['vulnerability_assessment']['score'] > 0
    assert len(analysis['corridor_recommendations']) >= 2


def test_phase9_contagion_network_and_cascade():
    """Verifies knowledge graph topology generation and delay shock cascade simulation."""
    service = get_service()
    network = service.get_contagion_network()
    assert 'nodes' in network
    assert 'links' in network
    assert network['total_nodes'] >= 20
    assert network['total_links'] >= 15

    # Check node types
    types = {n['type'] for n in network['nodes']}
    assert 'PROJECT' in types
    assert 'AGENCY' in types
    assert 'STATE' in types

    # Test cascade simulation
    first_code = service.df.iloc[0]['project_code']
    cascade = service.simulate_cascade(epicenter_project_code=first_code, delay_shock_months=18)
    assert 'epicenter' in cascade
    assert 'cascade_summary' in cascade
    assert 'cascaded_projects' in cascade
    assert cascade['cascade_summary']['exposed_projects_count'] >= 1
    assert cascade['cascade_summary']['total_secondary_delay_months'] > 0
    assert cascade['cascade_summary']['total_cascade_escalation_cr'] >= 0
