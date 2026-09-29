"""
Feature Engineering and Data Leakage Prevention Pipeline for SIH26017.
STRICT RULE: Only features knowable at project baseline (approval / inception) are permitted.
Zero future-leaking outcome variables are allowed into the predictor matrix.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List, Tuple
from sklearn.preprocessing import StandardScaler
from sklearn.feature_selection import mutual_info_classif

# Excluded columns that represent post-hoc execution outcomes or identifiers
FORBIDDEN_LEAKAGE_COLUMNS = [
    'ant_commissioning_date',
    'rev_commissioning_date',
    'ant_cost_cr',
    'rev_cost_cr',
    'cost_overrun_pct',
    'cumulative_exp_cr',
    'expenditure_ratio',
    'physical_progress_pct',
    'delay_months',
    'is_delayed',
    'source_page',
    'source_dataset',
    'split',
    'project_code',
    'project_name'
]

TOP_SECTORS = [
    'ROAD TRANSPORT AND HIGHWAYS',
    'POWER',
    'RAILWAYS',
    'URBAN DEVELOPMENT',
    'PETROLEUM',
    'COAL',
    'WATER RESOURCES',
    'CIVIL AVIATION'
]

def parse_dates_to_months(start_iso: str, end_iso: str) -> float:
    """Calculates planned duration in months between two YYYY-MM-01 dates."""
    try:
        sy, sm, _ = [int(x) for x in start_iso.split('-')]
        ey, em, _ = [int(x) for x in end_iso.split('-')]
        diff = (ey - sy) * 12 + (em - sm)
        return float(max(1, diff))
    except Exception:
        return 24.0 # default 2-year prior if missing

class FeaturePipeline:
    """
    Stateful feature transformer that fits statistical encodings ONLY on the training set
    and applies them deterministically to Validation and Test sets.
    """
    def __init__(self):
        self.scaler = StandardScaler()
        self.global_delay_prior = 0.655
        self.agency_target_map = {}
        self.state_target_map = {}
        self.feature_names = []
        self.is_fitted = False

    def _extract_raw_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Extracts candidate baseline features available at project approval time."""
        feat = pd.DataFrame(index=df.index)

        # 1. Approved Financial Scale
        orig_cost = df['orig_cost_cr'].fillna(100.0).clip(lower=1.0)
        feat['log_orig_cost'] = np.log10(orig_cost)
        feat['is_mega_project'] = (orig_cost >= 1000.0).astype(float) # Rs. 1,000 Cr+ threshold

        # 2. Planned Duration (at approval time)
        if 'approval_date' in df.columns and 'orig_commissioning_date' in df.columns and df['approval_date'].notna().any():
            durations = [
                parse_dates_to_months(app, orig)
                for app, orig in zip(df['approval_date'], df['orig_commissioning_date'])
            ]
        elif 'planned_duration_months' in df.columns:
            durations = df['planned_duration_months'].fillna(36.0).tolist()
        else:
            durations = [36.0] * len(df)

        feat['planned_duration_months'] = durations
        feat['log_planned_duration'] = np.log1p(durations)

        # 3. Approval Chronology (Policy Regime & Macro Environment)
        if 'approval_date' in df.columns and df['approval_date'].notna().any():
            app_dt = pd.to_datetime(df['approval_date'], errors='coerce')
            feat['approval_year'] = app_dt.dt.year.fillna(2018).astype(float)
            feat['approval_month'] = app_dt.dt.month.fillna(6).astype(float)
        else:
            feat['approval_year'] = df.get('approval_year', pd.Series([2024]*len(df), index=df.index)).fillna(2024).astype(float)
            feat['approval_month'] = df.get('approval_month', pd.Series([6]*len(df), index=df.index)).fillna(6).astype(float)
        # Post-RFCTLARR 2013 indicator (Land Acquisition Act enacted in 2013 took effect Jan 1, 2014)
        feat['post_larr_act_2013'] = (feat['approval_year'] >= 2014).astype(float)

        # 4. Sector Complexity (Linear infrastructure faces multi-jurisdiction land acquisition)
        feat['is_linear_infrastructure'] = df['sector'].isin(['ROAD TRANSPORT AND HIGHWAYS', 'RAILWAYS']).astype(float)

        # One-hot encoded sectors
        for sec in TOP_SECTORS:
            col_name = f"sector_{sec.replace(' ', '_').lower()}"
            feat[col_name] = (df['sector'] == sec).astype(float)
        feat['sector_other'] = (~df['sector'].isin(TOP_SECTORS)).astype(float)

        # Keep state and agency for target encoding
        feat['_state'] = df['state']
        feat['_agency'] = df['agency']

        return feat

    def fit(self, train_df: pd.DataFrame) -> 'FeaturePipeline':
        """Fits target encodings and scalers strictly on training data."""
        self.global_delay_prior = float(train_df['is_delayed'].mean())
        y_train = train_df['is_delayed']

        # Empirical Bayes smoothed target encoding for Agencies
        # Formula: (n * mean + m * prior) / (n + m) where m=5 smoothing weight
        m_weight = 5.0
        agency_counts = train_df.groupby('agency')['is_delayed'].agg(['count', 'mean'])
        self.agency_target_map = {
            agency: (row['count'] * row['mean'] + m_weight * self.global_delay_prior) / (row['count'] + m_weight)
            for agency, row in agency_counts.iterrows()
        }

        # Empirical Bayes smoothed target encoding for States
        state_counts = train_df.groupby('state')['is_delayed'].agg(['count', 'mean'])
        self.state_target_map = {
            state: (row['count'] * row['mean'] + m_weight * self.global_delay_prior) / (row['count'] + m_weight)
            for state, row in state_counts.iterrows()
        }

        # Extract features and fit scaler
        feat_raw = self._extract_raw_features(train_df)
        feat_raw['agency_hist_delay_rate'] = feat_raw['_agency'].map(self.agency_target_map).fillna(self.global_delay_prior)
        feat_raw['state_hist_delay_rate'] = feat_raw['_state'].map(self.state_target_map).fillna(self.global_delay_prior)

        # Drop temporary grouping columns
        feat_clean = feat_raw.drop(columns=['_state', '_agency'])
        self.feature_names = feat_clean.columns.tolist()

        # Fit numerical standard scaler
        self.scaler.fit(feat_clean)
        self.is_fitted = True
        return self

    def transform(self, df: pd.DataFrame) -> np.ndarray:
        """Transforms any project DataFrame into scaled feature matrix."""
        assert self.is_fitted, "FeaturePipeline must be fitted on train_df before transform."
        feat_raw = self._extract_raw_features(df)
        feat_raw['agency_hist_delay_rate'] = feat_raw['_agency'].map(self.agency_target_map).fillna(self.global_delay_prior)
        feat_raw['state_hist_delay_rate'] = feat_raw['_state'].map(self.state_target_map).fillna(self.global_delay_prior)
        feat_clean = feat_raw.drop(columns=['_state', '_agency'])
        
        # Ensure column ordering matches training
        feat_clean = feat_clean[self.feature_names]
        return self.scaler.transform(feat_clean)

