"""
SHAP Explainability Engine and Plain-Language Decision Support Generator.
STRICT RULE: Never say 'caused'. Always express contributions as decision support factors
(e.g., 'contributed strongly to elevating delay risk', 'was a notable mitigating factor').
"""

import numpy as np
import pandas as pd
import shap
from typing import Dict, Any, List, Optional

FEATURE_NARRATIVE_MAP = {
    'agency_hist_delay_rate': {
        'pos': "Implementing agency historical execution throughput contributed strongly to elevating delay risk",
        'neg': "Implementing agency historical track record of on-time delivery contributed favorably as a mitigating factor"
    },
    'state_hist_delay_rate': {
        'pos': "State-level revenue department processing lead time and land record complexity contributed to elevating delay risk",
        'neg': "State-level land governance efficiency and procedural velocity acted as a favorable risk-mitigating factor"
    },
    'post_larr_act_2013': {
        'pos': "Statutory compliance under RFCTLARR Act 2013 (consent thresholds, SIA, and comprehensive R&R) contributed to extended procedural lead time",
        'neg': "Pre-2014 regulatory pathway contributed to lower procedural compliance overhead"
    },
    'log_orig_cost': {
        'pos': "Substantial sanctioned capital expenditure outlay contributed to elevated inter-agency coordination friction",
        'neg': "Moderate sanctioned capital scale contributed to lower organizational overhead"
    },
    'is_mega_project': {
        'pos': "Designation as a mega-infrastructure project (Rs. 1,000+ Cr) contributed to higher administrative and multi-stakeholder complexity",
        'neg': "Project budget scale avoids mega-project multi-tier clearance bottlenecks"
    },
    'planned_duration_months': {
        'pos': "Compressed initial planned delivery window increased vulnerability to early statutory clearance disruptions",
        'neg': "Adequately padded initial planned timeline provided buffer against early procedural delays"
    },
    'log_planned_duration': {
        'pos': "Targeted commissioning timeline created narrow tolerance for land acquisition bottlenecks",
        'neg': "Extended planned project duration provided operational leeway"
    },
    'is_linear_infrastructure': {
        'pos': "Linear corridor alignment (requiring continuous, encumbrance-free Right-of-Way across multiple revenue villages) elevated land acquisition exposure",
        'neg': "Compact site footprint reduced multi-jurisdiction land acquisition hurdles"
    },
    'sector_road_transport_and_highways': {
        'pos': "Highway sector land parcel diversity and continuous RoW requirements contributed to delay vulnerability",
        'neg': "Highway sector standardized contracting mechanisms provided baseline execution stability"
    },
    'sector_railways': {
        'pos': "Railway alignment statutory safety approvals and multi-district land transfers contributed to delay vulnerability",
        'neg': "Railway operational framework supported structured execution"
    },
    'sector_power': {
        'pos': "Power transmission corridor and forest land diversion requirements contributed to clearance friction",
        'neg': "Power infrastructure expedited statutory track mitigated delay probability"
    },
    'sector_urban_development': {
        'pos': "Dense urban land acquisition and municipal Right-of-Way encumbrances contributed to delay exposure",
        'neg': "Urban Local Body coordination supported planned timelines"
    },
    'sector_water_resources': {
        'pos': "Water resource submergence zone land acquisition and environmental clearances contributed to timeline friction",
        'neg': "Irrigation command area prior allocations mitigated land acquisition hurdles"
    },
    'approval_year': {
        'pos': "Historical approval vintage and evolving statutory clearance norms contributed to project timeline revision",
        'neg': "Recent streamlined single-window appraisal mechanisms contributed to improved baseline pacing"
    },
    'approval_month': {
        'pos': "Seasonal timing of investment sanction (monsoon/financial year-end) contributed to early-stage mobilization lead time",
        'neg': "Favorable seasonal sanction timing aided timely initial survey mobilization"
    }
}

class ProjectExplainabilityEngine:
    """
    Computes exact TreeSHAP values and generates human-readable decision support explanations.
    """
    def __init__(self, model: Any, feature_names: List[str]):
        self.model = model
        self.feature_names = feature_names
        self.explainer = shap.TreeExplainer(model.model)
        self.base_value = float(self.explainer.expected_value[0] if isinstance(self.explainer.expected_value, np.ndarray) else self.explainer.expected_value)

    def compute_global_importance(self, X: np.ndarray) -> pd.DataFrame:
        """Calculates global mean absolute SHAP feature importance."""
        shap_values = self.explainer(X).values
        mean_abs_shap = np.abs(shap_values).mean(axis=0)
        df = pd.DataFrame({
            'feature': self.feature_names,
            'mean_abs_shap': np.round(mean_abs_shap, 4)
        }).sort_values(by='mean_abs_shap', ascending=False).reset_index(drop=True)
        return df

    def explain_project(
        self,
        X_single: np.ndarray,
        project_metadata: Optional[Dict[str, Any]] = None,
        top_k: int = 4
    ) -> Dict[str, Any]:
        """
        Generates local SHAP explanation and plain-language decision support for one project.
        """
        if X_single.ndim == 1:
            X_single = X_single.reshape(1, -1)

        shap_vals = self.explainer(X_single).values[0]
        
        # Sort features by impact on delay probability
        ranked_indices = np.argsort(shap_vals)[::-1] # highest positive first
        
        drivers: List[Dict[str, Any]] = []
        for idx in ranked_indices:
            fname = self.feature_names[idx]
            val = float(shap_vals[idx])
            
            # Determine direction
            is_risk_driver = val > 0
            narrative_template = FEATURE_NARRATIVE_MAP.get(fname, {
                'pos': f"Feature {fname} contributed to elevating delay risk",
                'neg': f"Feature {fname} was a notable mitigating factor"
            })
            
            phrase = narrative_template['pos'] if is_risk_driver else narrative_template['neg']
            drivers.append({
                'feature': fname,
                'shap_value': round(val, 4),
                'direction': 'ELEVATES_RISK' if is_risk_driver else 'MITIGATES_RISK',
                'explanation': phrase
            })

        # Separate top risk drivers and top mitigating factors
        top_risk_drivers = [d for d in drivers if d['direction'] == 'ELEVATES_RISK'][:top_k]
        top_mitigating_factors = [d for d in drivers if d['direction'] == 'MITIGATES_RISK'][:top_k]

        return {
            'project_code': project_metadata.get('project_code', 'Unknown') if project_metadata else 'Unknown',
            'project_name': project_metadata.get('project_name', 'Unknown') if project_metadata else 'Unknown',
            'base_log_odds': round(self.base_value, 4),
            'top_risk_drivers': top_risk_drivers,
            'top_mitigating_factors': top_mitigating_factors,
            'disclaimer': "DECISION SUPPORT ONLY: Predictions and SHAP contributions indicate statistical association, not legal causation. Human administrative review required."
        }

