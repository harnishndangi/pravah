'use client';

import { useEffect, useState } from 'react';
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis,
    ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, Cell,
} from 'recharts';
import { getModelInfo, type ModelInfoResponse } from '@/lib/api';
import Link from 'next/link';

const STATIC_MODEL_INFO: ModelInfoResponse = {
    model_name: 'Gradient Boosting Regressor',
    task_type: 'regression',
    target_column: 'actual_price',
    features: ['location', 'area_sqft', 'bhk', 'bathrooms', 'floor', 'total_floors', 'age_of_property', 'parking', 'lift'],
    metrics: { r2_score: 0.9162, mse: 14055166083923.5, rmse: 3749022.0, mae: 2511429.7 },
    feature_importance: [
        { name: 'area_sqft', importance: 0.662, percentage: 66.2 },
        { name: 'floor', importance: 0.068, percentage: 6.8 },
        { name: 'bhk', importance: 0.068, percentage: 6.8 },
        { name: 'age_of_property', importance: 0.067, percentage: 6.7 },
        { name: 'total_floors', importance: 0.052, percentage: 5.2 },
        { name: 'location', importance: 0.043, percentage: 4.3 },
        { name: 'bathrooms', importance: 0.028, percentage: 2.8 },
        { name: 'lift', importance: 0.007, percentage: 0.7 },
        { name: 'parking', importance: 0.004, percentage: 0.4 },
    ],
    dataset_rows: 2500,
    training_time_ms: 29798,
};

const MODEL_COMPARISON = [
    { name: 'Gradient Boost', r2: 91.6, color: '#3b82f6', badge: '🏆 Best' },
    { name: 'Neural Net MLP', r2: 80.6, color: '#a78bfa', badge: '' },
    { name: 'Random Forest', r2: 51.9, color: '#34d399', badge: '' },
];

const BAR_COLORS = ['#3b82f6', '#60a5fa', '#818cf8', '#a78bfa', '#34d399', '#4ade80', '#facc15', '#f97316', '#f87171'];

function formatRupees(n: number): string {
    if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
    if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
    return `₹${n.toLocaleString('en-IN')}`;
}

