# SIH26017: Explainable AI (XAI) & Decision Support Documentation

## 1. Explainability Framework
To satisfy public accountability and governance standards for the Ministry of Rural Development, all predictions are explained using **SHapley Additive exPlanations (SHAP)**.
Using game-theoretic Shapley values via `TreeExplainer`, the model decomposes the log-odds of delay for any project into additive contributions from each baseline feature:

$$\text{Prediction}(x) = \phi_0 + \sum_{i=1}^{M} \phi_i(x)$$
- $\phi_0$: The baseline expected delay log-odds across all Indian central infrastructure projects.
- $\phi_i(x)$: The exact contribution of feature $i$ toward elevating ($\phi_i > 0$) or mitigating ($\phi_i < 0$) delay probability.\n
## 2. Global Feature Importance (Mean Absolute SHAP)

The table below ranks the top systemic factors driving land acquisition and project delay risk across India:

| Rank | Feature Name | Mean Absolute SHAP ($E[|\phi|]$) | Primary Policy Implication |
| :---: | :--- | :---: | :--- |
| 1 | `approval_year` | **1.4043** | Project vintage and evolving statutory compliance frameworks. |
| 2 | `agency_hist_delay_rate` | **0.4816** | Structural capacity and historical delivery velocity of the implementing authority. |
| 3 | `planned_duration_months` | **0.3711** | Timeline feasibility; compressed targets face early clearance bottlenecks. |
| 4 | `log_planned_duration` | **0.3548** | Adequacy of baseline scheduling buffer. |
| 5 | `approval_month` | **0.3309** | Seasonal procurement cycles and mobilization pacing. |
| 6 | `state_hist_delay_rate` | **0.1600** | State revenue administration efficiency and local land record digitization throughput. |
| 7 | `log_orig_cost` | **0.0587** | Capital scale complexity; large projects face multi-agency coordination friction. |
| 8 | `sector_road_transport_and_highways` | **0.0270** | National highway continuous corridor acquisition challenges. |
| 9 | `sector_water_resources` | **0.0182** | Sectoral and jurisdictional project characteristics. |
| 10 | `sector_power` | **0.0127** | Transmission corridor RoW and forest clearance requirements. |
| 11 | `sector_other` | **0.0034** | Sectoral and jurisdictional project characteristics. |
| 12 | `sector_urban_development` | **0.0032** | Urban land density and municipal right-of-way encumbrances. |

## 3. Local Decision Support Case Studies (Sample Projects)

The system translates raw mathematical SHAP vectors into structured, plain-language decision support for administrators:

### Case: `N24001272` — -LANING OF CHURACHANDPUR TUIVAI SECTION OF NH-102B (PKG- 4A)
- **Risk Level:** **CRITICAL** (98/100 Risk Score, Delay Probability: 98.1%)
- **Administrative Action:** *Urgent executive escalation. Convene inter-ministerial taskforce and expedite dispute resolution.*

**Top Delay-Elevating Factors (SHAP Risk Drivers):**
  - 🔴 **approval_year** ($\phi = +0.895$): Historical approval vintage and evolving statutory clearance norms contributed to project timeline revision
  - 🔴 **agency_hist_delay_rate** ($\phi = +0.675$): Implementing agency historical execution throughput contributed strongly to elevating delay risk
  - 🔴 **planned_duration_months** ($\phi = +0.419$): Compressed initial planned delivery window increased vulnerability to early statutory clearance disruptions

**Top Delay-Mitigating Factors:**
  - 🟢 **sector_civil_aviation** ($\phi = 0.000$): Feature sector_civil_aviation was a notable mitigating factor
  - 🟢 **is_mega_project** ($\phi = 0.000$): Project budget scale avoids mega-project multi-tier clearance bottlenecks
  - 🟢 **is_linear_infrastructure** ($\phi = 0.000$): Compact site footprint reduced multi-jurisdiction land acquisition hurdles

> *Notice:* DECISION SUPPORT ONLY: Predictions and SHAP contributions indicate statistical association, not legal causation. Human administrative review required.

### Case: `N06000198` — JAMPALI OCP RCE
- **Risk Level:** **MEDIUM** (51/100 Risk Score, Delay Probability: 51.3%)
- **Administrative Action:** *Heightened surveillance. Review monthly land acquisition and RoW handover milestones.*

**Top Delay-Elevating Factors (SHAP Risk Drivers):**
  - 🔴 **approval_year** ($\phi = +0.540$): Historical approval vintage and evolving statutory clearance norms contributed to project timeline revision
  - 🔴 **approval_month** ($\phi = +0.248$): Seasonal timing of investment sanction (monsoon/financial year-end) contributed to early-stage mobilization lead time
  - 🔴 **sector_water_resources** ($\phi = +0.012$): Water resource submergence zone land acquisition and environmental clearances contributed to timeline friction

**Top Delay-Mitigating Factors:**
  - 🟢 **is_linear_infrastructure** ($\phi = 0.000$): Compact site footprint reduced multi-jurisdiction land acquisition hurdles
  - 🟢 **is_mega_project** ($\phi = 0.000$): Project budget scale avoids mega-project multi-tier clearance bottlenecks
  - 🟢 **sector_civil_aviation** ($\phi = 0.000$): Feature sector_civil_aviation was a notable mitigating factor

> *Notice:* DECISION SUPPORT ONLY: Predictions and SHAP contributions indicate statistical association, not legal causation. Human administrative review required.

### Case: `N16000530` — SETTING UP POLYPROPYLENE UNIT AT KOCHI REFINERY
- **Risk Level:** **LOW** (2/100 Risk Score, Delay Probability: 1.9%)
- **Administrative Action:** *Routine periodic monitoring. Proceed with standard project reporting.*

**Top Delay-Elevating Factors (SHAP Risk Drivers):**
  - 🔴 **log_orig_cost** ($\phi = +0.090$): Substantial sanctioned capital expenditure outlay contributed to elevated inter-agency coordination friction
  - 🔴 **sector_water_resources** ($\phi = +0.006$): Water resource submergence zone land acquisition and environmental clearances contributed to timeline friction
  - 🔴 **sector_urban_development** ($\phi = +0.000$): Dense urban land acquisition and municipal Right-of-Way encumbrances contributed to delay exposure

**Top Delay-Mitigating Factors:**
  - 🟢 **sector_coal** ($\phi = 0.000$): Feature sector_coal was a notable mitigating factor
  - 🟢 **is_linear_infrastructure** ($\phi = 0.000$): Compact site footprint reduced multi-jurisdiction land acquisition hurdles
  - 🟢 **is_mega_project** ($\phi = 0.000$): Project budget scale avoids mega-project multi-tier clearance bottlenecks

> *Notice:* DECISION SUPPORT ONLY: Predictions and SHAP contributions indicate statistical association, not legal causation. Human administrative review required.

## 4. Responsible AI Language Standards
1. **No Causal Assertions:** System output strictly uses phrases such as *'contributed to elevating delay risk'* or *'was a mitigating factor'*. The word *'caused'* is programmatically barred.
2. **Human in the Loop:** Predictions are formulated as decision support flags to help administrators schedule joint measurement surveys or CALA reviews ahead of time.
