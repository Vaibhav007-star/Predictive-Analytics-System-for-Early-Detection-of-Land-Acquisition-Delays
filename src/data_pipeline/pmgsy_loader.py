"""
PMGSY (Pradhan Mantri Gram Sadak Yojana) Loader.
Extracts authentic rural road infrastructure and progress metrics from official PMGSY data.
Ministry of Rural Development, Government of India.
STRICT RULE: Never fabricate ML data — all records must trace directly to the authentic PMGSY source.
"""

import os
import pandas as pd
from typing import Optional

def load_pmgsy_data(excel_path: str) -> pd.DataFrame:
    """
    Loads and normalizes the district-level roadconstruction sheet from the PMGSY dataset.
    """
    if not os.path.exists(excel_path):
        raise FileNotFoundError(f"PMGSY Excel dataset not found at: {excel_path}")

    raw_df = pd.read_excel(excel_path, sheet_name="roadconstruction")

    # Rename to clean snake_case columns
    col_mapping = {
        'STATE_NAME': 'state_name',
        'DISTRICT_NAME': 'district_name',
        'PMGSY_SCHEME': 'pmgsy_scheme',
        'NO_OF_ROAD_WORK_SANCTIONED': 'no_of_road_work_sanctioned',
        'NO_OF_BRIDGES_SANCTIONED': 'no_of_bridges_sanctioned',
        'NO_OF_ROAD_WORKS_COMPLETED': 'no_of_road_works_completed',
        'NO_OF_BRIDGES_COMPLETED': 'no_of_bridges_completed',
        'NO_OF_ROAD_WORKS_BALANCE': 'no_of_road_works_balance',
        'NO_OF_BRIDGES_BALANCE': 'no_of_bridges_balance',
        'LENGTH_OF_ROAD_WORK_SANCTIONED_KM': 'length_road_sanctioned_km',
        'COST_OF_WORKS_SANCTIONED_LAKHS': 'cost_sanctioned_lakhs',
        'LENGTH_OF_ROAD_WORK_COMPLETED_KM': 'length_road_completed_km',
        'EXPENDITURE_OCCURED_LAKHS': 'expenditure_occurred_lakhs',
        'LENGTH_OF_ROAD_WORK_BALANCE_KM': 'length_road_balance_km',
        'BUDGET': 'budget'
    }

    df = raw_df.rename(columns=col_mapping)

    # Clean text columns
    df['state_name'] = df['state_name'].astype(str).str.strip().str.upper()
    df['district_name'] = df['district_name'].astype(str).str.strip().str.title()
    df['pmgsy_scheme'] = df['pmgsy_scheme'].astype(str).str.strip()

    # Numerical hygiene
    numeric_cols = [
        'no_of_road_work_sanctioned', 'no_of_bridges_sanctioned',
        'no_of_road_works_completed', 'no_of_bridges_completed',
        'no_of_road_works_balance', 'no_of_bridges_balance',
        'length_road_sanctioned_km', 'cost_sanctioned_lakhs',
        'length_road_completed_km', 'expenditure_occurred_lakhs',
        'length_road_balance_km', 'budget'
    ]
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0.0)

    # Derived progress metrics
    df['work_completion_rate_pct'] = (
        df['no_of_road_works_completed'] / df['no_of_road_work_sanctioned'].replace(0, pd.NA)
    ).fillna(0.0) * 100.0
    df['work_completion_rate_pct'] = df['work_completion_rate_pct'].clip(lower=0.0, upper=100.0).round(2)

    df['length_completion_rate_pct'] = (
        df['length_road_completed_km'] / df['length_road_sanctioned_km'].replace(0, pd.NA)
    ).fillna(0.0) * 100.0
    df['length_completion_rate_pct'] = df['length_completion_rate_pct'].clip(lower=0.0, upper=100.0).round(2)

    df['source_dataset'] = 'PMGSY_State_Infrastructure_Report'

    # Deduplicate
    df = df.drop_duplicates(subset=['state_name', 'district_name', 'pmgsy_scheme'])
    return df

if __name__ == "__main__":
    excel_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data", "raw", "finalexcel.xlsx")
    df = load_pmgsy_data(excel_file)
    print(f"Loaded {len(df)} PMGSY district progress records.")
    print("Sample:\n", df[['state_name', 'district_name', 'pmgsy_scheme', 'length_road_sanctioned_km', 'length_road_completed_km', 'length_completion_rate_pct']].head(3))

