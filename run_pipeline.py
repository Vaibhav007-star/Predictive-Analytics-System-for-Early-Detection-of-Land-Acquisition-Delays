"""
CLI entry point to execute the SIH26017 authentic data pipeline.
Usage:
    py -3.12 run_pipeline.py
"""

import sys
import os

# Ensure src is in python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.data_pipeline.pipeline import run_full_pipeline

if __name__ == "__main__":
    result = run_full_pipeline()
    print("\nSummary of Ingested Authentic Data:")
    print(f"  - Central Sector Projects (MoSPI): {result['mospi_count']:,} projects")
    print(f"  - Rural Infrastructure Records (PMGSY): {result['pmgsy_count']:,} records")
    print(f"  - Urban Infrastructure Projects (SCM): {result['scm_count']:,} projects")
    print(f"  - SQLite Database: {result['db_path']}")
