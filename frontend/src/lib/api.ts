/**
 * API client for the Pravah House Price Predictor backend.
 * All calls use environment variable NEXT_PUBLIC_API_URL.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PredictRequest {
    location: string;
    area_sqft: number;
    bhk: number;
    bathrooms: number;
    floor: number;
    total_floors: number;
    age_of_property: number;
    parking: boolean;
    lift: boolean;
}

export interface PredictResponse {
    predicted_price: number;
    price_per_sqft: number;
    formatted_price: string;
    confidence_low: number;
    confidence_high: number;
    formatted_confidence_low: string;
    formatted_confidence_high: string;
    location: string;
    area_sqft: number;
}

export interface FeatureImportance {
    name: string;
    importance: number;
    percentage: number;
}

export interface ModelMetrics {
    r2_score: number;
    mse: number;
    rmse: number;
    mae: number;
}

export interface ModelInfoResponse {
    model_name: string;
    task_type: string;
    target_column: string;
    features: string[];
    metrics: ModelMetrics;
    feature_importance: FeatureImportance[];
    dataset_rows: number;
    training_time_ms: number | null;
}

export interface LocationsResponse {
    locations: string[];
    total: number;
}

export interface HealthResponse {
    status: string;
    model_loaded: boolean;
    version: string;
    environment: string;
}

// ── API helpers ───────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
    const url = `${API_BASE}${path}`;
    const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json', ...init?.headers },
        ...init,
    });

    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.detail ?? `API error ${response.status}`);
    }

    return response.json() as Promise<T>;
}

// ── Exported API functions ────────────────────────────────────────────────────

/** Sends prediction request to the backend. */
export async function predictPrice(data: PredictRequest): Promise<PredictResponse> {
    return apiFetch<PredictResponse>('/predict', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

/** Fetches model metadata (metrics, feature importance). */
export async function getModelInfo(): Promise<ModelInfoResponse> {
    return apiFetch<ModelInfoResponse>('/model/info');
}

/** Fetches valid Navi Mumbai locations. */
export async function getLocations(): Promise<LocationsResponse> {
    return apiFetch<LocationsResponse>('/locations');
}

/** Checks API health. */
export async function checkHealth(): Promise<HealthResponse> {
    return apiFetch<HealthResponse>('/health');
}
