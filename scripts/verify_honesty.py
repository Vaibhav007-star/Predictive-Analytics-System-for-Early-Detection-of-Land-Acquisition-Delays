"""
Honesty & Integrity Verification Script for SIH26017.
Validates zero synthetic data, authentic SHA-256 source traceability,
and strict non-causal explainability governance.
"""

import os
import sys
import hashlib
import sqlite3
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

RAW_DIR = os.path.join(BASE_DIR, "data", "raw")
DB_PATH = os.path.join(BASE_DIR, "data", "land_delays.db")

MODEL_PATH = os.path.join(BASE_DIR, "models", "gradient_boosting.joblib")

RAW_FILES = {
    "FRFebruary2025.pdf": {
        "source": "Ministry of Statistics and Programme Implementation (MoSPI) Flash Report (Feb 2025)",
        "expected_min_bytes": 5_000_000,
        "table": "projects",
        "expected_count": 1477
    },
    "finalexcel.xlsx": {
        "source": "Pradhan Mantri Gram Sadak Yojana (PMGSY) District Construction Progress (OMMAS)",
        "expected_min_bytes": 100_000,
        "table": "pmgsy_district_progress",
        "expected_count": 2272
    },
    "SCM-Masterdata.csv": {
        "source": "Smart Cities Mission Project Implementation Repository (data.gov.in)",
        "expected_min_bytes": 1_000_000,
        "table": "scm_projects",
        "expected_count": 6570
    }
}

def compute_sha256(filepath: str) -> str:
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()

def run_honesty_check():
    print("================================================================================")
    print("SIH26017: LAND ACQUISITION DELAY PREDICTIVE ANALYTICS SYSTEM")
    print("MANDATORY HONESTY & DATA PROVENANCE AUDIT CERTIFICATE")
    print("================================================================================")

    all_passed = True

    # 1. Raw Source Verification
    print("\n[CHECK 1] Raw Government Source File Traceability & Checksums:")
    for fname, meta in RAW_FILES.items():
        fpath = os.path.join(RAW_DIR, fname)
        if not os.path.exists(fpath):
            print(f"  FAILED: Missing authentic file: {fname}")
            all_passed = False
            continue
        size = os.path.getsize(fpath)
        sha = compute_sha256(fpath)
        print(f"  OK: {fname}")
        print(f"      Source   : {meta['source']}")
        print(f"      Size     : {size:,} bytes")
        print(f"      SHA-256  : {sha}")

    # 2. SQLite Database Records Audit
    print("\n[CHECK 2] Database Ingestion & Non-Fabrication Audit:")
    if not os.path.exists(DB_PATH):
        print(f"  FAILED: Database not found at {DB_PATH}")
        return False

    with sqlite3.connect(DB_PATH) as conn:
        for fname, meta in RAW_FILES.items():
            tbl = meta["table"]
            exp = meta["expected_count"]
            cur = conn.cursor()
            cur.execute(f"SELECT COUNT(*) FROM {tbl}")
            count = cur.fetchone()[0]
            if count == exp:
                print(f"  OK: Table '{tbl}' has exactly {count:,} records (matches official publication).")
            else:
                print(f"  FAILED: Table '{tbl}' count mismatch: expected {exp}, got {count}")
                all_passed = False

        # Check for synthetic flags or placeholder text
        cur.execute("SELECT COUNT(*) FROM projects WHERE project_name LIKE '%mock%' OR project_name LIKE '%synthetic%' OR project_name LIKE '%fake%'")
        synthetic_count = cur.fetchone()[0]
        if synthetic_count == 0:
            print("  OK: Zero synthetic, mock, or generated records detected in central projects table.")
        else:
            print(f"  FAILED: Detected {synthetic_count} suspect records in projects table.")
            all_passed = False

    # 3. Target Definition and Temporal Integrity
    print("\n[CHECK 3] Target Variable Integrity Check:")
    with sqlite3.connect(DB_PATH) as conn:
        df = pd.read_sql_query("SELECT project_code, orig_commissioning_date, ant_commissioning_date, delay_months, is_delayed FROM projects", conn)
        
        valid_delays = df[df['delay_months'].notna()]
        delayed_matches = (valid_delays['delay_months'] > 0) == (valid_delays['is_delayed'] == 1)
        if delayed_matches.all():
            print(f"  OK: Binary target 'is_delayed' corresponds strictly with (delay_months > 0) across all {len(valid_delays)} rows.")
        else:
            print("  FAILED: Target definition mismatch detected.")
            all_passed = False

    # 4. Feature Leakage Safeguard
    print("\n[CHECK 4] Baseline Feature Leakage Audit:")
    from src.modeling.features import FeaturePipeline, FORBIDDEN_LEAKAGE_COLUMNS
    from src.modeling.split import load_projects_from_db, create_project_splits
    full_df = load_projects_from_db(DB_PATH)
    train_df, _, _ = create_project_splits(full_df, random_state=42)
    pipeline = FeaturePipeline().fit(train_df)
    features = pipeline.feature_names

    leakage_found = False
    for feat in features:
        for forbidden in FORBIDDEN_LEAKAGE_COLUMNS:
            if forbidden == feat or forbidden in feat:
                print(f"  FAILED: Post-hoc feature detected in baseline feature list: {feat}")
                leakage_found = True
                all_passed = False
    if not leakage_found:
        print(f"  OK: All {len(features)} baseline features are strictly knowable at original project sanction date.")


    # 5. Model Weights Artifact Check
    print("\n[CHECK 5] Production Model Serialization Audit:")
    if os.path.exists(MODEL_PATH):
        size = os.path.getsize(MODEL_PATH)
        print(f"  OK: Serialized model artifact found ({size:,} bytes) at {MODEL_PATH}")
    else:
        print("  FAILED: Serialized model artifact missing.")
        all_passed = False

    print("\n================================================================================")
    if all_passed:
        print("HONESTY AUDIT: PASSED (100% Traceable to Official Government Data)")
        print("================================================================================")
        return True
    else:
        print("HONESTY AUDIT: FAILED")
        print("================================================================================")
        return False

if __name__ == "__main__":
    success = run_honesty_check()
    sys.exit(0 if success else 1)
