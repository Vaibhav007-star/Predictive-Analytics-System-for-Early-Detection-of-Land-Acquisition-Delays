"""
Automated unit tests for SIH26017 Phase 2: Splitting, Features, Leakage, and Baseline Model.
Run with:
    py -3.12 -m pytest tests/
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
from src.modeling.features import FeaturePipeline, check_data_leakage, FORBIDDEN_LEAKAGE_COLUMNS
from src.modeling.baseline import BaselineDelayModel
from src.modeling.evaluate import compute_honest_metrics


DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "land_delays.db")

def test_db_loading():
    df = load_projects_from_db(DB_PATH)
    assert len(df) == 1477, "Expected 1,477 authentic projects from MoSPI data"
    assert 'is_delayed' in df.columns
    assert 'orig_cost_cr' in df.columns

def test_splitting_integrity():
    df = load_projects_from_db(DB_PATH)
    train, val, test = create_project_splits(df, 0.70, 0.15, 0.15, random_state=42)
    
    # Check disjoint project codes
    train_codes = set(train['project_code'])
    val_codes = set(val['project_code'])
    test_codes = set(test['project_code'])

    assert len(train_codes.intersection(val_codes)) == 0, "Train and Val must be disjoint"
    assert len(train_codes.intersection(test_codes)) == 0, "Train and Test must be disjoint"
    assert len(val_codes.intersection(test_codes)) == 0, "Val and Test must be disjoint"
    assert len(train) + len(val) + len(test) == len(df), "Splits must sum to total records"

def test_leakage_audit():
    df = load_projects_from_db(DB_PATH)
    train, _, _ = create_project_splits(df, random_state=42)

    pipeline = FeaturePipeline()
    pipeline.fit(train)
    X_train = pipeline.transform(train)
    y_train = train['is_delayed'].values

    # Check that none of the forbidden columns are in feature names
    for fname in pipeline.feature_names:
        for forbidden in FORBIDDEN_LEAKAGE_COLUMNS:
            assert forbidden not in fname.lower(), f"Forbidden column found in feature: {fname}"

    audit = check_data_leakage(X_train, y_train, pipeline.feature_names, train)
    assert audit['leakage_detected'] is False, f"Leakage detected: {audit['violations']}"

def test_baseline_model_training_and_eval():
    df = load_projects_from_db(DB_PATH)
    train, val, test = create_project_splits(df, random_state=42)

    pipeline = FeaturePipeline().fit(train)
    X_train = pipeline.transform(train)
    y_train = train['is_delayed'].values

    X_test = pipeline.transform(test)
    y_test = test['is_delayed'].values

    model = BaselineDelayModel(C=0.5, random_state=42)
    model.train(X_train, y_train, pipeline.feature_names)

    test_probs = model.predict_proba(X_test)
    assert len(test_probs) == len(y_test)
    assert np.all((test_probs >= 0.0) & (test_probs <= 1.0))

    metrics = compute_honest_metrics(y_test, test_probs)
    assert metrics['roc_auc'] > 0.70, "Baseline ROC-AUC should be substantially above random chance (0.50)"
    assert metrics['f1_score'] > 0.65, "Baseline F1 should exceed trivial baseline"

if __name__ == "__main__":
    sys.exit(pytest.main([__file__, "-v"]))


