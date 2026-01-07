"use client";

import Link from 'next/link';
import { useState } from 'react';

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || (process.env.NODE_ENV === 'production' ? '/XF-ocr.github.io' : '');

export default function DocsPage() {
    const [activeSection, setActiveSection] = useState('overview');

    const scrollTo = (id: string) => {
        setActiveSection(id);
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div id="app">
            <header className="navbar">
                <div className="nav-left">
                    <div className="logo">
                        <img src={`${BASE_PATH}/logo.png`} alt="Xfinite" className="logo-img" />
                        <span>Xfinite</span>
                    </div>
                    <nav className="nav-links">
                        <Link href="/">Dashboard</Link>
                        <Link href="/docs" className="active">Docs</Link>
                        <Link href="/status">Status</Link>
                    </nav>
                </div>
                <div className="nav-right">
                    <button className="nav-btn-secondary">API Keys</button>
                    <button className="nav-btn-primary">Get Started</button>
                </div>
            </header>

            <div className="docs-layout">
                <aside className="docs-sidebar">
                    <div className="docs-nav-group">
                        <p className="docs-nav-title">Introduction</p>
                        <a href="#overview" onClick={(e) => { e.preventDefault(); scrollTo('overview'); }} className={`docs-nav-item ${activeSection === 'overview' ? 'active' : ''}`}>
                            <span>📊 Overview</span>
                        </a>
                    </div>

                    <div className="docs-nav-group">
                        <p className="docs-nav-title">XFinite AI Models Suite</p>
                        <a href="#xf1-mini" onClick={(e) => { e.preventDefault(); scrollTo('xf1-mini'); }} className={`docs-nav-item ${activeSection === 'xf1-mini' ? 'active' : ''}`}>
                            <span>⚡ XF1-mini</span>
                        </a>
                        <a href="#xf3" onClick={(e) => { e.preventDefault(); scrollTo('xf3'); }} className={`docs-nav-item ${activeSection === 'xf3' ? 'active' : ''}`}>
                            <span>⚙️ XF3 Balanced</span>
                        </a>
                        <a href="#xf3-pro" onClick={(e) => { e.preventDefault(); scrollTo('xf3-pro'); }} className={`docs-nav-item ${activeSection === 'xf3-pro' ? 'active' : ''}`}>
                            <span>🧠 XF3 Pro</span>
                        </a>
                        <a href="#xf3-large" onClick={(e) => { e.preventDefault(); scrollTo('xf3-large'); }} className={`docs-nav-item ${activeSection === 'xf3-large' ? 'active' : ''}`}>
                            <span>🏗️ XF3-large</span>
                        </a>
                    </div>

                    <div className="docs-nav-group">
                        <p className="docs-nav-title">Reference</p>
                        <a href="#comparison" onClick={(e) => { e.preventDefault(); scrollTo('comparison'); }} className={`docs-nav-item ${activeSection === 'comparison' ? 'active' : ''}`}>
                            <span>🔍 Model Comparison</span>
                        </a>
                    </div>
                </aside>

                <main className="docs-main">
                    <div className="docs-container">
                        <section id="overview" className="docs-hero">
                            <h1>🚀 XFinite AI Models Suite</h1>
                            <p style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
                                Precision-built OCR & Document Intelligence for every scale
                            </p>
                            <p>
                                From lightweight instant extraction to enterprise-grade document reasoning, the XF series is engineered to meet real-world document challenges across speed, accuracy, and intelligence.
                            </p>
                        </section>

                        <section id="xf1-mini" className="docs-section">
                            <div className="docs-feature-card" style={{ borderLeft: '4px solid #3b82f6', background: 'rgba(59, 130, 246, 0.05)' }}>
                                <h2>⚡ XF1-mini</h2>
                                <p style={{ fontSize: '18px', fontWeight: 700, color: '#60a5fa', marginBottom: '16px' }}>Fast. Focused. Everyday OCR.</p>

                                <div style={{ marginBottom: '24px' }}>
                                    <h4 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Best for:</h4>
                                    <p>Invoices, receipts, forms, scanned PDFs, quick text extraction workflows.</p>
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <h4 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>What it does best:</h4>
                                    <p>XF1-mini is your go-to model for high-speed, cost-efficient document reading. Designed for daily-use documents, it delivers reliable text extraction with minimal latency, making it perfect for web apps, dashboards, and real-time pipelines.</p>
                                </div>

                                <div>
                                    <h4 style={{ color: 'var(--text-primary)', marginBottom: '12px' }}>Key strengths:</h4>
                                    <ul style={{ color: 'var(--text-secondary)', paddingLeft: '20px', lineHeight: '1.8' }}>
                                        <li>Optimized for clean & semi-structured documents</li>
                                        <li>Excellent reading order & layout awareness</li>
                                        <li>Low compute footprint, ideal for high-throughput APIs</li>
                                        <li>Stable results even on mobile-scanned documents</li>
                                    </ul>
                                </div>

                                <div className="docs-note" style={{ marginTop: '24px', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
                                    <strong style={{ color: '#fff' }}>Why choose XF1-mini?</strong><br />
                                    When speed matters more than heavy reasoning, XF1-mini keeps things moving without cutting corners.
                                </div>
                            </div>
                        </section>

                        <section id="xf3" className="docs-section">
                            <div className="docs-feature-card" style={{ borderLeft: '4px solid #8b5cf6', background: 'rgba(139, 92, 246, 0.05)' }}>
                                <h2>⚙️ XF3</h2>
                                <p style={{ fontSize: '18px', fontWeight: 700, color: '#a78bfa', marginBottom: '16px' }}>Balanced Intelligence for Real-World Documents</p>

                                <div style={{ marginBottom: '24px' }}>
                                    <h4 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Best for:</h4>
                                    <p>Business documents, reports, tables, multi-column PDFs, mixed layouts.</p>
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <h4 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>What it does best:</h4>
                                    <p>XF3 is the all-rounder. It understands structure, relationships, and context across complex documents. From dense tables to multi-page PDFs, it delivers consistent, high-quality results without enterprise-level overhead.</p>
                                </div>

                                <div>
                                    <h4 style={{ color: 'var(--text-primary)', marginBottom: '12px' }}>Key strengths:</h4>
                                    <ul style={{ color: 'var(--text-secondary)', paddingLeft: '20px', lineHeight: '1.8' }}>
                                        <li>Strong table detection & extraction</li>
                                        <li>Accurate multi-column and nested layout handling</li>
                                        <li>Robust on low-quality scans and photocopies</li>
                                        <li>Ideal balance between accuracy, speed, and cost</li>
                                    </ul>
                                </div>

                                <div className="docs-note" style={{ marginTop: '24px', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
                                    <strong style={{ color: '#fff' }}>Why choose XF3?</strong><br />
                                    If your documents aren’t simple but don’t need heavy reasoning either, XF3 hits the sweet spot.
                                </div>
                            </div>
                        </section>

                        <section id="xf3-pro" className="docs-section">
                            <div className="docs-feature-card" style={{ borderLeft: '4px solid #f59e0b', background: 'rgba(245, 158, 11, 0.05)' }}>
                                <h2>🧠 XF3 Pro</h2>
                                <p style={{ fontSize: '18px', fontWeight: 700, color: '#fbbf24', marginBottom: '16px' }}>Context-Aware OCR with Reasoning</p>

                                <div style={{ marginBottom: '24px' }}>
                                    <h4 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Best for:</h4>
                                    <p>Legal documents, multilingual files, contracts, research papers, complex forms.</p>
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <h4 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>What it does best:</h4>
                                    <p>XF3 Pro goes beyond reading text. It understands context. This model is built for documents where meaning matters just as much as characters. It can interpret instructions, handle multilingual content, and respond intelligently to prompts.</p>
                                </div>

                                <div>
                                    <h4 style={{ color: 'var(--text-primary)', marginBottom: '12px' }}>Key strengths:</h4>
                                    <ul style={{ color: 'var(--text-secondary)', paddingLeft: '20px', lineHeight: '1.8' }}>
                                        <li>Prompt-driven extraction (ask for specific fields or summaries)</li>
                                        <li>Strong multilingual understanding</li>
                                        <li>Handles dense, long-form documents with ease</li>
                                        <li>Excellent for semantic OCR and document Q&A</li>
                                    </ul>
                                </div>

                                <div className="docs-note" style={{ marginTop: '24px', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
                                    <strong style={{ color: '#fff' }}>Why choose XF3 Pro?</strong><br />
                                    When OCR alone isn’t enough and you need understanding, XF3 Pro steps in.
                                </div>
                            </div>
                        </section>

                        <section id="xf3-large" className="docs-section">
                            <div className="docs-feature-card" style={{ borderLeft: '4px solid #ef4444', background: 'rgba(239, 68, 68, 0.05)' }}>
                                <h2>🏗️ XF3-large</h2>
                                <p style={{ fontSize: '18px', fontWeight: 700, color: '#f87171', marginBottom: '16px' }}>Enterprise-Scale Document Intelligence</p>

                                <div style={{ marginBottom: '24px' }}>
                                    <h4 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Best for:</h4>
                                    <p>Large-scale archives, financial records, handwritten documents, noisy scans.</p>
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <h4 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>What it does best:</h4>
                                    <p>XF3-large is built for the hardest OCR problems. It excels in deeply complex layouts, degraded scans, handwriting, and massive document sets. Designed for accuracy-first workflows where precision is non-negotiable.</p>
                                </div>

                                <div>
                                    <h4 style={{ color: 'var(--text-primary)', marginBottom: '12px' }}>Key strengths:</h4>
                                    <ul style={{ color: 'var(--text-secondary)', paddingLeft: '20px', lineHeight: '1.8' }}>
                                        <li>Superior handwritten text recognition</li>
                                        <li>Handles historical & low-quality documents</li>
                                        <li>Deep layout and structure comprehension</li>
                                        <li>Best-in-class performance for large, complex PDFs</li>
                                    </ul>
                                </div>

                                <div className="docs-note" style={{ marginTop: '24px', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
                                    <strong style={{ color: '#fff' }}>Why choose XF3-large?</strong><br />
                                    For mission-critical workloads where accuracy defines success, XF3-large is the final word.
                                </div>
                            </div>
                        </section>

                        <section id="comparison" className="docs-section">
                            <h2>🔍 Comprehensive Model Comparison</h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>A deep dive into the technical capabilities and optimal usage patterns for each neural model in the XFINITE suite.</p>
                            <div className="docs-table-wrapper">
                                <table className="docs-table">
                                    <thead>
                                        <tr>
                                            <th>Feature / Parameter</th>
                                            <th><strong>XF1-mini</strong></th>
                                            <th><strong>XF3</strong></th>
                                            <th><strong>XF3 Pro</strong></th>
                                            <th><strong>XF3-large</strong></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td><strong>Primary Focus</strong></td>
                                            <td>Ultra-fast OCR</td>
                                            <td>Balanced document understanding</td>
                                            <td>Contextual & semantic OCR</td>
                                            <td>Accuracy-first enterprise OCR</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Inference Speed</strong></td>
                                            <td>⚡⚡⚡ Very Fast</td>
                                            <td>⚡⚡ Fast</td>
                                            <td>⚡ Moderate</td>
                                            <td>⚡ Moderate</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Accuracy Level</strong></td>
                                            <td>⭐⭐</td>
                                            <td>⭐⭐⭐⭐</td>
                                            <td>⭐⭐⭐⭐⭐</td>
                                            <td>⭐⭐⭐⭐⭐⭐</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Compute Cost</strong></td>
                                            <td>Very Low</td>
                                            <td>Low–Medium</td>
                                            <td>Medium</td>
                                            <td>High</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Best Document Types</strong></td>
                                            <td>Invoices, receipts, forms</td>
                                            <td>Reports, tables, multi-column PDFs</td>
                                            <td>Contracts, legal, research</td>
                                            <td>Archives, handwritten, noisy scans</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Layout Detection</strong></td>
                                            <td>Basic</td>
                                            <td>Advanced</td>
                                            <td>Advanced+</td>
                                            <td>Deep hierarchical</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Reading Order</strong></td>
                                            <td>Good</td>
                                            <td>Very Good</td>
                                            <td>Excellent</td>
                                            <td>Excellent</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Table Extraction</strong></td>
                                            <td>Simple tables</td>
                                            <td>Complex tables</td>
                                            <td>Complex + semantic</td>
                                            <td>Complex + nested</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Multi-page PDF Support</strong></td>
                                            <td>Yes</td>
                                            <td>Yes</td>
                                            <td>Yes</td>
                                            <td>Yes (optimized for large PDFs)</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Handwritten Text</strong></td>
                                            <td>❌ Limited</td>
                                            <td>⚠️ Partial</td>
                                            <td>⚠️ Partial</td>
                                            <td>✅ Strong</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Low-Quality Scan</strong></td>
                                            <td>⚠️ Moderate</td>
                                            <td>✅ Good</td>
                                            <td>✅ Very Good</td>
                                            <td>✅ Excellent</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Multilingual OCR</strong></td>
                                            <td>⚠️ Limited</td>
                                            <td>✅ Good</td>
                                            <td>✅ Strong</td>
                                            <td>✅ Strong</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Prompt-based Extraction</strong></td>
                                            <td>❌ No</td>
                                            <td>❌ No</td>
                                            <td>✅ Yes</td>
                                            <td>⚠️ Limited</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Document Q&A</strong></td>
                                            <td>❌ No</td>
                                            <td>❌ No</td>
                                            <td>✅ Yes</td>
                                            <td>⚠️ Partial</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Semantic Understanding</strong></td>
                                            <td>❌ None</td>
                                            <td>⚠️ Structural</td>
                                            <td>✅ High</td>
                                            <td>✅ High (layout-driven)</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Structured Output (JSON)</strong></td>
                                            <td>✅ Yes</td>
                                            <td>✅ Yes</td>
                                            <td>✅ Yes</td>
                                            <td>✅ Yes</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Field-specific Extraction</strong></td>
                                            <td>⚠️ Limited</td>
                                            <td>✅ Good</td>
                                            <td>✅ Excellent</td>
                                            <td>✅ Excellent</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Long-form Document</strong></td>
                                            <td>❌ Not ideal</td>
                                            <td>⚠️ Moderate</td>
                                            <td>✅ Strong</td>
                                            <td>✅ Very Strong</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Enterprise Scale</strong></td>
                                            <td>❌ No</td>
                                            <td>⚠️ Limited</td>
                                            <td>⚠️ Selective</td>
                                            <td>✅ Yes</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Recommended API Tier</strong></td>
                                            <td>Starter / Free</td>
                                            <td>Pro</td>
                                            <td>Pro+</td>
                                            <td>Enterprise</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Ideal Usage Pattern</strong></td>
                                            <td>High-volume, low latency</td>
                                            <td>General purpose OCR</td>
                                            <td>Intelligent workflows</td>
                                            <td>Mission-critical accuracy</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <div className="docs-cta-modern">
                            <h2>Ready to architect your intelligence?</h2>
                            <p>Join the next generation of document workflows. Start exploring the dashboard or integrate our API today.</p>
                            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                                <button className="nav-btn-primary" style={{ padding: '14px 40px', fontSize: '16px' }}>Open Dashboard</button>
                                <button className="nav-btn-secondary" style={{ padding: '14px 40px', fontSize: '16px' }}>Contact Sales</button>
                            </div>
                        </div>

                        <footer className="docs-footer-modern">
                            <div className="docs-footer-grid">
                                <div className="footer-brand">
                                    <h3>
                                        <img src={`${BASE_PATH}/logo.png`} alt="Xfinite" style={{ height: '24px' }} />
                                        Xfinite
                                    </h3>
                                    <p>Modular OCR infrastructure for the AI-first era. Built with precision, scaled with passion.</p>
                                </div>
                                <div className="footer-col">
                                    <h4>Product</h4>
                                    <ul>
                                        <li><Link href="/">Dashboard</Link></li>
                                        <li><Link href="/status">System Status</Link></li>
                                        <li><a href="#">Pricing</a></li>
                                        <li><a href="#">Beta Program</a></li>
                                    </ul>
                                </div>
                                <div className="footer-col">
                                    <h4>Resources</h4>
                                    <ul>
                                        <li><Link href="/docs">Documentation</Link></li>
                                        <li><a href="#">API Reference</a></li>
                                        <li><a href="#">Support Center</a></li>
                                        <li><a href="#">Community</a></li>
                                    </ul>
                                </div>
                                <div className="footer-col">
                                    <h4>Connect</h4>
                                    <ul>
                                        <li><a href="#">Twitter / X</a></li>
                                        <li><a href="#">GitHub</a></li>
                                        <li><a href="#">LinkedIn</a></li>
                                        <li><a href="#">Discord</a></li>
                                    </ul>
                                </div>
                            </div>
                            <div className="footer-bottom">
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span className="status-dot-mini"></span>
                                    <span>Global Network: <strong>Operational</strong></span>
                                </div>
                                <div>&copy; 2026 XFINITE AI. All rights reserved.</div>
                                <div className="footer-socials">
                                    <a href="#" className="footer-social-link">Privacy</a>
                                    <a href="#" className="footer-social-link">Terms</a>
                                </div>
                            </div>
                        </footer>
                    </div>
                </main>
            </div>
        </div>
    );
}
