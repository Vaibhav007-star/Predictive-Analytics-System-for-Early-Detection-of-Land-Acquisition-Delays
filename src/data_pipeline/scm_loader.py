"""
Smart Cities Mission (SCM) Masterdata Loader.
Extracts authentic urban infrastructure project data, timelines, and qualitative milestone markers.
Ministry of Housing & Urban Affairs (MoHUA), Government of India.
STRICT RULE: Never fabricate ML data — all records must trace directly to authentic open data.
"""

import os
import pandas as pd
from typing import Optional

def parse_dmy_date(val: Optional[str]) -> Optional[str]:
    """Converts DD/MM/YYYY into ISO YYYY-MM-DD."""
    if not val or pd.isna(val):
        return None
    val_str = str(val).strip()
    parts = val_str.split('/')
    if len(parts) == 3:
        try:
            day = int(parts[0])
            month = int(parts[1])
            year = int(parts[2])
            if 1 <= day <= 31 and 1 <= month <= 12 and 2000 <= year <= 2040:
                return f"{year:04d}-{month:02d}-{day:02d}"
        except (ValueError, TypeError):
            return None
    return None

def load_scm_data(csv_path: str) -> pd.DataFrame:
    """
    Loads and normalizes the Smart Cities Mission project records.
    """
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"SCM dataset not found at: {csv_path}")

    raw_df = pd.read_csv(csv_path, low_memory=False)

    df = pd.DataFrame()
    df['project_id'] = raw_df['Project ID'].astype(str).str.strip()
    df['state_name'] = raw_df['State Name'].astype(str).str.strip().str.upper()
    df['city_name'] = raw_df['City Name'].astype(str).str.strip()
    df['project_name'] = raw_df['Project Name'].astype(str).str.strip()
    df['category'] = raw_df['Category'].fillna('Uncategorized').astype(str).str.strip()
    df['sector'] = raw_df['Sector'].fillna('General').astype(str).str.strip()
    df['implementing_agency'] = raw_df['Implementing Agency'].fillna('SPV').astype(str).str.strip()

    # Dates
    df['planned_end_date'] = raw_df['Project End Date'].apply(parse_dmy_date)
    df['actual_completion_date'] = raw_df['Actual Date of Project Completion'].apply(parse_dmy_date)

    # Delay target
    planned_dt = pd.to_datetime(df['planned_end_date'], errors='coerce')
    actual_dt = pd.to_datetime(df['actual_completion_date'], errors='coerce')
    df['delay_days'] = (actual_dt - planned_dt).dt.days

    # Binary delay indicator for completed projects with valid dates
    df['is_delayed'] = None
    mask_valid_dates = df['delay_days'].notna()
    df.loc[mask_valid_dates, 'is_delayed'] = (df.loc[mask_valid_dates, 'delay_days'] > 0).astype(int)

    # Costs
    df['estimated_cost_cr'] = pd.to_numeric(raw_df['DPR Cost / Estimated Project Cost'], errors='coerce')
    df['actual_cost_cr'] = pd.to_numeric(raw_df['Actual Cost'], errors='coerce')

    # Milestone status
    df['milestone'] = raw_df['Milestone'].fillna('Unknown').astype(str).str.strip()

    # Qualitative markers in milestone text (actual reported notes)
    notes = raw_df['Mention the project Milestones Achieved'].fillna('').astype(str).str.lower()
    df['has_land_acquisition_mention'] = notes.str.contains(r'land|acquis|encroach|possession', regex=True).astype(int)
    df['has_clearance_mention'] = notes.str.contains(r'clearance|court|dispute|stay\b|litig', regex=True).astype(int)
    df['milestones_achieved_text'] = raw_df['Mention the project Milestones Achieved'].fillna('').astype(str).str[:500]

    df['source_dataset'] = 'Smart_Cities_Mission_Masterdata'

    # Deduplicate
    df = df.drop_duplicates(subset=['project_id'])
    return df

if __name__ == "__main__":
    csv_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data", "raw", "SCM-Masterdata.csv")
    df = load_scm_data(csv_file)
    print(f"Loaded {len(df)} SCM project records.")
    print("Sample with land acquisition mention:", (df['has_land_acquisition_mention'] == 1).sum())
    print("Sample with clearance/court mention:", (df['has_clearance_mention'] == 1).sum())
