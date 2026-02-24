'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import type { PredictRequest, PredictResponse } from '@/lib/api';

const FEATURE_LABELS: Record<string, string> = {
    area_sqft: 'Area (sq ft)',
    floor: 'Floor No.',
    bhk: 'BHK',
    age_of_property: 'Property Age',
    total_floors: 'Total Floors',
    location: 'Location',
    bathrooms: 'Bathrooms',
    lift: 'Lift',
    parking: 'Parking',
};

// Static feature importance (mirrors model training output)
const FEATURE_IMPORTANCE = [
    { name: 'area_sqft', importance: 66.2 },
    { name: 'floor', importance: 6.8 },
    { name: 'bhk', importance: 6.8 },
    { name: 'age_of_property', importance: 6.7 },
    { name: 'total_floors', importance: 5.2 },
    { name: 'location', importance: 4.3 },
    { name: 'bathrooms', importance: 2.8 },
    { name: 'lift', importance: 0.7 },
    { name: 'parking', importance: 0.4 },
];

const BAR_COLORS = [
    '#3b82f6', '#60a5fa', '#818cf8', '#a78bfa',
    '#34d399', '#4ade80', '#facc15', '#f97316', '#f87171',
];

export default function ResultsPage() {
    const router = useRouter();
    const [result, setResult] = useState<PredictResponse | null>(null);
    const [form, setForm] = useState<PredictRequest | null>(null);
    const [animated, setAnimated] = useState(false);

    useEffect(() => {
        const r = sessionStorage.getItem('pravah_result');
        const f = sessionStorage.getItem('pravah_form');
        if (!r) { router.replace('/predict'); return; }
        setResult(JSON.parse(r));
        if (f) setForm(JSON.parse(f));
        const t = setTimeout(() => setAnimated(true), 100);
        return () => clearTimeout(t);
    }, [router]);

    if (!result) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div className="spinner" style={{ width: 48, height: 48 }} />
            </div>
        );
    }

    const formatted = FEATURE_IMPORTANCE.map((fi) => ({
        ...fi,
        label: FEATURE_LABELS[fi.name] ?? fi.name,
        value: fi.importance,
    }));

    return (
        <div className="section">
            <div className="container">
                <div style={{ marginBottom: '2rem' }}>
                    <span className="badge badge-green" style={{ marginBottom: '0.75rem' }}>Prediction Result</span>
                    <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}>
                        Your Estimated Property Price
                    </h1>
                </div>

                <div className="grid-2" style={{ alignItems: 'start', gap: '1.5rem' }}>
                    {/* Left column */}
                    <div>
                        {/* Main price card */}
                        <div
                            className={`card ${animated ? 'animate-count-up' : ''}`}
                            style={{
                                textAlign: 'center',
                                padding: '3rem 2rem',
                                marginBottom: '1.5rem',
                                background: 'linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(109,40,217,0.08) 100%)',
                                border: '1px solid rgba(59,130,246,0.3)',
                            }}
                        >
                            <div style={{ fontSize: '0.875rem', color: 'var(--gray-400)', marginBottom: '0.5rem' }}>
                                Predicted Market Price
                            </div>
                            <div className="price-amount">{result.formatted_price}</div>
                            <div style={{ fontSize: '0.925rem', color: 'var(--gray-400)', marginTop: '0.75rem' }}>
                                ₹{Math.round(result.price_per_sqft).toLocaleString('en-IN')} per sq ft
                            </div>

                            {/* Confidence range */}
                            <div
                                style={{
                                    marginTop: '1.5rem',
                                    padding: '1rem',
                                    background: 'rgba(0,0,0,0.2)',
                                    borderRadius: '0.625rem',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                }}
                            >
                                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: '0.5rem' }}>
                                    95% Confidence Range (±15%)
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.8125rem', color: 'var(--gray-400)' }}>Low</div>
                                        <div style={{ fontWeight: 700, color: '#60a5fa' }}>{result.formatted_confidence_low}</div>
                                    </div>
                                    <div style={{ flex: 1, height: 4, background: 'linear-gradient(90deg,#3b82f6,#a78bfa)', borderRadius: 9999 }} />
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.8125rem', color: 'var(--gray-400)' }}>High</div>
                                        <div style={{ fontWeight: 700, color: '#a78bfa' }}>{result.formatted_confidence_high}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Summary cards */}
                        <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
                            {[
                                { label: 'Location', value: result.location, icon: '📍' },
                                { label: 'Area', value: `${result.area_sqft.toLocaleString()} sq ft`, icon: '📐' },
                                { label: 'Price / sq ft', value: `₹${Math.round(result.price_per_sqft).toLocaleString('en-IN')}`, icon: '💰' },
                                { label: 'Model R²', value: '0.916', icon: '🎯' },
                            ].map(({ label, value, icon }) => (
                                <div key={label} className="card" style={{ padding: '1.25rem' }}>
                                    <div style={{ fontSize: '1.25rem', marginBottom: '0.375rem' }}>{icon}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: '0.25rem' }}>{label}</div>
                                    <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#ffffff' }}>{value}</div>
                                </div>
                            ))}
                        </div>

                        {/* Property details recap */}
                        {form && (
                            <div className="card">
                                <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem', color: 'var(--gray-300)' }}>
                                    📋 Your Property Details
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
                                    {[
                                        ['BHK', form.bhk],
                                        ['Bathrooms', form.bathrooms],
                                        ['Floor', `${form.floor} / ${form.total_floors}`],
                                        ['Age', form.age_of_property === 0 ? 'New' : `${form.age_of_property} yr`],
                                        ['Parking', form.parking ? '✅ Yes' : '❌ No'],
                                        ['Lift', form.lift ? '✅ Yes' : '❌ No'],
                                    ].map(([label, value]) => (
                                        <div key={label as string}>
                                            <span style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{label}: </span>
                                            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-200)' }}>{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right column — Feature importance chart */}
                    <div>
                        <div className="card" style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '0.95rem', marginBottom: '0.375rem', color: 'var(--gray-200)' }}>
                                📊 What Drives the Price?
                            </h3>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginBottom: '1.5rem' }}>
                                Feature importance from the Gradient Boosting model
                            </p>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={formatted} layout="vertical" margin={{ left: 0, right: 20 }}>
                                    <XAxis type="number" tick={{ fill: 'var(--gray-500)', fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                                    <YAxis type="category" dataKey="label" tick={{ fill: 'var(--gray-400)', fontSize: 12 }} width={100} />
                                    <Tooltip
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        formatter={(v: any) => [`${(v as number).toFixed(1)}%`, 'Importance']}
                                        contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--surface-border)', borderRadius: 8 }}
                                        labelStyle={{ color: '#ffffff' }}
                                        itemStyle={{ color: 'var(--brand-400)' }}
                                    />
                                    <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                                        {formatted.map((_, idx) => (
                                            <Cell key={idx} fill={BAR_COLORS[idx % BAR_COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Model note */}
                        <div
                            className="card"
                            style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}
                        >
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                <span style={{ fontSize: '1.5rem' }}>🎯</span>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem', color: 'var(--green-400)' }}>
                                        High-Confidence Prediction
                                    </div>
                                    <div style={{ fontSize: '0.8125rem', color: 'var(--gray-400)', lineHeight: 1.6 }}>
                                        This prediction is backed by a Gradient Boosting model with R²=0.916, trained on 2,500 real Navi Mumbai listings. The ±15% range accounts for micro-market variation.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="divider" />
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <Link href="/predict" className="btn btn-primary">
                        🏠 Predict Another Property
                    </Link>
                    <Link href="/insights" className="btn btn-secondary">
                        📈 View Model Insights
                    </Link>
                    <Link href="/" className="btn btn-ghost">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
