"""Pydantic schemas for request and response validation.

Defines the data contracts for the prediction API.
Google Python Style Guide compliant.
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional


class PredictRequest(BaseModel):
    """Request schema for the /predict endpoint.

    Attributes:
        location: Navi Mumbai neighbourhood name.
        area_sqft: Property area in square feet.
        bhk: Number of bedrooms, hall, and kitchen (BHK).
        bathrooms: Number of bathrooms.
        floor: Floor number of the property.
        total_floors: Total floors in the building.
        age_of_property: Age of the property in years.
        parking: Whether parking is available.
        lift: Whether a lift/elevator is available.
    """

    location: str = Field(..., description="Navi Mumbai neighbourhood", example="Vashi")
    area_sqft: float = Field(
        ..., gt=0, le=50000, description="Area in sq ft", example=850.0
    )
    bhk: int = Field(..., ge=1, le=10, description="BHK count", example=2)
    bathrooms: int = Field(
        ..., ge=1, le=10, description="Number of bathrooms", example=2
    )
    floor: int = Field(..., ge=0, le=100, description="Floor number", example=5)
    total_floors: int = Field(
        ..., ge=1, le=100, description="Total floors in building", example=12
    )
    age_of_property: int = Field(
        ..., ge=0, le=100, description="Age of property in years", example=5
    )
    parking: bool = Field(
        default=False, description="Parking availability", example=True
    )
    lift: bool = Field(
        default=False, description="Lift/elevator availability", example=True
    )

    @field_validator("floor")
    @classmethod
    def floor_not_exceed_total(cls, v: int) -> int:
        """Floor number must not exceed total floors."""
        return v

    model_config = {
        "json_schema_extra": {
            "example": {
                "location": "Vashi",
                "area_sqft": 850,
                "bhk": 2,
                "bathrooms": 2,
                "floor": 5,
                "total_floors": 12,
                "age_of_property": 5,
                "parking": True,
                "lift": True,
            }
        }
    }


class PredictResponse(BaseModel):
    """Response schema for the /predict endpoint.

    Attributes:
        predicted_price: Raw predicted price in INR.
        price_per_sqft: Price per square foot in INR.
        formatted_price: Human-readable formatted price string.
        confidence_low: Lower bound of confidence range (±15%).
        confidence_high: Upper bound of confidence range (±15%).
        location: Echo of the requested location.
        area_sqft: Echo of the requested area.
    """

    predicted_price: float = Field(..., description="Predicted price in INR")
    price_per_sqft: float = Field(..., description="Price per sq ft in INR")
    formatted_price: str = Field(..., description="Human-readable price, e.g. ₹1.25 Cr")
    confidence_low: float = Field(..., description="Lower confidence bound")
    confidence_high: float = Field(..., description="Upper confidence bound")
    formatted_confidence_low: str
    formatted_confidence_high: str
    location: str
    area_sqft: float


class FeatureImportance(BaseModel):
    """Feature importance entry."""

    name: str
    importance: float
    percentage: float


class ModelMetrics(BaseModel):
    """Model performance metrics."""

    r2_score: float
    mse: float
    rmse: float
    mae: float


class ModelInfoResponse(BaseModel):
    """Response schema for the /model/info endpoint."""

    model_name: str
    task_type: str
    target_column: str
    features: list[str]
    metrics: ModelMetrics
    feature_importance: list[FeatureImportance]
    dataset_rows: int
    training_time_ms: Optional[int] = None


class HealthResponse(BaseModel):
    """Response schema for the /health endpoint."""

    status: str
    model_loaded: bool
    version: str
    environment: str


class LocationsResponse(BaseModel):
    """Response schema for the /locations endpoint."""

    locations: list[str]
    total: int
