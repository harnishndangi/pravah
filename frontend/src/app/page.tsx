import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Pravah — Navi Mumbai House Price Predictor',
  description:
    'Get instant, AI-powered house price estimates for Navi Mumbai. Trained on 2500+ listings with 91.6% accuracy.',
};

const FEATURES = [
  {
    icon: '🧠',
    title: 'Gradient Boosting ML',
    desc: 'Our model uses scikit-learn\'s GradientBoostingRegressor trained on 2,500 real Navi Mumbai listings.',
    color: 'rgba(59, 130, 246, 0.12)',
  },
  {
    icon: '📍',
    title: '30+ Localities',
    desc: 'Covers Vashi, Nerul, Kharghar, Belapur CBD, Panvel, Airoli, and 25+ more Navi Mumbai neighbourhoods.',
    color: 'rgba(167, 139, 250, 0.12)',
  },
  {
    icon: '⚡',
    title: 'Instant Predictions',
    desc: 'Get a price estimate in under a second via our FastAPI backend deployed on Render.',
    color: 'rgba(52, 211, 153, 0.12)',
  },
  {
    icon: '📊',
    title: 'R² Score: 0.916',
    desc: '91.6% of price variance explained. One of the highest accuracy models for Navi Mumbai real estate.',
    color: 'rgba(250, 204, 21, 0.12)',
  },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Enter Property Details', desc: 'Fill in area, BHK, location, floor, parking and more.' },
  { step: '02', title: 'ML Model Runs Inference', desc: 'Gradient Boosting model predicts in milliseconds.' },
  { step: '03', title: 'Get Detailed Estimate', desc: 'See price, per sqft rate, and confidence range instantly.' },
];

const LOCATIONS = [
  'Vashi', 'Nerul', 'Kharghar', 'Belapur CBD', 'Panvel',
  'Airoli', 'Sanpada', 'Seawoods', 'Ulwe', 'Kopar Khairane',
];

export default function HomePage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="hero bg-grid bg-radial-glow" style={{ position: 'relative' }}>
        {/* Decorative orbs */}
        <div
          style={{
            position: 'absolute', top: '10%', right: '8%',
            width: 320, height: 320, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute', bottom: '15%', left: '5%',
            width: 200, height: 200, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div className="container" style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ maxWidth: 800, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="hero-badge animate-fade-in">
              <span>🏡</span>
              <span>ML-Powered · Navi Mumbai · 2500+ Listings</span>
            </div>

            <h1 className="hero-title animate-fade-in-up">
              Know the True Price of{' '}
              <span className="gradient-text">Navi Mumbai</span>{' '}
              Real Estate
            </h1>

            <p className="hero-subtitle animate-fade-in-up delay-100">
              Pravah uses a Gradient Boosting ML model to deliver instant,
              data-driven property price predictions — accurate to 91.6%.
              No agents, no guesswork.
            </p>

            <div className="hero-actions animate-fade-in-up delay-200">
              <Link href="/predict" className="btn btn-primary btn-lg">
                🔮 Predict My Home Price
              </Link>
              <Link href="/insights" className="btn btn-secondary btn-lg">
                📈 View Model Insights
              </Link>
            </div>

            <div className="hero-stats animate-fade-in-up delay-300">
              {[
                { value: '91.6%', label: 'R² Accuracy' },
                { value: '2,500', label: 'Training Samples' },
                { value: '30+', label: 'Localities' },
                { value: '<1s', label: 'Prediction Time' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <div className="hero-stat-value">{value}</div>
                  <div className="hero-stat-label">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="badge badge-blue" style={{ marginBottom: '1rem' }}>Features</span>
            <h2 style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>
              Why Pravah Stands Out
            </h2>
            <p style={{ color: 'var(--gray-400)', maxWidth: 520, margin: '0 auto' }}>
              Built with production-grade ML and a modern fullstack architecture.
            </p>
          </div>

          <div className="grid-4">
            {FEATURES.map(({ icon, title, desc, color }, i) => (
              <div
                key={title}
                className="card animate-fade-in-up"
                style={{ animationDelay: `${i * 0.1}s`, animationFillMode: 'both' }}
              >
                <div
                  className="feature-icon"
                  style={{ background: color, fontSize: '1.5rem' }}
                >
                  {icon}
                </div>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--gray-400)', lineHeight: 1.6 }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="section" style={{ background: 'var(--surface-1)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="badge badge-green" style={{ marginBottom: '1rem' }}>How It Works</span>
            <h2 style={{ fontSize: '2.25rem' }}>Three Steps to Your Estimate</h2>
          </div>

          <div className="grid-3">
            {HOW_IT_WORKS.map(({ step, title, desc }, i) => (
              <div
                key={step}
                className="card animate-fade-in-up"
                style={{ animationDelay: `${i * 0.15}s`, animationFillMode: 'both' }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div className="step-number">{step}</div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', marginBottom: '0.5rem' }}>{title}</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-400)', lineHeight: 1.6 }}>
                      {desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Locations ── */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="badge badge-gold" style={{ marginBottom: '1rem' }}>Coverage</span>
            <h2 style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>
              Navi Mumbai Localities We Cover
            </h2>
            <p style={{ color: 'var(--gray-400)' }}>
              30+ neighbourhoods — from premium Vashi to emerging Ulwe.
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
            {LOCATIONS.map((loc) => (
              <span key={loc} className="badge badge-blue" style={{ fontSize: '0.875rem', padding: '0.5rem 1.25rem' }}>
                📍 {loc}
              </span>
            ))}
            <span className="badge" style={{ fontSize: '0.875rem', padding: '0.5rem 1.25rem', color: 'var(--gray-400)', background: 'rgba(100,116,139,0.1)', border: '1px solid rgba(100,116,139,0.2)' }}>
              + 20 more
            </span>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="section" style={{ background: 'var(--surface-1)' }}>
        <div className="container">
          <div
            className="card animate-pulse-glow"
            style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              background: 'linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(109,40,217,0.08) 100%)',
              border: '1px solid rgba(59,130,246,0.25)',
            }}
          >
            <h2 style={{ fontSize: '2.25rem', marginBottom: '1rem' }}>
              Ready to Price Your Property?
            </h2>
            <p style={{ color: 'var(--gray-400)', marginBottom: '2rem', maxWidth: 480, margin: '0 auto 2rem' }}>
              Enter your property details and get an ML-powered estimate in under a second.
            </p>
            <Link href="/predict" className="btn btn-primary btn-lg">
              🏠 Start Prediction →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
