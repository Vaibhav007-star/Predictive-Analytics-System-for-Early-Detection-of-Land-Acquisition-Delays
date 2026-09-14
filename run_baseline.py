"""
CLI Runner for Phase 2: Target Definition, Feature Pipeline, Leakage Check & Baseline Modeling.
Usage:
    py -3.12 run_baseline.py
"""

import sys
import os
import pandas as pd
import numpy as np

# Ensure root is in path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

from src.modeling.split import load_projects_from_db, create_project_splits
from src.modeling.features import FeaturePipeline, check_data_leakage, format_leakage_report_md
from src.modeling.baseline import BaselineDelayModel
from src.modeling.evaluate import compute_honest_metrics, format_evaluation_report_md

def run_phase_2():
    print("=" * 65)
    print("SIH26017: Phase 2 — Target Definition, Feature Pipeline & Baseline")
    print("=" * 65)

    # 1. Load Data
    print("\n[Step 1/6] Loading authentic projects from SQLite database...")
    df = load_projects_from_db(os.path.join(BASE_DIR, "data", "land_delays.db"))
    print(f" -> Loaded {len(df):,} projects across {df['state'].nunique()} States and {df['sector'].nunique()} Sectors.")

    # 2. Data Splitting
    print("\n[Step 2/6] Splitting data into Train (70%), Val (15%), Test (15%)...")
    train_df, val_df, test_df = create_project_splits(df, random_state=42)
    print(f" -> Train Set: {len(train_df)} projects (Delay rate: {train_df['is_delayed'].mean()*100:.1f}%)")
    print(f" -> Val Set:   {len(val_df)} projects (Delay rate: {val_df['is_delayed'].mean()*100:.1f}%)")
    print(f" -> Test Set:  {len(test_df)} projects (Delay rate: {test_df['is_delayed'].mean()*100:.1f}%)")

    # 3. Feature Pipeline
    print("\n[Step 3/6] Fitting baseline-only feature pipeline strictly on Train set...")
    pipeline = FeaturePipeline()
    pipeline.fit(train_df)
    
    X_train = pipeline.transform(train_df)
    y_train = train_df['is_delayed'].values

    X_val = pipeline.transform(val_df)
    y_val = val_df['is_delayed'].values

    X_test = pipeline.transform(test_df)
    y_test = test_df['is_delayed'].values

    print(f" -> Engineered {len(pipeline.feature_names)} predictors knowable at baseline.")
    print(f" -> Feature List: {pipeline.feature_names}")

    # 4. Leakage Check
    print("\n[Step 4/6] Executing automated data leakage audit...")
    leakage_audit = check_data_leakage(X_train, y_train, pipeline.feature_names, train_df)
    leakage_report_md = format_leakage_report_md(leakage_audit)
    
    leakage_path = os.path.join(BASE_DIR, "LEAKAGE_REPORT.md")
    with open(leakage_path, "w", encoding="utf-8") as f:
        f.write(leakage_report_md)
    print(f" -> Generated LEAKAGE_REPORT.md at {leakage_path}")
    print(f" -> Leakage audit status: {'FAILED' if leakage_audit['leakage_detected'] else 'PASSED (Zero Leakage)'}")

    # 5. Train Baseline Model
    print("\n[Step 5/6] Training Baseline Logistic Regression Model (CPU)...")
    baseline = BaselineDelayModel(C=0.5, random_state=42)
    baseline.train(X_train, y_train, pipeline.feature_names)

    # Save model artifact
    model_dir = os.path.join(BASE_DIR, "models")
    os.makedirs(model_dir, exist_ok=True)
    baseline.save(os.path.join(model_dir, "baseline_logreg.joblib"))
    print(f" -> Model saved to models/baseline_logreg.joblib")

    # 6. Evaluation
    print("\n[Step 6/6] Computing out-of-sample evaluation metrics...")
    val_probs = baseline.predict_proba(X_val)
    val_metrics = compute_honest_metrics(y_val, val_probs, threshold=0.50, split_name="Validation")

    test_probs = baseline.predict_proba(X_test)
    test_metrics = compute_honest_metrics(y_test, test_probs, threshold=0.50, split_name="Test")

    coef_df = baseline.get_feature_coefficients()

    eval_report_md = format_evaluation_report_md(val_metrics, test_metrics, coef_df)
    eval_path = os.path.join(BASE_DIR, "MODEL_EVALUATION.md")
    with open(eval_path, "w", encoding="utf-8") as f:
        f.write(eval_report_md)
    print(f" -> Generated MODEL_EVALUATION.md at {eval_path}")

    # Print summary metrics to terminal
    print("\n" + "=" * 50)
    print(f"BASELINE MODEL TEST SET PERFORMANCE ($N = {test_metrics['total_samples']}$):")
    print("=" * 50)
    print(f"  ROC-AUC:       {test_metrics['roc_auc']:.4f}")
    print(f"  PR-AUC:        {test_metrics['pr_auc']:.4f} (Base rate: {test_metrics['base_delay_rate']:.3f})")
    print(f"  Accuracy:      {test_metrics['accuracy']:.4f}")
    print(f"  Precision:     {test_metrics['precision']:.4f}")
    print(f"  Recall:        {test_metrics['recall']:.4f}")
    print(f"  F1-Score:      {test_metrics['f1_score']:.4f}")
    print(f"  Specificity:   {test_metrics['specificity']:.4f}")
    print(f"  Brier Score:   {test_metrics['brier_score']:.4f}")
    cm = test_metrics['confusion_matrix']
    print(f"  Confusion Matrix: TN={cm['true_negatives']}, FP={cm['false_positives']}, FN={cm['false_negatives']}, TP={cm['true_positives']}")
    print("=" * 50)
    print("\nTop 5 Delay-Elevating Factors (Odds Ratio > 1.0):")
    print(coef_df[coef_df['coefficient'] > 0].head(5)[['feature', 'coefficient', 'odds_ratio']].to_string(index=False))
    print("\nTop 5 Delay-Mitigating Factors (Odds Ratio < 1.0):")
    print(coef_df[coef_df['coefficient'] < 0].tail(5)[['feature', 'coefficient', 'odds_ratio']].to_string(index=False))

if __name__ == "__main__":
    run_phase_2()

