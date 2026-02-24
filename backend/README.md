# Pravah Backend — Navi Mumbai House Price Predictor API

FastAPI-based REST API that serves ML predictions for residential property prices in Navi Mumbai, India.

## Stack

| Layer | Technology |
|---|---|
| Framework | FastAPI 0.111 |
| ML Model | Gradient Boosting Regressor (scikit-learn) |
| Validation | Pydantic v2 |
| Server | Uvicorn |
| Deployment | Render |

## Model Performance

| Metric | Value |
|---|---|
| R² Score | 0.916 |
| MAE | ₹25.1 L |
| RMSE | ₹37.5 L |
| Training Samples | 2500 |

## Local Setup

```bash
cd backend

# 1. Create virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # Linux/Mac

# 2. Install dependencies
pip install -r requirements.txt

# 3. (Optional) Place your CSV in data/
#    data/navi_mumbai_real_estate_uncleaned_2500_cleaned.csv
#    If missing, synthetic data will be used.

# 4. Train the model
python train_model.py

# 5. Copy env file and configure
cp .env.example .env

# 6. Start the server
uvicorn app.main:app --reload
```

### API Docs

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | API info |
| GET | `/health` | Health check |
| POST | `/predict` | Predict house price |
| GET | `/model/info` | Model metadata & feature importance |
| GET | `/locations` | Valid Navi Mumbai locations |

### Predict Request Example

```json
POST /predict
{
  "location": "Vashi",
  "area_sqft": 850,
  "bhk": 2,
  "bathrooms": 2,
  "floor": 5,
  "total_floors": 12,
  "age_of_property": 5,
  "parking": true,
  "lift": true
}
```

## Deployment on Render

1. Push this `backend/` folder to a GitHub repo
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set **Root Directory** to `backend`
4. Render auto-detects `render.yaml` — no extra config needed
5. Add your CSV to `data/` (or let synthetic data run)

> **Note**: The `render.yaml` build command runs `python train_model.py` so the model is trained fresh on each deploy.
