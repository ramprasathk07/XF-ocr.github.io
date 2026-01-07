"use client";

import Link from 'next/link';
import { useState, useEffect, useMemo, memo } from 'react';

interface ComponentHealth {
    name: string;
    status: string;
    latency: string;
}

interface Metrics {
    cpu_load: string;
    memory_usage: string;
    memory_used: string;
    memory_total: string;
    gpu: { load: string; memory: string }[];
    requests: { total: number; success: number; failed: number };
}

interface HealthData {
    status: string;
    uptime: string;
    uptime_seconds: number;
    metrics: Metrics;
    components: ComponentHealth[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || (process.env.NODE_ENV === 'production' ? '/XF-ocr.github.io' : '');

// Memoized Background to prevent flicker during updates
const PerformanceBackground = memo(() => (
    <div className="status-creative-bg">
        <div className="status-bg-glow"></div>
    </div>
));
PerformanceBackground.displayName = 'PerformanceBackground';

export default function StatusPage() {
    const [health, setHealth] = useState<HealthData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchHealth = async () => {
        try {
            const res = await fetch(`${API_BASE}/health`, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'ngrok-skip-browser-warning': 'true'
                }
            });
            if (res.ok) {
                const data = await res.json();
                setHealth(prev => {
                    // Only update if data actually changed to reduce re-renders
                    if (JSON.stringify(prev) === JSON.stringify(data)) return prev;
                    return data;
                });
                setError(false);
            } else {
                setError(true);
            }
        } catch (err) {
            console.error("Health check failed", err);
            setError(true);
            setHealth(null); // Clear stale data on error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log("Status Page Mounted. API_BASE:", API_BASE);
        fetchHealth();
        const interval = setInterval(fetchHealth, 5000);
        return () => clearInterval(interval);
    }, []);

    const generateSparkline = useMemo(() => (points: number[]) => {
        const width = 80;
        const height = 30;
        const max = Math.max(...points, 1);
        const d = points.map((p, i) =>
            `${i === 0 ? 'M' : 'L'} ${(i / (points.length - 1)) * width} ${height - (p / max) * height}`
        ).join(' ');

        return (
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="sparkline-creative">
                <path d={d} />
            </svg>
        );
    }, []);

