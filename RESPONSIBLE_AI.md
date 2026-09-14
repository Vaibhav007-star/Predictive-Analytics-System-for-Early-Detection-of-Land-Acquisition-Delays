# Responsible AI & Algorithmic Governance Framework: SIH26017

**System:** Predictive Analytics System for Early Detection of Land Acquisition Delays  
**Authority:** Ministry of Rural Development, Government of India  
**Standard:** Ethical AI in Public Governance & Decision Support (NITI Aayog National Strategy for AI Compliant)

---

## 1. Foundational Governance Principles

### Principle 1: Human-in-the-Loop Decision Support (Advisory Only)
The primary directive of SIH26017 is to augment human administrative oversight, not to automate executive discretion. Machine learning risk scores and SHAP feature attributions serve strictly as **early-warning prioritization signals** for District Collectors, Special Land Acquisition Officers (SLAOs), and Project Directors. Automated penalties, blacklisting, or contract cancellations are strictly prohibited.

### Principle 2: Strict Prohibition of Causal Claims
In observational administrative datasets, correlation does not establish legal or operational causation.
- **Enforced Policy:** The system enforces a hard constraint against words asserting direct blame or certainty (e.g. *"caused"*, *"fault"*, *"guilty"*).
- **Approved Terminology:** Explanations strictly employ non-causal attribution language:
  - *"Contributed to elevating delay risk"*
  - *"Favorable mitigating factor"*
  - *"Historical administrative tendency"*

### Principle 3: Absolute Data Traceability (Zero Fabrication)
Public trust in government analytics demands uncompromising authenticity:
- No artificial, simulated, or mocked project records are used.
- All statistics, cost figures, and timelines originate from published Ministry of Statistics and Programme Implementation (MoSPI) Flash Reports and PMGSY OMMAS databases.
- Automated integrity scripts (`scripts/verify_honesty.py`) verify SHA-256 source file checksums and record counts prior to deployment.

---

## 2. Bias Mitigation & Geographic Fairness

### Historical Reporting Disparities
Infrastructure execution rates vary across states due to differing topographical terrain, forest coverage, tribal administrative schedules (Fifth/Sixth Schedule areas), and administrative capacities.
- **Empirical Bayes Smoothing:** To prevent disproportionately penalizing states or implementing agencies with only one or two monitored projects, the feature engineering pipeline applies $m$-estimate smoothing ($m = 5$ pseudo-counts):
  $$\hat{p}_{\text{smoothed}} = \frac{n_{\text{delayed}} + m \cdot p_{\text{national}}}{n_{\text{total}} + m}$$
  This regularizes sparse records toward the national baseline, preventing unfair stigmatization of newly formed states or smaller public sector enterprises.

### Sectoral Proportionality
Large linear infrastructure projects (e.g. dedicated freight railway corridors, 8-lane expressway greenfields) have inherently longer gestations than compact urban telecom substations. The model normalizes cost on a logarithmic scale and includes sector indicators to evaluate project risks within their appropriate infrastructure domain.

---

## 3. Transparency & Explainability (XAI) Standards

1. **Local Interpretability (SHAP TreeExplainer):**
   Every prediction is paired with its exact Shapley value decomposition in log-odds space. Administrators can see the precise mathematical contribution of each baseline factor to the final risk score.
2. **Actionable Translation:**
   Abstract SHAP scores are translated directly into plain-language administrative recommendations (e.g. checking Section 11 Social Impact Assessment filings, scheduling joint verification with District Collectors).
3. **Explicit Uncertainty & Precision Disclosure:**
   Geospatial markers disclose their exact precision level (`State-level centroid`), ensuring decision-makers never conflate administrative centroids with physical site boundaries.

---

## 4. Administrative Accountability & Audit Trail

To prevent misuse or unauthorized alterations:
- **Role-Based Clearance:** Strict separation between `Admin` (MoRD Officers authorized to log interventions) and `Viewer` (auditors and public observers with read-only access).
- **Tamper-Evident Audit Logging:** Key administrative events — including user authentication, intervention orders, and parameter adjustments — are permanently recorded in the `audit_logs` SQLite table with ISO timestamps, user identities, and action summaries.
- **Dual Verification:** Interventions logged on a project code are visible to all authorized stakeholders, creating institutional memory and multi-agency transparency.

