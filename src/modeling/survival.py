"""
Dynamic Survival Analysis & Delay Hazard Modeling Engine for SIH26017.
Models infrastructure gestation delay probabilities using continuous Weibull survival curves,
monthly hazard rates, peak danger windows, and completion confidence intervals.
"""

import math
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional


class SurvivalHazardEngine:
    """
    Computes time-to-delay survival functions S(t) and hazard rates h(t)
    parameterized by a 2-parameter Weibull distribution:
        S(t) = exp(-(t / lambda)^k)
    where:
        lambda = scale parameter (characteristic gestation time)
        k = shape parameter (wear-out / risk acceleration parameter)
    """

    @staticmethod
    def calculate_survival_curve(
        project_dict: Dict[str, Any],
        risk_score: Optional[int] = None,
        max_months: int = 60
    ) -> Dict[str, Any]:
        """
        Calculates the Weibull survival curve, monthly hazard rates,
        peak danger window, and completion confidence intervals.
        """
        score = risk_score if risk_score is not None else int(project_dict.get('risk_score', 50) or 50)
        planned_duration = float(project_dict.get('planned_duration_months', 36) or 36)
        orig_cost_cr = float(project_dict.get('orig_cost_cr', 500) or 500)
        is_linear = int(project_dict.get('is_linear_infrastructure', 0) or 0)
        sector = str(project_dict.get('sector', '')).upper()

        # Calibration of Weibull parameters:
        # Higher risk score -> smaller lambda (delay happens earlier)
        # k > 1 implies increasing failure/delay rate over time (aging/statutory friction buildup)
        k = 1.95 + (0.35 if is_linear else 0.1) + (0.2 if score >= 75 else 0.0)
        
        # Base scale: baseline duration adjusted for risk score
        risk_factor = max(0.2, (100 - score * 0.65) / 100.0)
        lam = max(12.0, planned_duration * risk_factor * 1.1)

        hazard_points = []
        for m in range(1, max_months + 1):
            # S(t) = exp(-(t / lam)^k)
            t_ratio = m / lam
            exponent = math.pow(t_ratio, k)
            s_t = math.exp(-min(25.0, exponent))
            s_t = max(0.001, min(0.999, s_t))
            delay_prob = 1.0 - s_t

            # Cumulative hazard H(t) = (t / lam)^k
            cum_hazard = exponent

            # Monthly hazard rate h(t) = (k / lam) * (t / lam)^(k - 1)
            instant_hazard = (k / lam) * math.pow(t_ratio, max(0.0, k - 1.0))
            hazard_rate_pct = round(instant_hazard * 100.0, 2)

            hazard_points.append({
                'month': m,
                'survival_probability': round(s_t, 4),
                'delay_probability': round(delay_prob, 4),
                'cumulative_hazard': round(cum_hazard, 4),
                'monthly_hazard_rate': hazard_rate_pct
            })

        # Determine Peak Danger Window (typically where hazard rate accelerates or reaches inflection)
        # For infrastructure in India, Month 18-30 is peak RoW acquisition & civil contractor mobilization
        peak_month = max(12, min(42, int(lam * math.pow((k - 1.0) / k, 1.0 / k) if k > 1 else lam * 0.7)))
        window_start = max(6, peak_month - 6)
        window_end = peak_month + 6

        peak_danger = {
            'window': f"Month {window_start} – Month {window_end}",
            'peak_month': peak_month,
            'statutory_milestone': (
                "Section 19 Declaration to Section 23 Award"
                if is_linear else "Utility Relocation & Environmental Clearance Stage"
            ),
            'description': (
                f"Peak vulnerability occurs at Month {peak_month} where monthly hazard rate reaches "
                f"{hazard_points[peak_month - 1]['monthly_hazard_rate']}%. Proceedings face severe "
                f"Section 25 lapse exposure if land awards are not disbursed."
            )
        }

        # Forecasting confidence intervals
        expected_overrun = int(round((score / 100.0) * (planned_duration * 0.65)))
        ci_80_low = max(0, int(expected_overrun * 0.6))
        ci_80_high = int(expected_overrun * 1.4 + 3)
        ci_95_low = max(0, int(expected_overrun * 0.4))
        ci_95_high = int(expected_overrun * 1.8 + 6)

        current_year = datetime.now(timezone.utc).year
        original_target = f"Q4 {current_year + int(planned_duration / 12)}"
        expected_comp = f"Q{min(4, 1 + (expected_overrun % 4))} {current_year + int((planned_duration + expected_overrun) / 12)}"
        conf_range = f"{expected_overrun - ci_80_low} to {ci_80_high} months overrun"

        forecasting = {
            'expected_overrun_months': expected_overrun,
            'confidence_interval_80_months': [ci_80_low, ci_80_high],
            'confidence_interval_95_months': [ci_95_low, ci_95_high],
            'projected_dates': {
                'original_target': original_target,
                'expected_completion': expected_comp,
                'confidence_range_80': conf_range
            }
        }

        return {
            'weibull_parameters': {
                'shape_k': round(k, 3),
                'scale_lambda_months': round(lam, 2)
            },
            'hazard_curve': hazard_points,
            'peak_danger_window': peak_danger,
            'forecasting': forecasting
        }
