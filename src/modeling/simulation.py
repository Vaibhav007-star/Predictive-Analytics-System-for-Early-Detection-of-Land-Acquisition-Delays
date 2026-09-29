"""
Interactive Counterfactual Simulation & Policy Sandbox Engine for SIH26017.
Enables administrators to test mitigation levers on infrastructure projects
and calculate real-time risk reduction, saved overrun months, and capital preserved.
"""

import math
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from src.modeling.risk_engine import RiskEngine, BAND_DEFINITIONS

class MitigationSimulationEngine:
    """
    Simulates counterfactual policy interventions on a project's baseline feature representation
    and measures the delta in predicted delay risk, timeline overrun, and cost escalation.
    """

    def __init__(self, model, pipeline, risk_engine: RiskEngine):
        self.model = model
        self.pipeline = pipeline
        self.risk_engine = risk_engine

    def simulate(
        self,
        project_dict: Dict[str, Any],
        package_split_count: int = 1,
        contingency_budget_pct: float = 0.0,
        dedicated_slao_taskforce: bool = False,
        parallel_statutory_hearings: bool = False,
        row_pre_possession_pct: float = 50.0,
        execution_buffer_months: int = 0
    ) -> Dict[str, Any]:
        """
        Executes a counterfactual simulation against the trained Gradient Boosting model.
        """
        # 1. Baseline prediction
        baseline_df = pd.DataFrame([project_dict])
        X_base = self.pipeline.transform(baseline_df)
        base_prob = float(self.model.predict_proba(X_base)[0])
        base_score = self.risk_engine.score_probability(base_prob)
        base_cat = self.risk_engine.classify_score(base_score)

        # 2. Construct Counterfactual Feature Representation
        cf_row = dict(project_dict)

        # Effect of execution buffer months on planned duration
        orig_dur = float(cf_row.get('planned_duration_months', 36) or 36)
        new_dur = max(6.0, orig_dur + execution_buffer_months)
        cf_row['planned_duration_months'] = new_dur

        # Effect of package splitting on scale
        orig_cost = float(cf_row.get('orig_cost_cr', 500.0) or 500.0)
        split_factor = max(1, min(4, package_split_count))
        effective_cost = orig_cost / split_factor
        cf_row['orig_cost_cr'] = effective_cost

        cf_df = pd.DataFrame([cf_row])
        X_cf = self.pipeline.transform(cf_df)

        fnames = self.pipeline.feature_names
        
        # Lever 1: Dedicated SLAO Taskforce dampens state administrative friction
        if dedicated_slao_taskforce and 'state_hist_delay_rate' in fnames:
            idx = fnames.index('state_hist_delay_rate')
            current_val = X_cf[0, idx]
            X_cf[0, idx] = current_val * 0.65

        # Lever 2: 80%+ contiguous RoW pre-possession
        if row_pre_possession_pct >= 80.0 and 'is_linear_infrastructure' in fnames:
            idx = fnames.index('is_linear_infrastructure')
            X_cf[0, idx] = X_cf[0, idx] * 0.40

        if parallel_statutory_hearings and 'post_larr_act_2013' in fnames:
            idx = fnames.index('post_larr_act_2013')
            X_cf[0, idx] = X_cf[0, idx] * 0.70

        # Run Model on Counterfactual Vector
        sim_prob = float(self.model.predict_proba(X_cf)[0])

        # Apply contingency budget benefit
        contingency_factor = min(0.25, max(0.0, contingency_budget_pct / 100.0))
        sim_prob = max(0.05, sim_prob * (1.0 - (contingency_factor * 0.45)))

        sim_score = self.risk_engine.score_probability(sim_prob)
        sim_cat = self.risk_engine.classify_score(sim_score)

        score_delta = sim_score - base_score
        pct_reduction = round(((base_score - sim_score) / max(1, base_score)) * 100.0, 1)

        # 3. Compute Savings
        estimated_baseline_delay_months = max(0, int(round((base_score / 100.0) * 42.0)))
        estimated_simulated_delay_months = max(0, int(round((sim_score / 100.0) * 42.0)))
        months_saved = max(0, estimated_baseline_delay_months - estimated_simulated_delay_months)

        monthly_escalation_rate = 0.0045
        escalation_saved_cr = round(orig_cost * monthly_escalation_rate * months_saved, 2)

        # 4. Lever Attribution Breakdown
        levers_breakdown = []
        if package_split_count > 1:
            levers_breakdown.append({
                "lever": f"Package Splitting ({package_split_count} independent lots)",
                "description": "Reduces single-point contractor default and distributes Right-of-Way risk.",
                "relative_impact_points": min(14, int(4 * package_split_count))
            })
        if dedicated_slao_taskforce:
            levers_breakdown.append({
                "lever": "Dedicated SLAO & Joint Survey Cell",
                "description": "Expedites Section 11/19 land measurement and district court coordination.",
                "relative_impact_points": 10
            })
        if row_pre_possession_pct >= 80.0:
            levers_breakdown.append({
                "lever": f"{row_pre_possession_pct:.0f}% Contiguous RoW Pre-Handover",
                "description": "Prevents contractor idling claims and ensures uninterrupted civil mobilization.",
                "relative_impact_points": 12
            })
        if parallel_statutory_hearings:
            levers_breakdown.append({
                "lever": "Parallel Section 11 & Section 15 Hearings",
                "description": "Compresses statutory inquiry window under RFCTLARR Act 2013.",
                "relative_impact_points": 7
            })
        if contingency_budget_pct > 0:
            levers_breakdown.append({
                "lever": f"+{contingency_budget_pct:.1f}% Contingency Escrow",
                "description": "Pre-funded bank escrow eliminates disbursement delays for landowner compensation.",
                "relative_impact_points": min(10, int(contingency_budget_pct * 0.7))
            })
        if execution_buffer_months > 0:
            levers_breakdown.append({
                "lever": f"+{execution_buffer_months} Months Execution Buffer",
                "description": "Relieves compressed unrealistic procurement and seasonal monsoon schedules.",
                "relative_impact_points": min(8, int(execution_buffer_months * 0.8))
            })

        return {
            "baseline": {
                "risk_score": base_score,
                "probability": round(base_prob, 4),
                "risk_category": base_cat,
                "badge_color": BAND_DEFINITIONS[base_cat]['color'],
                "estimated_delay_months": estimated_baseline_delay_months
            },
            "simulated": {
                "risk_score": sim_score,
                "probability": round(sim_prob, 4),
                "risk_category": sim_cat,
                "badge_color": BAND_DEFINITIONS[sim_cat]['color'],
                "estimated_delay_months": estimated_simulated_delay_months
            },
            "metrics": {
                "risk_score_delta": score_delta,
                "percentage_reduction": pct_reduction,
                "months_overrun_avoided": months_saved,
                "capital_escalation_saved_cr": escalation_saved_cr
            },
            "levers_applied": {
                "package_split_count": package_split_count,
                "contingency_budget_pct": contingency_budget_pct,
                "dedicated_slao_taskforce": dedicated_slao_taskforce,
                "parallel_statutory_hearings": parallel_statutory_hearings,
                "row_pre_possession_pct": row_pre_possession_pct,
                "execution_buffer_months": execution_buffer_months
            },
            "lever_breakdown": levers_breakdown
        }
