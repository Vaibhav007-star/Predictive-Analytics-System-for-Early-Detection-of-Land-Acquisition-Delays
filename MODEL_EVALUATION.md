# SIH26017: Phase 2 Baseline Model Evaluation Report

**Model:** L2-Regularized Logistic Regression (Balanced Class Weights)  
**Algorithm Category:** Linear Probabilistic Classifier  
**Training Target:** `is_delayed` (1 = Delayed, 0 = On-Time / Early)  
**Primary Dataset:** MoSPI Central Sector Infrastructure Projects ($N = 1,477$)  
**Hardware:** Free-Tier CPU execution  

> **HONESTY & RIGOR DISCLOSURE:** All metrics reported below are computed strictly on out-of-sample partitions (Validation & Test). The model operates strictly on baseline project parameters knowable at approval time. No synthetic records were added to bolster sample sizes.

## 1. Key Performance Summary

| Metric | Validation Set ($N = 222$) | Test Set ($N = 222$) | Interpretation |
| :--- | :---: | :---: | :--- |
| **ROC-AUC** | **0.8579** | **0.9119** | Ranking capability across decision thresholds |
| **PR-AUC (Avg Precision)** | 0.8945 | 0.9504 | Precision across recall levels (Baseline = 0.653) |
| **Accuracy** | 0.7793 | 0.8018 | Overall classification accuracy |
| **Precision (Delay)** | 0.8636 | 0.8976 | When model alerts delay, how often it is delayed |
| **Recall (Delay)** | 0.7862 | 0.7862 | Proportion of actual delayed projects flagged |
| **F1-Score** | **0.8231** | **0.8382** | Harmonic mean of precision and recall |
| **Specificity (On-Time)** | 0.7662 | 0.8312 | Correctly identified on-time projects |
| **Brier Score** | 0.1484 | 0.1245 | Probability calibration error (Lower is better) |

## 2. Test Set Confusion Matrix ($N = 222$)

| | **Predicted On-Time (0)** | **Predicted Delayed (1)** | **Total Actual** |
| :--- | :---: | :---: | :---: |
| **Actual On-Time (0)** | **64** (TN) | 13 (FP) | 77 |
| **Actual Delayed (1)** | 31 (FN) | **114** (TP) | 145 |
| **Total Predicted** | 95 | 127 | 222 |

## 3. Interpretable Linear Coefficients (Odds Ratios)

Positive coefficients increase probability of delay; negative coefficients decrease delay risk.

| Feature Name | Coefficient ($eta$) | Odds Ratio ($e^\beta$) | Practical Direction |
| :--- | :---: | :---: | :--- |
| `agency_hist_delay_rate` | +0.8206 | 2.2719 | Elevates Delay Risk |
| `post_larr_act_2013` | +0.5630 | 1.7559 | Elevates Delay Risk |
| `state_hist_delay_rate` | +0.4336 | 1.5428 | Elevates Delay Risk |
| `sector_power` | +0.2827 | 1.3267 | Elevates Delay Risk |
| `log_orig_cost` | +0.1681 | 1.1831 | Elevates Delay Risk |
| `sector_petroleum` | +0.1500 | 1.1618 | Elevates Delay Risk |
| `sector_other` | +0.0993 | 1.1044 | Elevates Delay Risk |
| `sector_urban_development` | +0.0491 | 1.0503 | Elevates Delay Risk |
| `sector_railways` | +0.0059 | 1.0059 | Elevates Delay Risk |
| `sector_civil_aviation` | -0.0856 | 0.9180 | Reduces Delay Risk |
| `is_mega_project` | -0.0879 | 0.9158 | Reduces Delay Risk |
| `sector_coal` | -0.0992 | 0.9056 | Reduces Delay Risk |
| `sector_road_transport_and_highways` | -0.1091 | 0.8967 | Reduces Delay Risk |
| `is_linear_infrastructure` | -0.1110 | 0.8949 | Reduces Delay Risk |
| `log_planned_duration` | -0.1541 | 0.8572 | Reduces Delay Risk |
| `approval_month` | -0.3226 | 0.7243 | Reduces Delay Risk |
| `sector_water_resources` | -0.3307 | 0.7184 | Reduces Delay Risk |
| `planned_duration_months` | -1.6705 | 0.1881 | Reduces Delay Risk |
| `approval_year` | -2.9796 | 0.0508 | Reduces Delay Risk |

## 4. Honest Assessment & Baseline Limitations

1. **Sample Size:** At $N = 1,477$ central sector projects, statistical power is sufficient for a linear baseline, but fine-grained multi-way interactions between district terrain and contracting models cannot be modeled linearly.
2. **Linear Boundaries:** Logistic Regression treats features additively; it cannot capture complex non-linear delay tipping points (e.g. project size threshold combined with specific state clearance delays). This motivates evaluating an ensemble model (Random Forest / Gradient Boosting) in Phase 3.
3. **Threshold Calibration:** Balanced class weighting was used to prevent the majority class (65.5% delayed) from overwhelming recall on on-time projects.

