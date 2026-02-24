'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { predictPrice, getLocations, type PredictRequest } from '@/lib/api';

const DEFAULT_FORM: PredictRequest = {
    location: 'Vashi',
    area_sqft: 850,
    bhk: 2,
    bathrooms: 2,
    floor: 5,
    total_floors: 12,
    age_of_property: 5,
    parking: true,
    lift: true,
};

const FALLBACK_LOCATIONS = [
    'Airoli', 'Belapur CBD', 'Ghansoli', 'Juinagar', 'Kalamboli', 'Kamothe',
    'Kharghar', 'Kopar Khairane', 'Khandeshwar', 'Mahape', 'Mansarovar',
    'Nagothane', 'Nerul', 'New Panvel', 'Palm Beach Road', 'Panvel',
    'Rabale', 'Roadpali', 'Sanpada', 'Seawoods', 'Turbhe', 'Ulwe',
    'Uran', 'Vashi',
];

function Stepper({
    value, min, max, onChange,
}: { value: number; min: number; max: number; onChange: (v: number) => void }) {
    return (
        <div className="stepper">
            <button
                type="button"
                className="stepper-btn"
                onClick={() => onChange(Math.max(min, value - 1))}
                disabled={value <= min}
            >
                −
            </button>
            <span className="stepper-value">{value}</span>
            <button
                type="button"
                className="stepper-btn"
                onClick={() => onChange(Math.min(max, value + 1))}
                disabled={value >= max}
            >
                +
            </button>
        </div>
    );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
    return (
        <label className="toggle-wrapper">
            <div className="toggle">
                <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
                <span className="toggle-slider" />
            </div>
            <span style={{ fontSize: '0.9375rem', color: checked ? '#fff' : 'var(--gray-400)', transition: 'color 200ms' }}>
                {label}
            </span>
        </label>
    );
}

