"""Model training script for Navi Mumbai House Price Prediction.

This script loads the cleaned dataset, preprocesses features, trains a
Gradient Boosting Regressor, and saves the artefact as model.pkl.

Usage:
    python train_model.py [--data-path DATA_PATH] [--output OUTPUT]

Example:
    python train_model.py --data-path data/navi_mumbai.csv --output model.pkl
"""

import argparse
import json
import logging
import os
import pickle
import sys
import time
from typing import Any

import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(message)s",
)
logger = logging.getLogger(__name__)

# ── Constants ──────────────────────────────────────────────────────────────────
TARGET_COLUMN = "actual_price"
CATEGORICAL_FEATURES = ["location"]
BOOLEAN_FEATURES = ["parking", "lift"]
NUMERIC_FEATURES = [
    "area_sqft",
    "bhk",
    "bathrooms",
    "floor",
    "total_floors",
    "age_of_property",
]
ALL_FEATURES = ["location"] + NUMERIC_FEATURES + BOOLEAN_FEATURES
TEST_SPLIT = 0.20
RANDOM_STATE = 42

# Known Navi Mumbai neighbourhoods (used as fallback if not in CSV)
NAVI_MUMBAI_LOCATIONS = [
    "Vashi",
    "Nerul",
    "Belapur CBD",
    "Kharghar",
    "Panvel",
    "Airoli",
    "Ghansoli",
    "Kopar Khairane",
    "Sanpada",
    "Turbhe",
    "Rabale",
    "Mahape",
    "Juinagar",
    "Seawoods",
    "Ulwe",
    "Taloja",
    "Kamothe",
    "Kalamboli",
    "Dronagiri",
    "Uran",
    "Nagothane",
    "New Panvel",
    "Roadpali",
    "Khandeshwar",
    "Mansarovar",
    "Sion Panvel Highway",
    "Sector 21",
    "Sector 15",
    "Sector 7",
    "Palm Beach Road",
]


def _generate_synthetic_data(n_samples: int = 2500) -> pd.DataFrame:
    """Generates realistic synthetic training data when CSV is unavailable.

    Args:
        n_samples: Number of synthetic samples to generate.

    Returns:
        DataFrame with all required features and target column.
    """
    logger.warning("CSV not found — generating synthetic data for training.")
    rng = np.random.default_rng(RANDOM_STATE)

    locations = rng.choice(NAVI_MUMBAI_LOCATIONS, size=n_samples)
    bhk = rng.integers(1, 6, size=n_samples)
    bathrooms = np.clip(bhk + rng.integers(-1, 2, size=n_samples), 1, 6)
    area_sqft = (bhk * 350 + rng.normal(0, 100, size=n_samples)).clip(300, 6000)
    total_floors = rng.integers(3, 40, size=n_samples)
    floor = np.array([rng.integers(0, tf + 1) for tf in total_floors])
    age_of_property = rng.integers(0, 30, size=n_samples)
    parking = rng.choice([0, 1], size=n_samples, p=[0.3, 0.7])
    lift = rng.choice([0, 1], size=n_samples, p=[0.2, 0.8])

    # Premium neighbourhoods get multiplier
    premium = {"Vashi", "Nerul", "Belapur CBD", "Seawoods", "Palm Beach Road"}
    loc_multiplier = np.where(np.isin(locations, list(premium)), 1.4, 1.0)

    # Price formula: realistic Navi Mumbai pricing
    base_price = (
        area_sqft * 8500
        + bhk * 200_000
        + (total_floors - floor) * 5000
        - age_of_property * 30_000
        + parking * 150_000
        + lift * 80_000
    ) * loc_multiplier

    noise = rng.normal(1.0, 0.08, size=n_samples)
    actual_price = (base_price * noise).clip(1_500_000, 8_00_00_000)

    return pd.DataFrame(
        {
            "location": locations,
            "area_sqft": area_sqft.round(1),
            "bhk": bhk,
            "bathrooms": bathrooms,
            "floor": floor,
            "total_floors": total_floors,
            "age_of_property": age_of_property,
            "parking": parking,
            "lift": lift,
            TARGET_COLUMN: actual_price.round(-3),
        }
    )


def load_data(data_path: str) -> pd.DataFrame:
    """Loads the dataset from CSV or falls back to synthetic data.

    Args:
        data_path: Path to the CSV file.

    Returns:
        Loaded (or synthetic) DataFrame.
    """
    if os.path.exists(data_path):
        logger.info("Loading data from '%s'...", data_path)
        df = pd.read_csv(data_path)
        logger.info("Loaded %d rows × %d columns.", len(df), len(df.columns))
        return df
    return _generate_synthetic_data()


def preprocess(df: pd.DataFrame) -> tuple[pd.DataFrame, Any, dict[str, dict[str, int]]]:
    """Preprocesses the DataFrame for training.

    Args:
        df: Raw input DataFrame.

    Returns:
        Tuple of (processed DataFrame, fitted StandardScaler,
                  label_encoder_map for categorical features).
    """
    df = df.copy()

    # Drop rows where target or features are null
    df = df.dropna(subset=[TARGET_COLUMN] + ALL_FEATURES)

    # Encode categoricals
    label_encoder_map: dict[str, dict[str, int]] = {}
    for col in CATEGORICAL_FEATURES:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col].astype(str))
        label_encoder_map[col] = {cls: idx for idx, cls in enumerate(le.classes_)}

    # Ensure boolean features are int
    for col in BOOLEAN_FEATURES:
        df[col] = df[col].astype(int)

    # Scale
    scaler = StandardScaler()
    df[ALL_FEATURES] = scaler.fit_transform(df[ALL_FEATURES])

    return df, scaler, label_encoder_map


