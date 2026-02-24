# Pravah Frontend — Navi Mumbai House Price Predictor

Premium Next.js 14 frontend for the ML-powered house price prediction app.  
Deployed on Vercel. Backend: FastAPI on Render.

## Pages

| Route | Description |
|---|---|
| `/` | Landing page — hero, features, how it works |
| `/predict` | Prediction form with all 9 ML features |
| `/results` | Prediction result with charts |
| `/insights` | Model metrics, feature importance, comparison |

## Local Setup

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Set environment variable
cp .env.local.example .env.local
# Edit .env.local:
# NEXT_PUBLIC_API_URL=http://localhost:8000

# 3. Start dev server
npm run dev
# → http://localhost:3000
```

> The backend must be running locally (see `backend/README.md`) for predictions to work.

## Production Build

```bash
npm run build
npm start
```

## Deploy on Vercel

1. Push the `frontend/` folder (or the whole repo with root set to `frontend/`) to GitHub
2. Import on [vercel.com](https://vercel.com)
3. Set Environment Variable:  
   `NEXT_PUBLIC_API_URL` → your Render backend URL, e.g. `https://pravah-house-price-api.onrender.com`
4. Deploy — Vercel handles everything else

## Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Charts**: Recharts
- **Icons**: Lucide React
- **CSS**: Vanilla CSS with custom design tokens (no Tailwind)
- **Fonts**: Inter + Outfit (Google Fonts)
