"""Model loader module — singleton for loading and serving predictions.

Google Python Style Guide compliant.
"""

import pickle
import logging
import os
from typing import Any

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


def _format_inr(amount: float) -> str:
    """Formats an INR amount into a readable string (Cr / L).

    Args:
        amount: Price in INR.

    Returns:
        Human-readable string like '₹1.25 Cr' or '₹85.00 L'.
    """
    if amount >= 1_00_00_000:  # ≥ 1 Crore
        return f"₹{amount / 1_00_00_000:.2f} Cr"
    elif amount >= 1_00_000:  # ≥ 1 Lakh
        return f"₹{amount / 1_00_000:.2f} L"
    else:
        return f"₹{amount:,.0f}"


class ModelLoader:
    """Singleton responsible for loading and using the trained model.

    Attributes:
        _model: The trained scikit-learn estimator.
        _scaler: The StandardScaler used during training.
        _label_encoder_map: Mapping of category → encoded integer per column.
        _features: Ordered list of feature names.
        _locations: List of known Navi Mumbai locations.
        _model_info: Metadata dict from training artefact.
        _is_loaded: Whether the model has been loaded successfully.
    """

    _instance: "ModelLoader | None" = None

    def __new__(cls) -> "ModelLoader":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._is_loaded = False
        return cls._instance

    def load(self, model_path: str) -> None:
        """Loads the serialized model artefact from disk.

        Args:
            model_path: Path to the pickled model file.

        Raises:
            FileNotFoundError: If the model file does not exist.
            RuntimeError: If the pickle fails to load.
        """
        if not os.path.exists(model_path):
            raise FileNotFoundError(
                f"Model file not found at '{model_path}'. "
                "Run train_model.py first to generate it."
            )

        try:
            with open(model_path, "rb") as f:
                artefact: dict[str, Any] = pickle.load(f)

            self._model = artefact["model"]
            self._scaler = artefact["scaler"]
            self._label_encoder_map: dict[str, dict[str, int]] = artefact.get(
                "label_encoder_map", {}
            )
            self._features: list[str] = artefact["features"]
            self._locations: list[str] = artefact.get("locations", [])
            self._model_info: dict[str, Any] = artefact.get("model_info", {})
            self._is_loaded = True
            logger.info("Model loaded successfully from '%s'.", model_path)
        except Exception as exc:
            logger.exception("Failed to load model: %s", exc)
            raise RuntimeError(f"Could not load model: {exc}") from exc

    @property
    def is_loaded(self) -> bool:
        """Whether the model is loaded and ready for inference."""
        return self._is_loaded

    @property
    def locations(self) -> list[str]:
        """List of known Navi Mumbai locations."""
        return sorted(self._locations)

    @property
    def model_info(self) -> dict[str, Any]:
        """Model metadata dictionary."""
        return self._model_info

    def predict(self, request_data: dict[str, Any]) -> dict[str, Any]:
        """Runs inference on a single prediction request.

        Args:
            request_data: Dictionary matching PredictRequest fields.

        Returns:
            Dictionary with predicted_price, price_per_sqft, etc.

        Raises:
            RuntimeError: If the model is not loaded.
        """
        if not self._is_loaded:
            raise RuntimeError("Model is not loaded. Call load() first.")

        # Build a DataFrame with the expected feature order
        row: dict[str, Any] = {}
        for feature in self._features:
            value = request_data.get(feature)
            if feature == "location":
                # Encode using the stored mapping; unseen → 0
                mapping = self._label_encoder_map.get("location", {})
                row[feature] = mapping.get(str(value), 0)
            elif feature in ("parking", "lift"):
                row[feature] = int(bool(value))
            else:
                row[feature] = float(value) if value is not None else 0.0

        df = pd.DataFrame([row], columns=self._features)
        df_scaled = self._scaler.transform(df)
        raw_prediction: float = float(self._model.predict(df_scaled)[0])

        area = float(request_data.get("area_sqft", 1))
        price_per_sqft = raw_prediction / area if area > 0 else 0.0
        confidence_margin = raw_prediction * 0.15

        return {
            "predicted_price": raw_prediction,
            "price_per_sqft": price_per_sqft,
            "formatted_price": _format_inr(raw_prediction),
            "confidence_low": max(0.0, raw_prediction - confidence_margin),
            "confidence_high": raw_prediction + confidence_margin,
            "formatted_confidence_low": _format_inr(
                max(0.0, raw_prediction - confidence_margin)
            ),
            "formatted_confidence_high": _format_inr(
                raw_prediction + confidence_margin
            ),
            "location": request_data.get("location", ""),
            "area_sqft": area,
        }


# Module-level singleton
model_loader = ModelLoader()
