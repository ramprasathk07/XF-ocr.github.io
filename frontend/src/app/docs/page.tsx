import Link from 'next/link';

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || (process.env.NODE_ENV === 'production' ? '/XF-ocr.github.io' : '');

export default function DocsPage() {
    return (
        <div id="app">
            {/* Top Navbar */}
            <header className="navbar">
                <div className="nav-left">
                    <div className="logo">
                        <img src={`${BASE_PATH}/logo.png`} alt="Xfinite" className="logo-img" />
                        <span>Xfinite</span>
                    </div>
                    <nav className="nav-links">
                        <Link href="/">Dashboard</Link>
                        <Link href="/docs" className="active">Docs</Link>
                    </nav>
                </div>
                <div className="nav-right">
                    <button className="nav-btn-primary">Get Started</button>
                </div>
            </header>

            <div className="layout-body">
                {/* Sidebar */}
                <aside className="sidebar-new">
                    <div className="sidebar-section">
                        <div className="section-header">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                            <span>Documentation</span>
                        </div>
                    </div>

                    <div className="sidebar-section">
                        <p className="sidebar-label">TABLE OF CONTENTS</p>
                        <div className="history-list">
                            <a href="#overview" className="history-item"><span>📊 OCR Models Overview</span></a>
                            <a href="#features" className="history-item"><span>🧠 What Each Model Does</span></a>
                            <a href="#inference" className="history-item"><span>⚡ Inference & Compute</span></a>
                            <a href="#comparison" className="history-item"><span>🧩 Feature Summary</span></a>
                            <a href="#recommendations" className="history-item"><span>🧠 Recommendations</span></a>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="dashboard-main docs-content">
                    <div className="dashboard-header">
                        <h1>📚 OCR Models Documentation</h1>
                        <p className="dashboard-subtitle">A comparative OCR model cheat-sheet for XFINITE-OCR (2025–2026)</p>
                    </div>

                    <article className="docs-article">
                        <section id="overview">
                            <h2>📊 OCR Models Overview</h2>
                            <div className="docs-table-wrapper">
                                <table className="docs-table">
                                    <thead>
                                        <tr>
                                            <th>Model</th>
                                            <th>Type</th>
                                            <th>Core OCR</th>
                                            <th>Other Features</th>
                                            <th>Compute Notes</th>
                                            <th>Best Fit</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td><strong>XF1</strong></td>
                                            <td>Pipeline-based</td>
                                            <td>Standard text OCR</td>
                                            <td>External layout + table modules</td>
                                            <td>Modular pipeline</td>
                                            <td>Baseline simple OCR</td>
                                        </tr>
                                        <tr>
                                            <td><strong>XF2</strong></td>
                                            <td>Classic OCR toolkit</td>
                                            <td>Line-level OCR, 90+ languages</td>
                                            <td>Layout analysis, reading order, tables</td>
                                            <td>CPU-friendly, GPU improves speed</td>
                                            <td>Multilingual document OCR</td>
                                        </tr>
                                        <tr>
                                            <td><strong>XF3 Vision</strong></td>
                                            <td>Vision-Language Model (0.9B)</td>
                                            <td>OCR + parsing (tables, formulas, charts)</td>
                                            <td>Layout, reading order, Markdown/JSON</td>
                                            <td>Resource-efficient, GPU/TPU</td>
                                            <td>Complex layouts, multilingual</td>
                                        </tr>
                                        <tr>
                                            <td><strong>XF3 Pro</strong></td>
                                            <td>End-to-end VLM (1B)</td>
                                            <td>OCR + spotting (bbox coords)</td>
                                            <td>Parsing, IE, VQA, translation</td>
                                            <td>~1B params, one-shot inference</td>
                                            <td>End-to-end extraction</td>
                                        </tr>
                                        <tr>
                                            <td><strong>XF3 Large</strong></td>
                                            <td>Compressed context VLM (3B)</td>
                                            <td>High-accuracy OCR</td>
                                            <td>Long-context compression</td>
                                            <td>~97% accuracy, high-res efficient</td>
                                            <td>Large document collections</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section id="features">
                            <h2>🧠 What Each Model Does</h2>

                            <div className="model-doc-card">
                                <h3>📍 XF1 </h3>
                                <p><strong>Type:</strong> Traditional pipeline toolkit combining modules (text detection + layout + tables).</p>
                                <p><strong>Features:</strong> Basic OCR text extraction and structured extraction via modular tools.</p>
                                <p><strong>Speed:</strong> Depends on each component; not top performer vs VLMs.</p>
                                <p><strong>Use When:</strong> You need flexible modular OCR with integration to custom components.</p>
                            </div>

                            <div className="model-doc-card">
                                <h3>☀️ XF2 </h3>
                                <p><strong>Type:</strong> Python OCR toolkit with multilingual detection (~90+ languages).</p>
                                <ul>
                                    <li>Line OCR + bounding boxes</li>
                                    <li>Layout detection (headers, tables, images)</li>
                                    <li>Reading order detection</li>
                                    <li>Table recognition modules</li>
                                </ul>
                                <p><strong>Best For:</strong> Lightweight document OCR with layout & reading order when LLM integration is not needed.</p>
                            </div>

                            <div className="model-doc-card">
                                <h3>📘 XF3 Vision</h3>
                                <p><strong>Type:</strong> Vision-Language Model (VLM) built for full document parsing.</p>
                                <ul>
                                    <li>Recognizes tables, formulas, charts, reading order</li>
                                    <li>Supports 109 languages (Latin, Cyrillic, Devanagari, Arabic, etc)</li>
                                    <li>Outputs structured JSON/Markdown</li>
                                </ul>
                                <p><strong>Compute:</strong> ~0.9B parameters → good trade-off for structured output without huge GPUs</p>
                            </div>

                            <div className="model-doc-card">
                                <h3>🐉 XF3 Pro </h3>
                                <p><strong>Type:</strong> End-to-end OCR & VLM, trained with RL.</p>
                                <ul>
                                    <li>Text spotting (locations)</li>
                                    <li>Multilingual translation of text images (14+ languages)</li>
                                    <li>Information extraction (IE), VQA</li>
                                </ul>
                                <p><strong>Compute:</strong> ~1B params → relatively lightweight for a VLM</p>
                            </div>

                            <div className="model-doc-card">
                                <h3>🧠 XF3 Large </h3>
                                <p><strong>Type:</strong> VLM optimized for optical token compression</p>
                                <ul>
                                    <li>OCR text extraction with high fidelity</li>
                                    <li>Efficient vision token modeling</li>
                                    <li>Good for large high-resolution docs</li>
                                </ul>
                                <p><strong>Compute:</strong> Uses a specialized encoder + decoder to compress long images into fewer tokens → faster across big documents with maintained accuracy (~97% decoded precision).</p>
                            </div>
                        </section>

                        <section id="inference">
                            <h2>⚡ Inference Time & Compute</h2>
                            <p className="docs-note">Note: Precise ms/page numbers vary enormously depending on hardware, image size, resolution, and end-task.</p>

                            <div className="docs-table-wrapper">
                                <table className="docs-table">
                                    <thead>
                                        <tr>
                                            <th>Model</th>
                                            <th>Estimated Compute</th>
                                            <th>Latency Trend</th>
                                            <th>Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr><td>XF2 (Surya)</td><td>Low-Med</td><td>⭐⭐</td><td>Runs on CPU or GPU; basic components</td></tr>
                                        <tr><td>XF1 (Marker)</td><td>Med</td><td>⭐⭐</td><td>Depends on each pipeline part</td></tr>
                                        <tr><td>XF3 Vision (0.9B)</td><td>Med</td><td>⭐⭐⭐</td><td>Fast for VLM parsing; resource-efficient</td></tr>
                                        <tr><td>XF3 Pro (~1B)</td><td>Med</td><td>⭐⭐⭐</td><td>End-to-end one pass OCR + tasks</td></tr>
                                        <tr><td>XF3 Large (~3B)</td><td>Med-High</td><td>⭐⭐⭐</td><td>Compresses tokens; good for high-res</td></tr>
                                    </tbody>
                                </table>
                            </div>
                            <p className="docs-note">Typical rule: under 1B parameters ≈ great for page-by-page inference on mid-range GPUs/CPUs; 3B+ models need stronger GPUs but give deeper context/accuracy. 📈</p>
                        </section>

                        <section id="comparison">
                            <h2>🧩 Feature Summary</h2>
                            <div className="docs-table-wrapper">
                                <table className="docs-table">
                                    <thead>
                                        <tr>
                                            <th>Model</th>
                                            <th>OCR Text</th>
                                            <th>Spotting (bbox)</th>
                                            <th>Layout Parsing</th>
                                            <th>Translation</th>
                                            <th>IE/VQA</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr><td>XF2 (Surya)</td><td>✔️</td><td>✔️</td><td>✔️</td><td>❌</td><td>❌</td></tr>
                                        <tr><td>XF1 (Marker)</td><td>✔️</td><td>✔️</td><td>✔️</td><td>❌</td><td>❌</td></tr>
                                        <tr><td>XF3 Vision</td><td>✔️</td><td>✔️</td><td>✔️</td><td>🟡</td><td>🟡</td></tr>
                                        <tr><td>XF3 Pro</td><td>✔️</td><td>✔️</td><td>✔️</td><td>✔️</td><td>✔️</td></tr>
                                        <tr><td>XF3 Large</td><td>✔️</td><td>✔️</td><td>❓</td><td>❓</td><td>❓</td></tr>
                                    </tbody>
                                </table>
                            </div>
                            <p className="docs-note">🟡 = inferred capability thanks to structured outputs and VLM context, actual performance depends on integration/finetuning.</p>
                        </section>

                        <section id="recommendations">
                            <h2>🧠 Practical Recommendations</h2>
                            <ul className="docs-recs">
                                <li><strong>✨ Best for basic OCR pipelines:</strong> XF2 — lightweight, works well with CPU & GPU, easy to integrate.</li>
                                <li><strong>📄 Best for structured document parsing:</strong> XF3 Vision — excellent at tables, formulas, reading order, multilingual documents.</li>
                                <li><strong>🧠 Best for semantic OCR + translation + IE:</strong> XF3 Pro — unified end-to-end model with spotting and translation.</li>
                                <li><strong>📈 Best for large archive throughput:</strong> XF3 Large — efficient token compression + high accuracy when processing many pages.</li>
                                <li><strong>🛠️ Best for customizable modular workflows:</strong> XF1 — use when you want explicit control over each stage.</li>
                            </ul>
                        </section>
                    </article>
                </main>
            </div>
        </div>
    );
}
