"""
Baseline Logistic Regression Model for SIH26017.
Trains ONE simple, lightweight, interpretable baseline model on CPU.
STRICT RULE: Fast, transparent baseline — no complex ensembling or survival modeling in Phase 2.
"""

import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple
from sklearn.linear_model import LogisticRegression
import joblib
import os

class BaselineDelayModel:
    """
    Standard L2-regularized Logistic Regression classifier for project delay probability.
    Predicts probability P(Delay = 1 | Baseline Project Features).
    """
    def __init__(self, C: float = 1.0, random_state: int = 42):
        self.model = LogisticRegression(
            C=C,
            solver='lbfgs',
            max_iter=1000,
            class_weight='balanced',
            random_state=random_state
        )
        self.feature_names = []
        self.is_trained = False

    def train(self, X_train: np.ndarray, y_train: np.ndarray, feature_names: list) -> 'BaselineDelayModel':
        """Trains the logistic regression classifier."""
        self.feature_names = feature_names
        self.model.fit(X_train, y_train)
        self.is_trained = True
        return self

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        """Returns predicted probability of delay (class 1)."""
        assert self.is_trained, "Model must be trained before predicting."
        return self.model.predict_proba(X)[:, 1]

    def predict(self, X: np.ndarray, threshold: float = 0.50) -> np.ndarray:
        """Returns binary predictions based on probability threshold."""
        probs = self.predict_proba(X)
        return (probs >= threshold).astype(int)

    def get_feature_coefficients(self) -> pd.DataFrame:
        """Returns sorted feature weights and odds ratios for model interpretability."""
        assert self.is_trained, "Model must be trained to inspect coefficients."
        coefs = self.model.coef_[0]
        odds_ratios = np.exp(coefs)
        df = pd.DataFrame({
            'feature': self.feature_names,
            'coefficient': np.round(coefs, 4),
            'odds_ratio': np.round(odds_ratios, 4)
        }).sort_values(by='coefficient', ascending=False)
        return df

    def save(self, file_path: str) -> None:
        """Persists trained model to disk."""
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        joblib.dump({
            'model': self.model,
            'feature_names': self.feature_names,
            'intercept': float(self.model.intercept_[0])
        }, file_path)

    @classmethod
    def load(cls, file_path: str) -> 'BaselineDelayModel':
        """Loads model from disk."""
        data = joblib.load(file_path)
        instance = cls()
        instance.model = data['model']
        instance.feature_names = data['feature_names']
        instance.is_trained = True
        return instance