def train(
    df: pd.DataFrame,
) -> tuple[GradientBoostingRegressor, dict[str, float]]:
    """Trains the Gradient Boosting Regressor.

    Args:
        df: Preprocessed DataFrame.

    Returns:
        Tuple of (fitted model, metrics dict).
    """
    X = df[ALL_FEATURES]
    y = df[TARGET_COLUMN]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SPLIT, random_state=RANDOM_STATE
    )

    model = GradientBoostingRegressor(
        n_estimators=200,
        learning_rate=0.05,
        max_depth=5,
        min_samples_split=5,
        min_samples_leaf=3,
        subsample=0.8,
        random_state=RANDOM_STATE,
    )

    logger.info("Training GradientBoostingRegressor on %d samples...", len(X_train))
    t0 = time.perf_counter()
    model.fit(X_train, y_train)
    elapsed_ms = int((time.perf_counter() - t0) * 1000)

    y_pred = model.predict(X_test)
    metrics = {
        "r2_score": float(r2_score(y_test, y_pred)),
        "mse": float(mean_squared_error(y_test, y_pred)),
        "rmse": float(np.sqrt(mean_squared_error(y_test, y_pred))),
        "mae": float(mean_absolute_error(y_test, y_pred)),
    }

    logger.info("Training complete in %dms.", elapsed_ms)
    logger.info(
        "R²=%.4f | RMSE=₹%.0f | MAE=₹%.0f",
        metrics["r2_score"],
        metrics["rmse"],
        metrics["mae"],
    )

    return model, metrics, elapsed_ms


def save_artefact(
    output_path: str,
    model: GradientBoostingRegressor,
    scaler: StandardScaler,
    label_encoder_map: dict[str, dict[str, int]],
    metrics: dict[str, float],
    locations: list[str],
    elapsed_ms: int,
    n_rows: int,
) -> None:
    """Saves the model artefact as a pickle file.

    Args:
        output_path: Destination path for model.pkl.
        model: Fitted GradientBoostingRegressor.
        scaler: Fitted StandardScaler.
        label_encoder_map: Category → int mapping per column.
        metrics: Evaluation metrics dict.
        locations: Unique location values from training data.
        elapsed_ms: Training time in milliseconds.
        n_rows: Number of training rows.
    """
    feature_importance = []
    for name, imp in zip(ALL_FEATURES, model.feature_importances_):
        feature_importance.append({"name": name, "importance": float(imp)})
    feature_importance.sort(key=lambda x: x["importance"], reverse=True)

    artefact = {
        "model": model,
        "scaler": scaler,
        "label_encoder_map": label_encoder_map,
        "features": ALL_FEATURES,
        "locations": locations,
        "model_info": {
            "model_name": "Gradient Boosting Regressor",
            "features": ALL_FEATURES,
            "metrics": metrics,
            "feature_importance": feature_importance,
            "dataset_rows": n_rows,
            "training_time_ms": elapsed_ms,
        },
    }

    with open(output_path, "wb") as f:
        pickle.dump(artefact, f)

    logger.info("Artefact saved to '%s'.", output_path)


def main() -> None:
    """Main entry point for model training."""
    parser = argparse.ArgumentParser(description="Train Navi Mumbai house price model.")
    parser.add_argument(
        "--data-path",
        default="data/navi_mumbai_real_estate_uncleaned_2500_cleaned.csv",
        help="Path to the training CSV file.",
    )
    parser.add_argument("--output", default="model.pkl", help="Output model path.")
    args = parser.parse_args()

    # Load data
    df_raw = load_data(args.data_path)

    # Extract locations before encoding
    if "location" in df_raw.columns:
        locations = sorted(df_raw["location"].dropna().unique().tolist())
    else:
        locations = NAVI_MUMBAI_LOCATIONS

    # Preprocess
    df_processed, scaler, label_encoder_map = preprocess(df_raw)
    n_rows = len(df_processed)

    # Train
    model, metrics, elapsed_ms = train(df_processed)

    # Save
    save_artefact(
        output_path=args.output,
        model=model,
        scaler=scaler,
        label_encoder_map=label_encoder_map,
        metrics=metrics,
        locations=locations,
        elapsed_ms=elapsed_ms,
        n_rows=n_rows,
    )

    # Print summary
    print("\n" + "=" * 55)
    print("  Pravah Model Training Summary")
    print("=" * 55)
    print(f"  Dataset rows  : {n_rows}")
    print(f"  R² Score      : {metrics['r2_score']:.4f}")
    print(f"  RMSE          : ₹{metrics['rmse']:,.0f}")
    print(f"  MAE           : ₹{metrics['mae']:,.0f}")
    print(f"  Training time : {elapsed_ms}ms")
    print(f"  Output        : {args.output}")
    print("=" * 55)


if __name__ == "__main__":
    main()
