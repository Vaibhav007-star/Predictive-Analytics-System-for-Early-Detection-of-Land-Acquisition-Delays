"""
Data Quality and Validation Module for SIH26017.
Evaluates completeness, uniqueness, date validity, and distributions computed strictly from real data.
STRICT RULE: Never fabricate ML data — metrics must be mathematically computed from actual records.
"""

import pandas as pd
from typing import Dict, Any, List

def compute_data_quality(df: pd.DataFrame, dataset_name: str, key_col: str, date_cols: List[str]) -> Dict[str, Any]:
    """
    Computes rigorous data quality metrics on an authentic DataFrame.
    """
    total_records = len(df)
    
    # 1. Uniqueness
    duplicate_count = df.duplicated(subset=[key_col]).sum()
    duplicate_pct = round((duplicate_count / total_records) * 100.0, 2) if total_records > 0 else 0.0

    # 2. Missing values per column
    missing_stats = {}
    for col in df.columns:
        null_count = df[col].isna().sum()
        null_pct = round((null_count / total_records) * 100.0, 2) if total_records > 0 else 0.0
        missing_stats[col] = {
            'missing_count': int(null_count),
            'missing_pct': float(null_pct)
        }

    # 3. Date validity checks
    date_stats = {}
    for dcol in date_cols:
        if dcol in df.columns:
            non_nulls = df[dcol].dropna()
            # check ISO format YYYY-MM-DD or YYYY-MM-01
            valid_dt = pd.to_datetime(non_nulls, errors='coerce')
            invalid_count = valid_dt.isna().sum()
            invalid_pct = round((invalid_count / len(non_nulls)) * 100.0, 2) if len(non_nulls) > 0 else 0.0
            min_date = str(valid_dt.min())[:10] if not valid_dt.empty else "N/A"
            max_date = str(valid_dt.max())[:10] if not valid_dt.empty else "N/A"
            date_stats[dcol] = {
                'total_populated': int(len(non_nulls)),
                'invalid_dates_count': int(invalid_count),
                'invalid_dates_pct': float(invalid_pct),
                'min_date': min_date,
                'max_date': max_date
            }

    return {
        'dataset_name': dataset_name,
        'total_records': total_records,
        'unique_records': int(df[key_col].nunique()) if key_col in df.columns else total_records,
        'duplicate_count': int(duplicate_count),
        'duplicate_pct': float(duplicate_pct),
        'missing_stats': missing_stats,
        'date_stats': date_stats
    }

def format_quality_report_md(report: Dict[str, Any]) -> str:
    """Formats the data quality dictionary into a readable Markdown report section."""
    lines = []
    lines.append(f"### Data Quality: {report['dataset_name']}")
    lines.append(f"- **Total Records:** {report['total_records']:,}")
    lines.append(f"- **Unique Keys:** {report['unique_records']:,}")
    lines.append(f"- **Duplicates:** {report['duplicate_count']} ({report['duplicate_pct']}%)")
    lines.append("\n#### Column Completeness & Missing Values")
    lines.append("| Column Name | Missing Count | Missing (%) |")
    lines.append("| :--- | :---: | :---: |")
    for col, stats in report['missing_stats'].items():
        lines.append(f"| `{col}` | {stats['missing_count']:,} | {stats['missing_pct']}% |")

    if report['date_stats']:
        lines.append("\n#### Date Field Validation")
        lines.append("| Date Column | Populated | Invalid Count | Invalid (%) | Min Date | Max Date |")
        lines.append("| :--- | :---: | :---: | :---: | :---: | :---: |")
        for dcol, dstats in report['date_stats'].items():
            lines.append(f"| `{dcol}` | {dstats['total_populated']:,} | {dstats['invalid_dates_count']} | {dstats['invalid_dates_pct']}% | {dstats['min_date']} | {dstats['max_date']} |")
    lines.append("\n")
    return "\n".join(lines)
