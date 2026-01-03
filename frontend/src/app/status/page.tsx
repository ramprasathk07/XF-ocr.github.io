"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface ComponentHealth {
    name: string;
    status: string;
    latency: string;
}

interface HealthData {
    status: string;
    uptime: string;
    components: ComponentHealth[];
}

const API_BASE = "http://localhost:8000";

export default function StatusPage() {
    const [health, setHealth] = useState<HealthData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHealth = async () => {
            try {
                const res = await fetch(`${API_BASE}/health`);
                if (res.ok) {
                    const data = await res.json();
                    setHealth(data);
                }
            } catch (err) {
                console.error("Health check failed", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHealth();
        const interval = setInterval(fetchHealth, 15000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div id="app">
            <header className="navbar">
                <div className="nav-left">
                    <div className="logo">
                        <img src="/logo.png" alt="Xfinite" className="logo-img" />
                        <span>Xfinite</span>
                    </div>
                    <nav className="nav-links">
                        <Link href="/">Dashboard</Link>
                        <Link href="/docs">Docs</Link>
                        <Link href="/status" className="active">Status</Link>
                    </nav>
                </div>
                <div className="nav-right">
                    <button className="nav-btn-primary">Support</button>
                </div>
            </header>

            <div className="status-container">
                <div className="status-header">
                    <h1>System Status</h1>
                    <p className="dashboard-subtitle">Real-time health of XFINITE-OCR infrastructure.</p>
                </div>

                <div className="status-card">
                    <div className="component-status-item">
                        <div className="status-label">
                            <div className={`dot ${health?.status === 'operational' ? 'dot-green' : 'dot-red'}`}></div>
                            <span style={{ fontSize: '18px', fontWeight: 600 }}>
                                {health?.status === 'operational' ? 'All Systems Operational' : 'System Issues Detected'}
                            </span>
                        </div>
                        <div className={`status-text-${health?.status === 'operational' ? 'green' : 'red'}`}>
                            {health?.uptime || '99.9%'} Uptime
                        </div>
                    </div>
                </div>

                <div className="status-card">
                    <h3 style={{ marginBottom: '20px', fontSize: '14px', color: 'var(--text-secondary)' }}>COMPONENTS</h3>
                    {loading ? (
                        <div className="loading">Fetching system status...</div>
                    ) : (
                        health?.components.map((c, i) => (
                            <div key={i} className="component-status-item">
                                <div className="status-label">
                                    <span>{c.name}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <span className="latency">{c.latency}</span>
                                    <span className={`status-text-${c.status === 'operational' ? 'green' : 'red'}`} style={{ fontSize: '13px', fontWeight: 500 }}>
                                        {c.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        )) || <div className="status-text-red">Unable to reach backend. System may be down.</div>
                    )}
                </div>

                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '12px' }}>
                    Updated every 15 seconds. Historical data available upon request.
                </div>
            </div>
        </div>
    );
}
