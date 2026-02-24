'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
    { href: '/', label: 'Home' },
    { href: '/predict', label: 'Predict' },
    { href: '/insights', label: 'Model Insights' },
];

export default function Navbar() {
    const pathname = usePathname();

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                {/* Logo */}
                <Link href="/" className="navbar-logo">
                    <span className="logo-dot" />
                    Pravah
                </Link>

                {/* Nav links */}
                <ul className="navbar-nav">
                    {NAV_LINKS.map(({ href, label }) => (
                        <li key={href}>
                            <Link
                                href={href}
                                className={`navbar-link${pathname === href ? ' active' : ''}`}
                            >
                                {label}
                            </Link>
                        </li>
                    ))}
                </ul>

                {/* CTA */}
                <div className="navbar-cta">
                    <Link href="/predict" className="btn btn-primary btn-sm">
                        Get Estimate
                    </Link>
                </div>
            </div>
        </nav>
    );
}
