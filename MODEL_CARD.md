# Model Card: SIH26017 Land Acquisition & Infrastructure Delay Predictor

## 1. Model Details
- **Developer:** SIH26017 Technical Team (Ministry of Rural Development challenge)
- **Model Architecture:** Gradient Boosting Decision Tree Classifier (`GradientBoostingClassifier`)
- **Version:** 1.0.0 (Phase 3 Ensemble Upgrade)
- **Model Date:** 2026-09-14
- **Framework:** scikit-learn 1.9.0 / Python 3.12 (CPU-optimized)
- **Explainability Engine:** SHAP (TreeExplainer v0.52.0)
- **License:** Open Government Data License - India (GODL-India)

## 2. Intended Use & Scope
- **Primary Objective:** Provide automated, early-stage decision support for identifying high-risk land acquisition and execution bottlenecks in central and rural infrastructure projects.
- **Intended Users:** Project Directors, Line Ministry Review Committees (MoRD, MoRTH, Railways), State Coordination Committees (CSPCC), and Monitoring Authorities.
- **Out-of-Scope Use:** Automatic administrative sanctions or punitive contractor penalties without human verification. Correlation does not imply direct legal causation.

## 3. Training & Evaluation Data
- **Source:** Ministry of Statistics and Programme Implementation (MoSPI) Flash Report on Central Sector Projects (February 2025).
- **Dataset Size:** Total $N = 1,477$ verified projects across 33 Indian States/UTs.
- **Split Strategy:** Grouped by `project_code` and stratified by delay outcome (70% Train = 1,033, 15% Validation = 222, 15% Test = 222).
- **Class Distribution:** 65.5% Delayed ($\Delta t > 0$), 34.5% On-Time / Early ($\Delta t \le 0$).
- **Predictors (19 baseline features):** Sanctioned cost, mega-project flag, planned execution duration, approval vintage, RFCTLARR Act 2013 flag, linear infrastructure flag, sectoral one-hot indicators, and empirical Bayes historical agency/state delay rates.

## 4. Performance Metrics (Out-of-Sample Test Set)
- **ROC-AUC:** **0.9425** (5-Fold CV Mean: 0.9407 ± 0.0139)
- **PR-AUC:** **0.9607** (vs Baseline Prevalence of 0.6531)
- **Accuracy:** **0.8874**
- **Precision (Delay):** **0.8797**
- **Recall (Delay):** **0.9586**
- **F1-Score:** **0.9175** (5-Fold CV Mean: 0.9178 ± 0.0089)
- **Brier Score:** **0.0872** (Well-calibrated probability)

## 5. Ethical Considerations & Caveats
- **No Fabricated Labels:** Zero artificial records or synthetic delays were used.
- **Decision Support Guardrail:** Explanations explicitly state statistical contribution rather than asserting individual causality.
- **Data Boundaries:** Does not incorporate individual landowner compensation dispute filings or High Court dockets, as these are not published in open public bulk tables.
