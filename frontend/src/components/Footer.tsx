import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '1rem',
                    }}
                >
                    <div>
                        <div
                            style={{
                                fontFamily: 'var(--font-display)',
                                fontWeight: 800,
                                fontSize: '1.125rem',
                                color: '#fff',
                                marginBottom: '0.25rem',
                            }}
                        >
                            Pravah
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
                            ML-powered house price prediction for Navi Mumbai
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <Link href="/" className="navbar-link" style={{ fontSize: '0.875rem' }}>
                            Home
                        </Link>
                        <Link href="/predict" className="navbar-link" style={{ fontSize: '0.875rem' }}>
                            Predict
                        </Link>
                        <Link href="/insights" className="navbar-link" style={{ fontSize: '0.875rem' }}>
                            Insights
                        </Link>
                    </div>

                    <div style={{ fontSize: '0.8125rem', color: 'var(--gray-600)' }}>
                        © {new Date().getFullYear()} Pravah · Gradient Boosting · R²&nbsp;0.916
                    </div>
                </div>
            </div>
        </footer>
    );
}
