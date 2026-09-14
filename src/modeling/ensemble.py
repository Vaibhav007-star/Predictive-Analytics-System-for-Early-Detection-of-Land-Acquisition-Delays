"""
Gradient Boosting Ensemble Classifier for SIH26017.
CPU-optimized, high-accuracy decision tree ensemble for predicting project delay risk.
STRICT RULE: Only baseline features knowable at approval time are used.
"""

import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import cross_val_score

class GradientBoostingDelayModel:
    """
    Tuned Gradient Boosting Classifier for project delay probability.
    Optimized for tabular infrastructure project data on CPU.
    """
    def __init__(
        self,
        n_estimators: int = 100,
        learning_rate: float = 0.05,
        max_depth: int = 3,
        subsample: float = 0.85,
        random_state: int = 42
    ):
        self.n_estimators = n_estimators
        self.learning_rate = learning_rate
        self.max_depth = max_depth
        self.subsample = subsample
        self.random_state = random_state
        self.model = GradientBoostingClassifier(
            n_estimators=n_estimators,
            learning_rate=learning_rate,
            max_depth=max_depth,
            subsample=subsample,
            random_state=random_state
        )
        self.feature_names: List[str] = []
        self.is_trained = False

    def train(self, X_train: np.ndarray, y_train: np.ndarray, feature_names: List[str]) -> 'GradientBoostingDelayModel':
        """Trains the gradient boosting model."""
        self.feature_names = feature_names
        self.model.fit(X_train, y_train)
        self.is_trained = True
        return self

    def cross_validate(self, X_train: np.ndarray, y_train: np.ndarray, cv: int = 5) -> Dict[str, float]:
        """Runs 5-fold cross validation on the training partition."""
        auc_scores = cross_val_score(self.model, X_train, y_train, cv=cv, scoring='roc_auc')
        f1_scores = cross_val_score(self.model, X_train, y_train, cv=cv, scoring='f1')
        return {
            'cv_mean_roc_auc': float(np.mean(auc_scores)),
            'cv_std_roc_auc': float(np.std(auc_scores)),
            'cv_mean_f1': float(np.mean(f1_scores)),
            'cv_std_f1': float(np.std(f1_scores))
        }

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        """Returns predicted probability of delay P(y=1|X)."""
        assert self.is_trained, "Model must be trained before predicting."
        return self.model.predict_proba(X)[:, 1]

    def predict(self, X: np.ndarray, threshold: float = 0.50) -> np.ndarray:
        """Returns binary predictions based on decision threshold."""
        probs = self.predict_proba(X)
        return (probs >= threshold).astype(int)

    def get_feature_importances(self) -> pd.DataFrame:
        """Returns Gini impurity-based feature importances."""
        assert self.is_trained, "Model must be trained to extract feature importances."
        importances = self.model.feature_importances_
        return pd.DataFrame({
            'feature': self.feature_names,
            'importance': np.round(importances, 4)
        }).sort_values(by='importance', ascending=False)

    def save(self, file_path: str) -> None:
        """Persists trained model artifact to disk."""
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        joblib.dump({
            'model': self.model,
            'feature_names': self.feature_names,
            'params': {
                'n_estimators': self.n_estimators,
                'learning_rate': self.learning_rate,
                'max_depth': self.max_depth,
                'subsample': self.subsample,
                'random_state': self.random_state
            }
        }, file_path)

    @classmethod
    def load(cls, file_path: str) -> 'GradientBoostingDelayModel':
        """Loads saved model artifact from disk."""
        data = joblib.load(file_path)
        params = data['params']
        instance = cls(**params)
        instance.model = data['model']
        instance.feature_names = data['feature_names']
        instance.is_trained = True
        return instance