export default function PredictPage() {
    const router = useRouter();
    const [form, setForm] = useState<PredictRequest>(DEFAULT_FORM);
    const [locations, setLocations] = useState<string[]>(FALLBACK_LOCATIONS);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        getLocations()
            .then((r) => { if (r.locations.length) setLocations(r.locations); })
            .catch(() => {/* use fallback */ });
    }, []);

    const set = <K extends keyof PredictRequest>(key: K, value: PredictRequest[K]) =>
        setForm((f) => ({ ...f, [key]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.floor > form.total_floors) {
            setError('Floor number cannot exceed total floors.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            const result = await predictPrice(form);
            sessionStorage.setItem('pravah_result', JSON.stringify(result));
            sessionStorage.setItem('pravah_form', JSON.stringify(form));
            router.push('/results');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Prediction failed. Is the backend running?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="section">
            <div className="container">
                {/* Header */}
                <div style={{ marginBottom: '2.5rem' }}>
                    <span className="badge badge-blue" style={{ marginBottom: '0.75rem' }}>Prediction Tool</span>
                    <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', marginBottom: '0.5rem' }}>
                        Price Your Navi Mumbai Property
                    </h1>
                    <p style={{ color: 'var(--gray-400)', fontSize: '1rem' }}>
                        Fill in the details below — our ML model will return an estimate in under a second.
                    </p>
                </div>

                <div className="predict-layout">
                    {/* ── Sidebar Tips ── */}
                    <aside>
                        <div className="card" style={{ position: 'sticky', top: '96px' }}>
                            <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem', color: 'var(--gray-300)' }}>
                                💡 Tips for Accuracy
                            </h3>
                            {[
                                ['📐 Area', 'Use carpet area (sq ft) not built-up area.'],
                                ['📍 Location', 'Choose the most specific neighbourhood.'],
                                ['🏢 Floor', 'Higher floors typically command a premium.'],
                                ['🔧 Age', 'Newly built or <5 yr old properties fetch more.'],
                                ['🚗 Parking', 'Covered parking adds ₹1–2L in Navi Mumbai.'],
                            ].map(([label, tip]) => (
                                <div key={label as string} style={{ marginBottom: '0.875rem' }}>
                                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--gray-300)', marginBottom: '0.2rem' }}>
                                        {label}
                                    </div>
                                    <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', lineHeight: 1.5 }}>{tip}</div>
                                </div>
                            ))}

                            <div className="divider" />
                            <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
                                Model accuracy: <strong style={{ color: 'var(--green-400)' }}>R² = 0.916</strong>
                            </div>
                        </div>
                    </aside>

                    {/* ── Form ── */}
                    <form onSubmit={handleSubmit}>
                        <div className="card" style={{ marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.05rem', marginBottom: '1.5rem', color: 'var(--gray-300)', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.75rem' }}>
                                📍 Location &amp; Size
                            </h2>

                            <div className="grid-2" style={{ marginBottom: '1.25rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Location</label>
                                    <select
                                        id="location"
                                        className="form-select"
                                        value={form.location}
                                        onChange={(e) => set('location', e.target.value)}
                                        required
                                    >
                                        {locations.map((loc) => (
                                            <option key={loc} value={loc}>{loc}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        Area (sq ft)
                                        <span style={{ marginLeft: 'auto', color: 'var(--brand-400)', fontWeight: 700 }}>
                                            {form.area_sqft.toLocaleString()}
                                        </span>
                                    </label>
                                    <input
                                        id="area_sqft"
                                        type="range"
                                        className="form-range"
                                        min={300}
                                        max={6000}
                                        step={50}
                                        value={form.area_sqft}
                                        onChange={(e) => set('area_sqft', Number(e.target.value))}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--gray-600)' }}>
                                        <span>300</span><span>6,000 sq ft</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">BHK</label>
                                    <Stepper value={form.bhk} min={1} max={6} onChange={(v) => set('bhk', v)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Bathrooms</label>
                                    <Stepper value={form.bathrooms} min={1} max={6} onChange={(v) => set('bathrooms', v)} />
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{ marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.05rem', marginBottom: '1.5rem', color: 'var(--gray-300)', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.75rem' }}>
                                🏢 Building Details
                            </h2>

                            <div className="grid-2" style={{ marginBottom: '1.25rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Floor Number</label>
                                    <input
                                        id="floor"
                                        type="number"
                                        className="form-input"
                                        min={0}
                                        max={form.total_floors}
                                        value={form.floor}
                                        onChange={(e) => set('floor', Number(e.target.value))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Total Floors</label>
                                    <input
                                        id="total_floors"
                                        type="number"
                                        className="form-input"
                                        min={1}
                                        max={100}
                                        value={form.total_floors}
                                        onChange={(e) => set('total_floors', Number(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    Age of Property (years)
                                    <span style={{ marginLeft: 'auto', color: 'var(--brand-400)', fontWeight: 700 }}>
                                        {form.age_of_property === 0 ? 'New' : `${form.age_of_property} yr`}
                                    </span>
                                </label>
                                <input
                                    id="age_of_property"
                                    type="range"
                                    className="form-range"
                                    min={0}
                                    max={50}
                                    value={form.age_of_property}
                                    onChange={(e) => set('age_of_property', Number(e.target.value))}
                                />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--gray-600)' }}>
                                    <span>New</span><span>50 years</span>
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{ marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.05rem', marginBottom: '1.5rem', color: 'var(--gray-300)', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.75rem' }}>
                                🛠️ Amenities
                            </h2>
                            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                                <Toggle checked={form.parking} onChange={(v) => set('parking', v)} label="🚗 Parking Available" />
                                <Toggle checked={form.lift} onChange={(v) => set('lift', v)} label="🛗 Lift / Elevator" />
                            </div>
                        </div>

                        {error && (
                            <div
                                style={{
                                    padding: '0.875rem 1.25rem',
                                    background: 'rgba(239,68,68,0.1)',
                                    border: '1px solid rgba(239,68,68,0.3)',
                                    borderRadius: '0.625rem',
                                    color: 'var(--red-400)',
                                    marginBottom: '1rem',
                                    fontSize: '0.9rem',
                                }}
                            >
                                ⚠️ {error}
                            </div>
                        )}

                        <button
                            id="predict-btn"
                            type="submit"
                            className="btn btn-primary btn-lg"
                            disabled={loading}
                            style={{ width: '100%', justifyContent: 'center' }}
                        >
                            {loading ? (
                                <><span className="spinner" style={{ width: 20, height: 20 }} /> Predicting…</>
                            ) : (
                                '🔮 Get Price Prediction'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
