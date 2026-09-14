"""
Risk Scoring Engine for SIH26017.
Transforms probabilistic model outputs into intuitive 0-100 Risk Scores
and categorized operational action bands (LOW / MEDIUM / HIGH / CRITICAL).
"""

from typing import Dict, Any, List, Optional
import numpy as np

DEFAULT_THRESHOLDS = {
    'low_max': 30,       # 0 - 30: LOW
    'medium_max': 60,    # 31 - 60: MEDIUM
    'high_max': 80       # 61 - 80: HIGH, 81 - 100: CRITICAL
}

BAND_DEFINITIONS = {
    'LOW': {
        'label': 'LOW RISK',
        'color': '#10B981', # Green
        'description': 'On schedule. Procedural risk profile is within normal operational tolerance.',
        'action_level': 'Routine periodic monitoring. Proceed with standard project reporting.'
    },
    'MEDIUM': {
        'label': 'MEDIUM RISK',
        'color': '#F59E0B', # Amber
        'description': 'Moderate vulnerability. Clearance lead times or agency pacing require observation.',
        'action_level': 'Heightened surveillance. Review monthly land acquisition and RoW handover milestones.'
    },
    'HIGH': {
        'label': 'HIGH RISK',
        'color': '#F97316', # Orange
        'description': 'Substantial bottleneck risk. High likelihood of statutory or administrative timeline breach.',
        'action_level': 'Priority oversight. Initiate State-level coordination review with Competent Authority (CALA).'
    },
    'CRITICAL': {
        'label': 'CRITICAL RISK',
        'color': '#EF4444', # Red
        'description': 'Acute delay probability. Multi-factor delay indicators active.',
        'action_level': 'Urgent executive escalation. Convene inter-ministerial taskforce and expedite dispute resolution.'
    }
}

class RiskEngine:
    """
    Translates calibrated delay probabilities into operational risk scores and governance bands.
    """
    def __init__(self, thresholds: Optional[Dict[str, int]] = None):
        self.thresholds = thresholds or DEFAULT_THRESHOLDS

    def score_probability(self, probability: float) -> int:
        """Maps probability [0.0, 1.0] to discrete risk score [0, 100]."""
        clamped = max(0.0, min(1.0, float(probability)))
        return int(round(clamped * 100.0))

    def classify_score(self, score: int) -> str:
        """Maps 0-100 score to risk band string."""
        if score <= self.thresholds['low_max']:
            return 'LOW'
        elif score <= self.thresholds['medium_max']:
            return 'MEDIUM'
        elif score <= self.thresholds['high_max']:
            return 'HIGH'
        else:
            return 'CRITICAL'

    def generate_risk_profile(
        self,
        probability: float,
        project_code: str = "Unknown",
        project_name: str = "Unknown",
        explanation: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Produces comprehensive risk profile for a project."""
        score = self.score_probability(probability)
        band = self.classify_score(score)
        band_meta = BAND_DEFINITIONS[band]

        profile = {
            'project_code': project_code,
            'project_name': project_name,
            'risk_score': score,
            'risk_category': band,
            'badge_label': band_meta['label'],
            'badge_color': band_meta['color'],
            'description': band_meta['description'],
            'recommended_action': band_meta['action_level'],
            'probability': round(probability, 4)
        }

        if explanation:
            profile['top_risk_drivers'] = explanation.get('top_risk_drivers', [])
            profile['top_mitigating_factors'] = explanation.get('top_mitigating_factors', [])
            profile['disclaimer'] = explanation.get('disclaimer', "DECISION SUPPORT ONLY: Predictions indicate statistical association, not legal causation.")
        else:
            profile['disclaimer'] = "DECISION SUPPORT ONLY: Predictions indicate statistical association, not legal causation."

        return profile
