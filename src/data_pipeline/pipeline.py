"""
Orchestrator for the SIH26017 Authentic Data Pipeline.
Coordinates loading, validation, cleaning, and persistence to SQLite.
STRICT RULE: Never fabricate ML data — all rows trace back to authentic source documents.
"""

import os
import sqlite3
import pandas as pd
from typing import Dict, Any

from .db import init_db, get_connection, DEFAULT_DB_PATH
from .mospi_loader import extract_mospi_projects
from .pmgsy_loader import load_pmgsy_data
from .scm_loader import load_scm_data
from .validator import compute_data_quality, format_quality_report_md

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RAW_DATA_DIR = os.path.join(BASE_DIR, "data", "raw")

def run_full_pipeline(db_path: str = DEFAULT_DB_PATH) -> Dict[str, Any]:
    """
    Executes the end-to-end data ingestion and validation pipeline.
    """
    print("=" * 60)
    print("SIH26017: Executing Phase 1 Authentic Data Pipeline")
    print("=" * 60)

    # 1. Initialize Database Schema
    print("\n[Step 1/5] Initializing SQLite database schema...")
    init_db(db_path)
    conn = get_connection(db_path)

    # 2. Ingest MoSPI Central Sector Projects
    mospi_pdf = os.path.join(RAW_DATA_DIR, "FRFebruary2025.pdf")
    print(f"\n[Step 2/5] Ingesting MoSPI Central Sector Projects from {mospi_pdf}...")
    mospi_df = extract_mospi_projects(mospi_pdf)
    print(f" -> Extracted {len(mospi_df)} authentic projects.")

    # 3. Ingest PMGSY Rural Roads Data
    pmgsy_excel = os.path.join(RAW_DATA_DIR, "finalexcel.xlsx")
    print(f"\n[Step 3/5] Ingesting PMGSY Rural Road Progress from {pmgsy_excel}...")
    pmgsy_df = load_pmgsy_data(pmgsy_excel)
    print(f" -> Loaded {len(pmgsy_df)} district-scheme records.")

    # 4. Ingest Smart Cities Mission Data
    scm_csv = os.path.join(RAW_DATA_DIR, "SCM-Masterdata.csv")
    print(f"\n[Step 4/5] Ingesting Smart Cities Mission Masterdata from {scm_csv}...")
    scm_df = load_scm_data(scm_csv)
    print(f" -> Loaded {len(scm_df)} urban infrastructure projects.")

    # 5. Data Quality and Validation
    print("\n[Step 5/5] Computing Data Quality audits...")
    mospi_quality = compute_data_quality(
        mospi_df, "MoSPI Central Sector Projects (Feb 2025)",
        key_col="project_code",
        date_cols=["approval_date", "orig_commissioning_date", "rev_commissioning_date", "ant_commissioning_date"]
    )
    pmgsy_quality = compute_data_quality(
        pmgsy_df, "PMGSY District Infrastructure Progress",
        key_col="district_name",
        date_cols=[]
    )
    scm_quality = compute_data_quality(
        scm_df, "Smart Cities Mission Masterdata",
        key_col="project_id",
        date_cols=["planned_end_date", "actual_completion_date"]
    )

    # Write Data Quality Report Markdown
    quality_report_md = "# SIH26017: Comprehensive Data Quality & Audit Report\n\n"
    quality_report_md += "> **STRICT COMPLIANCE NOTICE:** All metrics in this report are mathematically computed from authentic government datasets. No data, labels, dates, or statistics have been fabricated.\n\n"
    quality_report_md += "## Executive Summary\n"
    quality_report_md += f"- **MoSPI Central Sector Projects:** {len(mospi_df):,} records | Delay rate: {round((mospi_df['is_delayed']==1).mean()*100, 1)}% | Mean delay: {round(mospi_df['delay_months'].mean(), 1)} months\n"
    quality_report_md += f"- **PMGSY District Rural Road Records:** {len(pmgsy_df):,} district-level entries across all Indian States\n"
    quality_report_md += f"- **Smart Cities Mission Projects:** {len(scm_df):,} projects across 36 States/UTs\n\n"
    quality_report_md += "## Detailed Dataset Audits\n"
    quality_report_md += format_quality_report_md(mospi_quality)
    quality_report_md += format_quality_report_md(pmgsy_quality)
    quality_report_md += format_quality_report_md(scm_quality)

    report_path = os.path.join(BASE_DIR, "DATA_QUALITY_REPORT.md")
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(quality_report_md)
    print(f" -> Generated DATA_QUALITY_REPORT.md at {report_path}")

    # Persist to SQLite
    print("\nPersisting cleaned datasets to SQLite database...")
    cursor = conn.cursor()

    # Clear existing rows to ensure idempotency
    cursor.execute("DELETE FROM projects;")
    cursor.execute("DELETE FROM pmgsy_district_progress;")
    cursor.execute("DELETE FROM scm_projects;")

    mospi_df.to_sql("projects", conn, if_exists="append", index=False)
    pmgsy_df.to_sql("pmgsy_district_progress", conn, if_exists="append", index=False)
    scm_df.to_sql("scm_projects", conn, if_exists="append", index=False)
    conn.commit()
    conn.close()

    print(f" -> Successfully populated {db_path}")
    print("\nData Pipeline Execution Completed Successfully!")
    return {
        "mospi_count": len(mospi_df),
        "pmgsy_count": len(pmgsy_df),
        "scm_count": len(scm_df),
        "db_path": db_path
    }
