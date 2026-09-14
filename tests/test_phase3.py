"""
Automated unit tests for SIH26017 Phase 3: Ensemble, SHAP Explainability & Risk Engine.
"""

import os
import sys

# Ensure repository root is in python path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

import pytest
import numpy as np
import pandas as pd

from src.modeling.split import load_projects_from_db, create_project_splits
from src.modeling.features import FeaturePipeline
from src.modeling.ensemble import GradientBoostingDelayModel
from src.modeling.explainability import ProjectExplainabilityEngine
from src.modeling.risk_engine import RiskEngine, DEFAULT_THRESHOLDS


DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "land_delays.db")

def test_gradient_boosting_training():
    df = load_projects_from_db(DB_PATH)
    train, val, test = create_project_splits(df, random_state=42)

    pipeline = FeaturePipeline().fit(train)
    X_train = pipeline.transform(train)
    y_train = train['is_delayed'].values
    X_test = pipeline.transform(test)
    y_test = test['is_delayed'].values

    model = GradientBoostingDelayModel(n_estimators=30, max_depth=3, random_state=42)
    model.train(X_train, y_train, pipeline.feature_names)

    probs = model.predict_proba(X_test)
    assert len(probs) == len(y_test)
    assert np.all((probs >= 0.0) & (probs <= 1.0))
    
    # Verify higher accuracy than random guess
    from sklearn.metrics import roc_auc_score
    auc = roc_auc_score(y_test, probs)
    assert auc >= 0.85, f"Expected high AUC from ensemble, got {auc}"

def test_shap_explainability():
    df = load_projects_from_db(DB_PATH)
    train, _, test = create_project_splits(df, random_state=42)

    pipeline = FeaturePipeline().fit(train)
    X_train = pipeline.transform(train)
    y_train = train['is_delayed'].values
    X_test = pipeline.transform(test)

    model = GradientBoostingDelayModel(n_estimators=20, max_depth=3, random_state=42)
    model.train(X_train, y_train, pipeline.feature_names)

    xai = ProjectExplainabilityEngine(model, pipeline.feature_names)
    global_imp = xai.compute_global_importance(X_test[:20])
    assert len(global_imp) == len(pipeline.feature_names)
    assert global_imp['mean_abs_shap'].iloc[0] >= 0.0

    # Test single project explanation
    meta = {'project_code': 'N24000123', 'project_name': 'Test Highway'}
    expl = xai.explain_project(X_test[0], meta, top_k=3)
    assert 'top_risk_drivers' in expl
    assert 'top_mitigating_factors' in expl
    assert 'disclaimer' in expl
    
    # Strict rule check: "caused" must NEVER appear in generated explanation text
    for d in expl['top_risk_drivers']:
        assert "caused" not in d['explanation'].lower(), "Forbidden causal word 'caused' detected"
    for d in expl['top_mitigating_factors']:
        assert "caused" not in d['explanation'].lower(), "Forbidden causal word 'caused' detected"

def test_risk_engine():
    engine = RiskEngine()
    
    # Boundary checks
    assert engine.score_probability(0.0) == 0
    assert engine.score_probability(1.0) == 100
    assert engine.score_probability(0.25) == 25
    assert engine.score_probability(0.856) == 86

    # Band classification checks
    assert engine.classify_score(15) == 'LOW'
    assert engine.classify_score(30) == 'LOW'
    assert engine.classify_score(31) == 'MEDIUM'
    assert engine.classify_score(60) == 'MEDIUM'
    assert engine.classify_score(61) == 'HIGH'
    assert engine.classify_score(80) == 'HIGH'
    assert engine.classify_score(81) == 'CRITICAL'
    assert engine.classify_score(100) == 'CRITICAL'

    # Full profile generation
    prof = engine.generate_risk_profile(0.85, "N100", "Test Project")
    assert prof['risk_score'] == 85
    assert prof['risk_category'] == 'CRITICAL'
    assert 'recommended_action' in prof

if __name__ == "__main__":
    sys.exit(pytest.main([__file__, "-v"]))