    // Create a stable shell while loading
    return (
        <div id="app" style={{ background: 'transparent' }}>
            <PerformanceBackground />

            <header className="navbar" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(5,5,10,0.6)', backdropFilter: 'blur(20px)', zIndex: 10 }}>
                <div className="nav-left">
                    <div className="logo">
                        <img src={`${BASE_PATH}/logo.png`} alt="Xfinite" className="logo-img" />
                        <span>Xfinite</span>
                    </div>
                    <nav className="nav-links">
                        <Link href="/">Dashboard</Link>
                        <Link href="/docs">Docs</Link>
                        <Link href="/status" className="active">Status</Link>
                    </nav>
                </div>
                <div className="nav-right">
                    <button className="nav-btn-secondary">Global Map</button>
                    <button className="nav-btn-primary">Support</button>
                </div>
            </header>

            <main className="status-grid-creative" style={{ opacity: loading && !health ? 0.5 : 1, transition: 'opacity 0.2s ease-in-out' }}>
                {/* Hero Status Card */}
                <div className="glass-card-status status-hero-card">
                    <div className="status-hero-content">
                        <h1>System Intelligence</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '18px' }}>
                            {error ? 'Intermittent connection detected.' : health ? 'All neural clusters are performing optimally.' : 'Initializing secure connection...'}
                        </p>
                        <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div className="status-badge" style={{ padding: '8px 16px', background: error ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)' }}>
                                <span className={error || loading ? "" : "pulse"}></span>
                                <span className={error ? "neon-glow-red" : "neon-glow-green"} style={{ transition: 'color 0.3s' }}>
                                    {error ? 'Systems Offline' : loading && !health ? 'Connecting...' : 'Operational'}
                                </span>
                            </div>
                            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>Uptime: {health?.uptime || '---'}</span>
                        </div>
                    </div>

                    <div className="status-indicator-orbit">
                        <div className="orbit-ring">
                            <div className="orbit-planet"></div>
                        </div>
                        <div className="orbit-ring-inner"></div>
                        <div style={{ color: error ? '#ef4444' : '#10b981', fontSize: '24px', fontWeight: 800 }}>{error ? '!!' : 'OK'}</div>
                    </div>
                </div>

                {/* Metrics Section - Stable layout even without data */}
                <div className="glass-card-status status-metric-card">
                    <div className="creative-metric-label">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                        Compute Load
                    </div>
                    <div className="creative-metric-value">
                        {(health?.metrics?.cpu_load || '0%').replace('%', '')}<span className="creative-metric-unit">%</span>
                    </div>
                    <div style={{ opacity: 0.6 }}>{generateSparkline([15, 25, 20, 30, 45, 35, 40, 30])}</div>
                </div>

                <div className="glass-card-status status-metric-card">
                    <div className="creative-metric-label">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect><path d="M7 2v20"></path><path d="M17 2v20"></path></svg>
                        VRAM Usage
                    </div>
                    <div className="creative-metric-value">
                        {(health?.metrics?.gpu?.[0]?.load || '0%').replace('%', '')}<span className="creative-metric-unit">%</span>
                    </div>
                    <div style={{ opacity: 0.6 }}>{generateSparkline([40, 45, 42, 48, 50, 46, 44, 47])}</div>
                </div>

                <div className="glass-card-status status-metric-card">
                    <div className="creative-metric-label">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
                        Throughput
                    </div>
                    <div className="creative-metric-value">
                        {health?.metrics?.requests?.total || '0'}<span className="creative-metric-unit">req</span>
                    </div>
                    <div style={{ color: '#10b981', fontSize: '12px', fontWeight: 600 }}>
                        Success rate: {health?.metrics?.requests ? Math.round((health.metrics.requests.success / (health.metrics.requests.total || 1)) * 100) : 100}%
                    </div>
                </div>

                {/* Infrastructure Details */}
                <div className="glass-card-status status-list-card" style={{ background: 'rgba(255,255,255,0.01)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <h3 className="creative-metric-label">Infrastructure Clusters</h3>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>LATEST POLL: {health ? new Date().toLocaleTimeString() : 'WAITING...'}</div>
                    </div>

                    <div className="component-grid-creative">
                        {(loading && !health) ? (
                            Array(4).fill(0).map((_, i) => (
                                <div key={i} className="component-item-creative" style={{ opacity: 0.3 }}>
                                    <div style={{ width: '100%' }}>
                                        <div style={{ height: '15px', background: 'rgba(255,255,255,0.1)', width: '60%', borderRadius: '4px' }}></div>
                                        <div style={{ height: '10px', background: 'rgba(255,255,255,0.05)', width: '40%', borderRadius: '4px', marginTop: '8px' }}></div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            health?.components.map((c, i) => (
                                <div key={i} className={`component-item-creative ${c.status === 'operational' ? 'status-component-active' : ''}`}>
                                    <div>
                                        <div style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>{c.name}</div>
                                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>Latency: {c.latency}</div>
                                    </div>
                                    <div className={c.status === 'operational' ? "neon-glow-green" : "neon-glow-red"}>
                                        {c.status.toUpperCase()}
                                    </div>
                                </div>
                            )) || <div className="status-text-red" style={{ gridColumn: 'span 3', textAlign: 'center' }}>Stream interrupted. Re-syncing with master node...</div>
                        )}
                    </div>
                </div>

                <div style={{ gridColumn: 'span 12', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '12px', opacity: 0.4, padding: '40px 0' }}>
                    Network architecture is end-to-end encrypted and monitored by XFINITE Sentinel.
                </div>
            </main>
        </div>
    );
}