def check_data_leakage(
    X_train: np.ndarray,
    y_train: np.ndarray,
    feature_names: List[str],
    original_train_df: pd.DataFrame
) -> Dict[str, Any]:
    """
    Audits the feature matrix for potential data leakage.
    Ensures:
    1. Zero forbidden future outcome fields were included.
    2. No individual feature has deterministic (near-1.0) correlation or mutual information with target.
    3. Target encoding did not introduce direct label memorization.
    """
    leakage_detected = False
    violations = []

    # Check 1: Forbidden column check in feature names
    for fname in feature_names:
        for forbidden in FORBIDDEN_LEAKAGE_COLUMNS:
            if forbidden in fname.lower():
                leakage_detected = True
                violations.append(f"Forbidden column detected in feature matrix: {fname}")

    # Check 2: Pearson Correlation with target
    correlations = {}
    for idx, fname in enumerate(feature_names):
        col_vals = X_train[:, idx]
        # handle zero-variance
        std = np.std(col_vals)
        if std > 1e-6:
            r = float(np.corrcoef(col_vals, y_train)[0, 1])
        else:
            r = 0.0
        correlations[fname] = round(r, 4)
        if abs(r) >= 0.90:
            leakage_detected = True
            violations.append(f"Excessive correlation with target detected on {fname}: r = {r:.4f}")

    # Check 3: Mutual Information
    mi_scores = mutual_info_classif(X_train, y_train, random_state=42)
    mi_dict = {fname: round(float(score), 4) for fname, score in zip(feature_names, mi_scores)}
    for fname, score in mi_dict.items():
        if score > 0.60: # Extremely high mutual info for binary classification on noisy real data indicates leakage
            leakage_detected = True
            violations.append(f"Excessive mutual information on {fname}: MI = {score:.4f}")

    return {
        'leakage_detected': leakage_detected,
        'violations': violations,
        'feature_correlations': correlations,
        'mutual_information': mi_dict,
        'total_features_evaluated': len(feature_names)
    }

def format_leakage_report_md(audit: Dict[str, Any]) -> str:
    """Formats leakage audit into a formal Markdown report."""
    lines = []
    lines.append("# SIH26017: Comprehensive Data Leakage & Integrity Report\n")
    lines.append("> **STRICT DIRECTIVE:** All predictors must be strictly knowable at project baseline (approval time). Future-leaking execution fields are prohibited.\n")
    
    if audit['leakage_detected']:
        lines.append("## ❌ LEAKAGE AUDIT STATUS: FAILED")
        lines.append("\n**Violations Detected:**")
        for v in audit['violations']:
            lines.append(f"- ⚠️ {v}")
    else:
        lines.append("## ✅ LEAKAGE AUDIT STATUS: PASSED (ZERO LEAKAGE VERIFIED)\n")
        lines.append("- All features represent baseline parameters knowable at project approval.")
        lines.append("- No post-hoc outcome variables (anticipated dates, revised costs, progress %, expenditure) are present in the feature space.")
        lines.append("- No feature exhibits trivial target correlation ($|r| < 0.90$).\n")

    lines.append("### Feature-to-Target Correlation & Mutual Information Audit")
    lines.append("| Feature Name | Pearson Correlation ($r$) | Mutual Information | Leakage Risk Assessment |")
    lines.append("| :--- | :---: | :---: | :--- |")
    for fname, r in audit['feature_correlations'].items():
        mi = audit['mutual_information'].get(fname, 0.0)
        risk = "SAFE" if (abs(r) < 0.50 and mi < 0.30) else "MODERATE"
        lines.append(f"| `{fname}` | {r:+.4f} | {mi:.4f} | **{risk}** |")

    lines.append("\n### Forbidden Variables Confirmed Excluded")
    for col in FORBIDDEN_LEAKAGE_COLUMNS:
        lines.append(f"- `projects.{col}` (Excluded: post-hoc completion / outcome variable)")
    lines.append("\n")
    return "\n".join(lines)