export default function InsightsPage() {
    const [info, setInfo] = useState<ModelInfoResponse>(STATIC_MODEL_INFO);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        getModelInfo()
            .then((d) => { setInfo(d); setLoaded(true); })
            .catch(() => setLoaded(true));
    }, []);

    const fi = info.feature_importance.map((f, i) => ({
        ...f,
        label: f.name.replace(/_/g, ' '),
        color: BAR_COLORS[i],
    }));

    const radarData = fi.slice(0, 6).map((f) => ({
        subject: f.label,
        importance: f.percentage,
    }));

    return (
        <div className="section">
            <div className="container">
                {/* Header */}
                <div style={{ marginBottom: '3rem' }}>
                    <span className="badge badge-blue" style={{ marginBottom: '0.75rem' }}>Model Intelligence</span>
                    <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', marginBottom: '0.5rem' }}>
                        Model Insights &amp; Performance
                    </h1>
                    <p style={{ color: 'var(--gray-400)', maxWidth: 600 }}>
                        Deep dive into the Gradient Boosting Regressor powering Pravah —
                        trained on 2,500 Navi Mumbai listings.
                    </p>
                </div>

                {/* Key metrics */}
                <div className="grid-4" style={{ marginBottom: '2rem' }}>
                    {[
                        { label: 'R² Score', value: `${(info.metrics.r2_score * 100).toFixed(1)}%`, sub: 'Variance explained', icon: '🎯', color: '#3b82f6' },
                        { label: 'MAE', value: formatRupees(info.metrics.mae), sub: 'Mean Abs Error', icon: '📏', color: '#a78bfa' },
                        { label: 'RMSE', value: formatRupees(info.metrics.rmse), sub: 'Root Mean Sq Error', icon: '📊', color: '#34d399' },
                        { label: 'Training Set', value: info.dataset_rows.toLocaleString(), sub: 'Navi Mumbai listings', icon: '🏘️', color: '#facc15' },
                    ].map(({ label, value, sub, icon, color }) => (
                        <div
                            key={label}
                            className="card metric-card animate-fade-in-up"
                            style={{ borderTop: `3px solid ${color}` }}
                        >
                            <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{icon}</div>
                            <div className="metric-value" style={{ color: '#fff', fontSize: '1.875rem' }}>{value}</div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-300)', margin: '0.25rem 0 0.125rem' }}>
                                {label}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{sub}</div>
                        </div>
                    ))}
                </div>

                <div className="grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                    {/* Feature importance bar chart */}
                    <div className="card">
                        <h2 style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>Feature Importance</h2>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginBottom: '1.5rem' }}>
                            How much each feature contributes to price prediction
                        </p>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={fi} layout="vertical" margin={{ left: 0, right: 16 }}>
                                <XAxis type="number" tick={{ fill: 'var(--gray-500)', fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                                <YAxis type="category" dataKey="label" tick={{ fill: 'var(--gray-400)', fontSize: 11 }} width={100} />
                                <Tooltip
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    formatter={(v: any) => [`${(v as number).toFixed(1)}%`, 'Importance']}
                                    contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--surface-border)', borderRadius: 8 }}
                                    labelStyle={{ color: '#fff' }}
                                    itemStyle={{ color: 'var(--brand-400)' }}
                                />
                                <Bar dataKey="percentage" radius={[0, 6, 6, 0]}>
                                    {fi.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Radar chart */}
                    <div className="card">
                        <h2 style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>Feature Radar</h2>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginBottom: '1rem' }}>
                            Top 6 features — relative contribution
                        </p>
                        <ResponsiveContainer width="100%" height={280}>
                            <RadarChart data={radarData} margin={{ top: 10, right: 30, left: 30, bottom: 0 }}>
                                <PolarGrid stroke="rgba(255,255,255,0.07)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--gray-400)', fontSize: 11 }} />
                                <Radar
                                    name="Importance"
                                    dataKey="importance"
                                    stroke="#3b82f6"
                                    fill="#3b82f6"
                                    fillOpacity={0.25}
                                    strokeWidth={2}
                                />
                                <Tooltip
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    formatter={(v: any) => [`${(v as number).toFixed(1)}%`, 'Importance']}
                                    contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--surface-border)', borderRadius: 8 }}
                                    itemStyle={{ color: 'var(--brand-400)' }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Feature importance progress bars */}
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.05rem', marginBottom: '1.5rem' }}>Detailed Feature Breakdown</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {fi.map((f, i) => (
                            <div key={f.name}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-300)', textTransform: 'capitalize' }}>
                                        {f.label}
                                    </span>
                                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: f.color }}>
                                        {f.percentage.toFixed(1)}%
                                    </span>
                                </div>
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{
                                            width: loaded ? `${f.percentage}%` : '0%',
                                            background: `linear-gradient(90deg, ${f.color}, ${BAR_COLORS[(i + 1) % BAR_COLORS.length]})`,
                                            transition: `width ${0.8 + i * 0.1}s cubic-bezier(0.34,1.56,0.64,1)`,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Model comparison */}
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.05rem', marginBottom: '0.375rem' }}>
                        Model Comparison
                    </h2>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginBottom: '1.5rem' }}>
                        We evaluated 3 models — Gradient Boosting wins on R².
                    </p>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
                                    {['Model', 'R² Score', 'Bar', 'Status'].map((h) => (
                                        <th key={h} style={{ textAlign: 'left', padding: '0.75rem 1rem', color: 'var(--gray-400)', fontWeight: 600, fontSize: '0.8125rem' }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {MODEL_COMPARISON.map(({ name, r2, color, badge }) => (
                                    <tr key={name} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                        <td style={{ padding: '0.875rem 1rem', fontWeight: 600, color: '#fff' }}>{name}</td>
                                        <td style={{ padding: '0.875rem 1rem', color, fontWeight: 700 }}>{r2}%</td>
                                        <td style={{ padding: '0.875rem 1rem', width: '35%' }}>
                                            <div className="progress-bar">
                                                <div className="progress-fill" style={{ width: `${r2}%`, background: color }} />
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.875rem 1rem' }}>
                                            {badge ? (
                                                <span className="badge badge-green">{badge}</span>
                                            ) : (
                                                <span style={{ color: 'var(--gray-500)', fontSize: '0.8125rem' }}>—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Technical details */}
                <div className="grid-2" style={{ marginBottom: '2rem' }}>
                    <div className="card">
                        <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>🔧 Model Configuration</h3>
                        {[
                            ['Algorithm', 'Gradient Boosting Regressor'],
                            ['n_estimators', '200'],
                            ['learning_rate', '0.05'],
                            ['max_depth', '5'],
                            ['subsample', '0.8'],
                            ['random_state', '42'],
                        ].map(([k, v]) => (
                            <div key={k as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                <span style={{ fontSize: '0.8125rem', color: 'var(--gray-400)' }}>{k}</span>
                                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--gray-200)', fontFamily: 'monospace' }}>{v}</span>
                            </div>
                        ))}
                    </div>

                    <div className="card">
                        <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>📦 Tech Stack</h3>
                        {[
                            ['ML Library', 'scikit-learn 1.4.2'],
                            ['Backend', 'FastAPI + Uvicorn'],
                            ['Frontend', 'Next.js 14 (App Router)'],
                            ['Deployment (API)', 'Render'],
                            ['Deployment (UI)', 'Vercel'],
                            ['Training Time', info.training_time_ms ? `${(info.training_time_ms / 1000).toFixed(1)}s` : '~30s'],
                        ].map(([k, v]) => (
                            <div key={k as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                <span style={{ fontSize: '0.8125rem', color: 'var(--gray-400)' }}>{k}</span>
                                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--gray-200)' }}>{v}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <Link href="/predict" className="btn btn-primary">
                        🏠 Try the Predictor
                    </Link>
                    <Link href="/" className="btn btn-ghost">
                        ← Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
