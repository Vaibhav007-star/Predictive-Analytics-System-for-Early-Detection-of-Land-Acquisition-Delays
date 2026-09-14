"""
Dataset Splitting Module for SIH26017.
Ensures rigorous Train / Validation / Test separation grouped by Project Code to prevent data leakage.
"""

import sqlite3
import pandas as pd
import numpy as np
from typing import Tuple
from sklearn.model_selection import train_test_split

def load_projects_from_db(db_path: str = "data/land_delays.db") -> pd.DataFrame:
    """Loads all authentic projects from the SQLite database."""
    conn = sqlite3.connect(db_path)
    query = """
    SELECT 
        project_code,
        project_name,
        sector,
        agency,
        state,
        approval_date,
        orig_commissioning_date,
        rev_commissioning_date,
        ant_commissioning_date,
        orig_cost_cr,
        rev_cost_cr,
        ant_cost_cr,
        cumulative_exp_cr,
        physical_progress_pct,
        delay_months,
        is_delayed,
        cost_overrun_pct,
        expenditure_ratio,
        source_dataset
    FROM projects
    """
    df = pd.read_sql_query(query, conn)
    conn.close()
    return df

def create_project_splits(
    df: pd.DataFrame,
    train_ratio: float = 0.70,
    val_ratio: float = 0.15,
    test_ratio: float = 0.15,
    random_state: int = 42
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Splits projects into Train (70%), Validation (15%), and Test (15%).
    Stratified by `is_delayed` to maintain the empirical 65.5% delayed class distribution.
    Grouped strictly by project_code (each unique project is in exactly one split).
    """
    assert abs((train_ratio + val_ratio + test_ratio) - 1.0) < 1e-5, "Split ratios must sum to 1.0"

    # Step 1: Separate Test set (15%)
    test_size = test_ratio
    train_val_df, test_df = train_test_split(
        df,
        test_size=test_size,
        stratify=df['is_delayed'],
        random_state=random_state
    )

    # Step 2: Separate Train (70%) and Validation (15% of total, which is 0.15 / 0.85 of train_val)
    val_relative_size = val_ratio / (train_ratio + val_ratio)
    train_df, val_df = train_test_split(
        train_val_df,
        test_size=val_relative_size,
        stratify=train_val_df['is_delayed'],
        random_state=random_state
    )

    # Assign split labels
    train_df = train_df.copy()
    val_df = val_df.copy()
    test_df = test_df.copy()

    train_df['split'] = 'train'
    val_df['split'] = 'val'
    test_df['split'] = 'test'

    return train_df, val_df, test_df

if __name__ == "__main__":
    df = load_projects_from_db()
    train, val, test = create_project_splits(df)
    print(f"Total Projects: {len(df)}")
    print(f"Train Set: {len(train)} ({len(train)/len(df)*100:.1f}%) | Delay Rate: {train['is_delayed'].mean()*100:.1f}%")
    print(f"Val Set:   {len(val)} ({len(val)/len(df)*100:.1f}%) | Delay Rate: {val['is_delayed'].mean()*100:.1f}%")
    print(f"Test Set:  {len(test)} ({len(test)/len(df)*100:.1f}%) | Delay Rate: {test['is_delayed'].mean()*100:.1f}%")

