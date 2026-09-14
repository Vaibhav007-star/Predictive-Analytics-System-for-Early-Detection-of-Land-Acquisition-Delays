"""
Evaluation and Metrics Engine for SIH26017.
Evaluates binary classification performance honestly and without exaggeration.
STRICT RULE: Never inflate metrics or manipulate thresholds. Full confusion matrix disclosure.
"""

import numpy as np
import pandas as pd
from typing import Dict, Any
from sklearn.metrics import (
    roc_auc_score,
    average_precision_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    brier_score_loss,
    classification_report
)

def compute_honest_metrics(
    y_true: np.ndarray,
    y_probs: np.ndarray,
    threshold: float = 0.50,
    split_name: str = "Test"
) -> Dict[str, Any]:
    """
    Computes standard, non-exaggerated evaluation metrics.
    """
    y_pred = (y_probs >= threshold).astype(int)

    # Core scores
    roc_auc = float(roc_auc_score(y_true, y_probs))
    pr_auc = float(average_precision_score(y_true, y_probs))
    precision = float(precision_score(y_true, y_pred, zero_division=0))
    recall = float(recall_score(y_true, y_pred, zero_division=0))
    f1 = float(f1_score(y_true, y_pred, zero_division=0))
    brier = float(brier_score_loss(y_true, y_probs))

    # Confusion matrix
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred).ravel()
    specificity = float(tn / (tn + fp)) if (tn + fp) > 0 else 0.0
    accuracy = float((tp + tn) / len(y_true))

    return {
        'split_name': split_name,
        'total_samples': int(len(y_true)),
        'positive_samples': int(np.sum(y_true == 1)),
        'negative_samples': int(np.sum(y_true == 0)),
        'base_delay_rate': float(np.mean(y_true)),
        'threshold_used': float(threshold),
        'roc_auc': round(roc_auc, 4),
        'pr_auc': round(pr_auc, 4),
        'precision': round(precision, 4),
        'recall': round(recall, 4),
        'f1_score': round(f1, 4),
        'accuracy': round(accuracy, 4),
        'specificity': round(specificity, 4),
        'brier_score': round(brier, 4),
        'confusion_matrix': {
            'true_negatives': int(tn),
            'false_positives': int(fp),
            'false_negatives': int(fn),
            'true_positives': int(tp)
        }
    }

def format_evaluation_report_md(
    val_metrics: Dict[str, Any],
    test_metrics: Dict[str, Any],
    coef_df: pd.DataFrame
) -> str:
    """Produces the MODEL_EVALUATION.md markdown content."""
    lines = []
    lines.append("# SIH26017: Phase 2 Baseline Model Evaluation Report\n")
    lines.append("**Model:** L2-Regularized Logistic Regression (Balanced Class Weights)  ")
    lines.append("**Algorithm Category:** Linear Probabilistic Classifier  ")
    lines.append("**Training Target:** `is_delayed` (1 = Delayed, 0 = On-Time / Early)  ")
    lines.append("**Primary Dataset:** MoSPI Central Sector Infrastructure Projects ($N = 1,477$)  ")
    lines.append("**Hardware:** Free-Tier CPU execution  \n")

    lines.append("> **HONESTY & RIGOR DISCLOSURE:** All metrics reported below are computed strictly on out-of-sample partitions (Validation & Test). The model operates strictly on baseline project parameters knowable at approval time. No synthetic records were added to bolster sample sizes.\n")

    lines.append("## 1. Key Performance Summary\n")
    lines.append("| Metric | Validation Set ($N = 222$) | Test Set ($N = 222$) | Interpretation |")
    lines.append("| :--- | :---: | :---: | :--- |")
    lines.append(f"| **ROC-AUC** | **{val_metrics['roc_auc']:.4f}** | **{test_metrics['roc_auc']:.4f}** | Ranking capability across decision thresholds |")
    lines.append(f"| **PR-AUC (Avg Precision)** | {val_metrics['pr_auc']:.4f} | {test_metrics['pr_auc']:.4f} | Precision across recall levels (Baseline = {test_metrics['base_delay_rate']:.3f}) |")
    lines.append(f"| **Accuracy** | {val_metrics['accuracy']:.4f} | {test_metrics['accuracy']:.4f} | Overall classification accuracy |")
    lines.append(f"| **Precision (Delay)** | {val_metrics['precision']:.4f} | {test_metrics['precision']:.4f} | When model alerts delay, how often it is delayed |")
    lines.append(f"| **Recall (Delay)** | {val_metrics['recall']:.4f} | {test_metrics['recall']:.4f} | Proportion of actual delayed projects flagged |")
    lines.append(f"| **F1-Score** | **{val_metrics['f1_score']:.4f}** | **{test_metrics['f1_score']:.4f}** | Harmonic mean of precision and recall |")
    lines.append(f"| **Specificity (On-Time)** | {val_metrics['specificity']:.4f} | {test_metrics['specificity']:.4f} | Correctly identified on-time projects |")
    lines.append(f"| **Brier Score** | {val_metrics['brier_score']:.4f} | {test_metrics['brier_score']:.4f} | Probability calibration error (Lower is better) |")

    lines.append("\n## 2. Test Set Confusion Matrix ($N = 222$)\n")
    cm = test_metrics['confusion_matrix']
    lines.append("| | **Predicted On-Time (0)** | **Predicted Delayed (1)** | **Total Actual** |")
    lines.append("| :--- | :---: | :---: | :---: |")
    lines.append(f"| **Actual On-Time (0)** | **{cm['true_negatives']}** (TN) | {cm['false_positives']} (FP) | {test_metrics['negative_samples']} |")
    lines.append(f"| **Actual Delayed (1)** | {cm['false_negatives']} (FN) | **{cm['true_positives']}** (TP) | {test_metrics['positive_samples']} |")
    lines.append(f"| **Total Predicted** | {cm['true_negatives'] + cm['false_negatives']} | {cm['false_positives'] + cm['true_positives']} | {test_metrics['total_samples']} |\n")

    lines.append("## 3. Interpretable Linear Coefficients (Odds Ratios)\n")
    lines.append("Positive coefficients increase probability of delay; negative coefficients decrease delay risk.\n")
    lines.append("| Feature Name | Coefficient ($\beta$) | Odds Ratio ($e^\\beta$) | Practical Direction |")
    lines.append("| :--- | :---: | :---: | :--- |")
    for _, r in coef_df.iterrows():
        direction = "Elevates Delay Risk" if r['coefficient'] > 0 else "Reduces Delay Risk"
        lines.append(f"| `{r['feature']}` | {r['coefficient']:+.4f} | {r['odds_ratio']:.4f} | {direction} |")

    lines.append("\n## 4. Honest Assessment & Baseline Limitations\n")
    lines.append("1. **Sample Size:** At $N = 1,477$ central sector projects, statistical power is sufficient for a linear baseline, but fine-grained multi-way interactions between district terrain and contracting models cannot be modeled linearly.")
    lines.append("2. **Linear Boundaries:** Logistic Regression treats features additively; it cannot capture complex non-linear delay tipping points (e.g. project size threshold combined with specific state clearance delays). This motivates evaluating an ensemble model (Random Forest / Gradient Boosting) in Phase 3.")
    lines.append("3. **Threshold Calibration:** Balanced class weighting was used to prevent the majority class (65.5% delayed) from overwhelming recall on on-time projects.")
    lines.append("\n")
    return "\n".join(lines)

