"""FastAPI application entry point — Pravah House Price Predictor API.

Exposes REST endpoints for ML-powered house price prediction in Navi Mumbai.
Follows Google Python Style Guide.

Endpoints:
    GET  /             — Root info
    GET  /health       — Health check
    POST /predict      — Price prediction
    GET  /model/info   — Model metadata
    GET  /locations    — Valid Navi Mumbai locations
"""

import logging
import time
from contextlib import asynccontextmanager
from typing import Any, AsyncIterator

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.model_loader import model_loader
from app.schemas import (
    FeatureImportance,
    HealthResponse,
    LocationsResponse,
    ModelInfoResponse,
    ModelMetrics,
    PredictRequest,
    PredictResponse,
)

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)

settings = get_settings()


# ── Lifespan ─────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Manages application startup and shutdown lifecycle."""
    logger.info(
        "Starting up Pravah API — loading model from '%s'...", settings.model_path
    )
    try:
        model_loader.load(settings.model_path)
        logger.info("Model loaded successfully. API ready.")
    except FileNotFoundError:
        logger.warning(
            "model.pkl not found. Prediction endpoints will return 503 until model is available."
        )
    yield
    logger.info("Shutting down Pravah API.")


# ── App factory ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="Pravah — Navi Mumbai House Price Predictor",
    description=(
        "ML-powered REST API for predicting residential property prices in Navi Mumbai. "
        "Uses a Gradient Boosting Regressor trained on 2500 samples (R²=0.916)."
    ),
    version=settings.app_version,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── CORS Middleware ───────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request timing middleware ─────────────────────────────────────────────────
@app.middleware("http")
async def add_process_time_header(request: Request, call_next: Any) -> Any:
    """Adds X-Process-Time header to all responses."""
    start = time.perf_counter()
    response = await call_next(request)
    process_time_ms = (time.perf_counter() - start) * 1000
    response.headers["X-Process-Time"] = f"{process_time_ms:.2f}ms"
    return response


# ── Exception handlers ────────────────────────────────────────────────────────
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Catches unhandled exceptions and returns a structured JSON error."""
    logger.exception("Unhandled exception: %s", exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal error occurred. Please try again later."},
    )


# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/", tags=["General"])
async def root() -> dict[str, str]:
    """Returns basic API information."""
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health", response_model=HealthResponse, tags=["General"])
async def health_check() -> HealthResponse:
    """Returns the health status of the API and model."""
    return HealthResponse(
        status="ok" if model_loader.is_loaded else "degraded",
        model_loaded=model_loader.is_loaded,
        version=settings.app_version,
        environment=settings.env,
    )


@app.post(
    "/predict",
    response_model=PredictResponse,
    tags=["Prediction"],
    summary="Predict house price",
    response_description="Predicted price in INR with confidence range",
)
async def predict_price(request: PredictRequest) -> PredictResponse:
    """Predicts the price of a residential property in Navi Mumbai.

    Accepts property attributes and returns the predicted price along with
    price per square foot and a ±15% confidence range.

    Args:
        request: PredictRequest with all property features.

    Returns:
        PredictResponse with prediction details.

    Raises:
        HTTPException: 503 if model is not loaded; 422 on invalid input.
    """
    if not model_loader.is_loaded:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model is not available. Please try again in a moment.",
        )

    if request.floor > request.total_floors:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="floor cannot be greater than total_floors.",
        )

    result = model_loader.predict(request.model_dump())
    logger.info(
        "Prediction: location=%s, area=%.0f sqft → ₹%.0f",
        request.location,
        request.area_sqft,
        result["predicted_price"],
    )
    return PredictResponse(**result)


@app.get(
    "/model/info",
    response_model=ModelInfoResponse,
    tags=["Model"],
    summary="Get model metadata",
)
async def get_model_info() -> ModelInfoResponse:
    """Returns model metadata including metrics and feature importance.

    Raises:
        HTTPException: 503 if model is not loaded.
    """
    if not model_loader.is_loaded:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model is not loaded.",
        )

    info = model_loader.model_info
    raw_fi = info.get("feature_importance", [])
    total_importance = sum(f["importance"] for f in raw_fi) or 1.0

    return ModelInfoResponse(
        model_name=info.get("model_name", "Gradient Boosting Regressor"),
        task_type="regression",
        target_column="actual_price",
        features=info.get("features", []),
        metrics=ModelMetrics(**info.get("metrics", {})),
        feature_importance=[
            FeatureImportance(
                name=f["name"],
                importance=f["importance"],
                percentage=round(f["importance"] / total_importance * 100, 2),
            )
            for f in raw_fi
        ],
        dataset_rows=info.get("dataset_rows", 2500),
        training_time_ms=info.get("training_time_ms"),
    )


@app.get(
    "/locations",
    response_model=LocationsResponse,
    tags=["Model"],
    summary="List valid Navi Mumbai locations",
)
async def get_locations() -> LocationsResponse:
    """Returns the list of Navi Mumbai locations the model was trained on.

    Raises:
        HTTPException: 503 if model is not loaded.
    """
    if not model_loader.is_loaded:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model is not loaded.",
        )

    locs = model_loader.locations
    return LocationsResponse(locations=locs, total=len(locs))
