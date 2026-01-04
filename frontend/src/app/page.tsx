"use client";

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface User {
  name: string;
  given_name?: string;
  picture: string;
  token: string;
  email: string;
}

interface Quota {
  pdf: { used: number; limit: number; remaining: number };
  image: { used: number; limit: number; remaining: number };
}

interface HistoryItem {
  id: string;
  filename: string;
  ocrResult: any;
  savedFiles: any[];
  timestamp: string;
  model: string;
}

// const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
const API_BASE = "https://unmonarchical-stalked-lea.ngrok-free.dev";
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || (process.env.NODE_ENV === 'production' ? '/XF-ocr.github.io' : '');

const DownloadWidget = ({ content, filename }: { content: string, filename: string }) => {
  const [copied, setCopied] = useState(false);

  const downloadFile = (format: string) => {
    let finalContent = content;
    let mimeType = 'text/plain';
    let ext = format;

    if (format === 'json') {
      finalContent = JSON.stringify({ filename, content, timestamp: new Date().toISOString() }, null, 2);
      mimeType = 'application/json';
    } else if (format === 'csv') {
      finalContent = `"${content.replace(/"/g, '""')}"`;
      mimeType = 'text/csv';
    }

    const blob = new Blob([finalContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename.replace(/\s+/g, '_')}_extraction.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="download-actions">
      <button onClick={() => downloadFile('md')} className="btn-action" title="Download Markdown">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
        MD
      </button>
      <button onClick={() => downloadFile('txt')} className="btn-action">TXT</button>
      <button onClick={() => downloadFile('json')} className="btn-action">JSON</button>
      <button onClick={() => downloadFile('csv')} className="btn-action">CSV</button>
      <button onClick={copyToClipboard} className="btn-action" style={{ marginLeft: '4px', background: copied ? 'rgba(16, 185, 129, 0.1)' : '' }}>
        {copied ? (
          <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg><span style={{ color: '#10b981', marginLeft: '4px' }}>Copied</span></>
        ) : (
          <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg><span style={{ marginLeft: '4px' }}>Copy</span></>
        )}
      </button>
    </div>
  );
};

export default function Dashboard() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentModel, setCurrentModel] = useState("xf1-standard");
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<any>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<HistoryItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [quota, setQuota] = useState<Quota | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Health check polling
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch(`${API_BASE}/health`);
        setBackendOnline(res.ok);
      } catch {
        setBackendOnline(false);
      }
    };
    checkBackend();
    const interval = setInterval(checkBackend, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch usage and history on login
  useEffect(() => {
    if (currentUser) {
      fetchUsage();
      fetchHistory();
    }
  }, [currentUser]);

  const fetchUsage = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API_BASE}/usage`, {
        headers: { 'Authorization': `Bearer ${currentUser.token}` }
      });
      if (res.status === 401) {
        handleSignOut();
        showToast("Session expired. Please sign in again.");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setQuota(data);
      }
    } catch (err) {
      console.error("Failed to fetch usage", err);
    }
  };

  const fetchHistory = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API_BASE}/history`, {
        headers: { 'Authorization': `Bearer ${currentUser.token}` }
      });
      if (res.status === 401) {
        handleSignOut();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  useEffect(() => {
    (window as any).handleCredentialResponse = (response: any) => {
      try {
        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const user = JSON.parse(jsonPayload);
        user.token = response.credential;

        localStorage.setItem('user', JSON.stringify(user));
        setCurrentUser(user);
        showToast(`Welcome back, ${user.given_name || user.name}!`);
      } catch (err) {
        showToast("Login identification failed. Please try again.");
      }
    };

    // Load user from localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser && !currentUser) {
      setCurrentUser(JSON.parse(savedUser));
    }

    if (typeof window !== 'undefined' && (window as any).google) {
      initializeGoogleSignIn();
    }
  }, []);

  const initializeGoogleSignIn = () => {
    (window as any).google.accounts.id.initialize({
      client_id: "988315682438-ijit7vq4id6uv3b34dk2hge70fkm1l2f.apps.googleusercontent.com",
      callback: (window as any).handleCredentialResponse,
    });
    const btn = document.getElementById("g_id_signin_btn");
    if (btn) {
      (window as any).google.accounts.id.renderButton(btn, { theme: "filled_black", size: "medium", shape: "pill" });
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleModelChange = (model: string) => {
    setCurrentModel(model);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!currentUser) {
      showToast("Please sign in before uploading documents.");
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const imageFiles = Array.from(files).filter(f => !f.name.toLowerCase().endsWith('.pdf'));
    if (imageFiles.length > 5) {
      showToast("Maximum 5 images allowed per upload.");
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsProcessing(true);
    setOcrResult(null);
    setSelectedHistory(null);

    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });
    formData.append('prompt', "Standard extraction");
    formData.append('model', currentModel);

    try {
      const response = await fetch(`${API_BASE}/process`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${currentUser.token}` },
        body: formData
      });

      const data = await response.json();

      if (response.status === 200) {
        setOcrResult(data);
        fetchHistory(); // Sync history after processing
        fetchUsage();
      } else {
        showToast(data.detail || "Upload failed");
      }
    } catch (err) {
      showToast("Connection Error: Is the FastAPI server running?");
      console.error(err);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSignOut = () => {
    if ((window as any).google) {
      (window as any).google.accounts.id.disableAutoSelect();
    }
    localStorage.removeItem('user');
    setCurrentUser(null);
    setHistory([]);
    setQuota(null);
    setOcrResult(null);
    setSelectedHistory(null);
    showToast("Signed out successfully.");
    // Small delay before rendering sign-in button again
    setTimeout(() => initializeGoogleSignIn(), 100);
  };

  const openHistoryItem = (item: HistoryItem) => {
    setSelectedHistory(item);
    setOcrResult(null);
  };

  return (
    <div id="app">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={initializeGoogleSignIn}
        onError={() => showToast("Google Identity Services failed to load.")}
      />

      <header className="navbar">
        <div className="nav-left">
          <div className="logo">
            <img src={`${BASE_PATH}/logo.png`} alt="Xfinite" className="logo-img" />
            <span>Xfinite</span>
          </div>
          <nav className="nav-links">
            <Link href="/" className="active">Dashboard</Link>
            <Link href="/docs">Docs</Link>
            <Link href="/status">Status</Link>
          </nav>
        </div>
        <div className="nav-right">
          {backendOnline !== null && (
            <div className={`status-badge ${!backendOnline ? 'offline' : ''}`}>
              <div className={`dot ${backendOnline ? 'dot-green' : 'dot-red'}`}></div>
              {backendOnline ? 'Backend Online' : 'Backend Offline'}
            </div>
          )}
          {!currentUser ? (
            <div id="g_id_signin_btn"></div>
          ) : (
            <>
              <div className="user-profile">
                <img id="user-avatar" src={currentUser.picture} alt="User" />
                <span id="user-name">{currentUser.given_name || currentUser.name}</span>
              </div>
              <button onClick={handleSignOut} className="nav-btn-secondary">Logout</button>
            </>
          )}
          <button className="nav-btn-primary">Get Started</button>
        </div>
      </header>

      <div className="layout-body">
        <aside className="sidebar-new">
          <div className="sidebar-section">
            <div className="section-header">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              <span>Workspaces</span>
            </div>
            <button className="btn-new-task" onClick={() => { setOcrResult(null); setSelectedHistory(null); }}>
              <span className="plus-icon">+</span>
              New Task
            </button>
          </div>

          <div className="sidebar-section history">
            <p className="sidebar-label">HISTORY</p>
            <div id="sidebar-history" className="history-list">
              {history.length === 0 ? (
                <p className="empty-state">No recent tasks</p>
              ) : (
                history.map((item) => (
                  <div key={item.id} className={`history-item ${selectedHistory?.id === item.id ? 'active' : ''}`} onClick={() => openHistoryItem(item)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                    <span>{item.filename.length > 20 ? item.filename.substring(0, 17) + '...' : item.filename}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {quota && (
            <div className="usage-panel sidebar-section">
              <div className="usage-title">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M2 12h20M12 2v20a15.3 15.3 0 0 1 4-10 15.3 15.3 0 0 1-4-10" /></svg>
                DAILY QUOTA
              </div>
              <div className="usage-item">
                <div className="usage-info"><span>PDF</span><span>{quota.pdf.used}/{quota.pdf.limit}</span></div>
                <div className="usage-bar-bg"><div className="usage-bar-fill" style={{ width: `${(quota.pdf.used / quota.pdf.limit) * 100}%` }}></div></div>
              </div>
              <div className="usage-item">
                <div className="usage-info"><span>Image</span><span>{quota.image.used}/{quota.image.limit}</span></div>
                <div className="usage-bar-bg"><div className="usage-bar-fill" style={{ width: `${(quota.image.used / quota.image.limit) * 100}%` }}></div></div>
              </div>
            </div>
          )}

          <div className="sidebar-footer">
            {currentUser && (
              <button onClick={handleSignOut} className="sign-out-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </aside>

        <main className="dashboard-main">
          <div className="dashboard-header">
            <h1>{selectedHistory ? "History View" : "Dashboard"}</h1>
            <p className="dashboard-subtitle">
              {selectedHistory ? `Viewing extraction for ${selectedHistory.filename}` : "Manage your documents and neural extractions."}
            </p>
          </div>

          {!selectedHistory ? (
            <div className="dashboard-grid">
              <section className="config-panel">
                <div className="panel-header">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"></path><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z"></path></svg>
                  <span>CONFIGURATION</span>
                </div>
                <div className="model-section">
                  <p className="model-label">Neural Model</p>
                  <div className="model-list">
                    {[
                      { id: 'xf1-mini', name: 'XF1 Mini', badge: 'CPU', badgeType: 'fast', desc: 'Blazing fast for simple docs.' },
                      { id: 'xf3', name: 'XF3', badge: 'FAST', badgeType: 'fast', desc: '1B VLM for General docs.' },
                      { id: 'xf3-pro', name: 'XF3 Pro', badge: 'VLM', badgeType: 'vlm', desc: '0.9B VLM for complex visuals.' },
                      { id: 'xf3-large', name: 'XF3 Large', badge: 'VLM-large', badgeType: 'new', desc: '1B End-to-end reasoning.' },
                    ].map(m => (
                      <div key={m.id} className={`model-card ${currentModel === m.id ? 'active' : ''}`} onClick={() => handleModelChange(m.id)}>
                        <div className="model-info"><div className="model-name-row"><span className="model-name">{m.name}</span>{m.badge && <span className={`badge badge-${m.badgeType}`}>{m.badge}</span>}</div><p className="model-desc">{m.desc}</p></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="upload-zone-wrapper">
                  <label className="upload-zone">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    <span>Click to upload doc</span>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} hidden multiple accept="image/*,.pdf" />
                  </label>
                </div>
              </section>

              <section className="preview-panel">
                {isProcessing ? (
                  <div className="loading">Processing document...</div>
                ) : ocrResult ? (
                  <div className="results-view">
                    <div className="result-card">
                      <div className="result-header-row">
                        <div>
                          <h3>OCR Extraction Result</h3>
                          <div className="result-meta">
                            <span>Files: {ocrResult.metadata?.filename}</span>
                            <span>Model: {ocrResult.metadata?.model}</span>
                          </div>
                        </div>
                        <DownloadWidget content={ocrResult.result} filename={ocrResult.metadata?.filename || "result"} />
                      </div>
                      <div className="ocr-rendered-view markdown-body">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {ocrResult.result}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="preview-placeholder">
                    <div className="placeholder-icon"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg></div>
                    <p>Awaiting Input</p>
                  </div>
                )}
              </section>
            </div>
          ) : (
            <div className="split-view-container">
              <div className="split-pane">
                <div className="pane-header">
                  <span>ORIGINAL DOCUMENT</span>
                  <button className="close-split-btn" onClick={() => setSelectedHistory(null)}>Back to Dashboard</button>
                </div>
                <div className="pane-content">
                  {selectedHistory.savedFiles[0]?.type === 'pdf' ? (
                    <iframe className="file-preview-frame" src={`${API_BASE}${selectedHistory.savedFiles[0].saved_path}`} />
                  ) : (
                    <img className="image-preview-fit" src={`${API_BASE}${selectedHistory.savedFiles[0]?.saved_path}`} alt="Original" />
                  )}
                </div>
              </div>
              <div className="split-pane">
                <div className="pane-header">
                  <span>NEURAL EXTRACTION ({selectedHistory.model})</span>
                  <DownloadWidget content={selectedHistory.ocrResult} filename={selectedHistory.filename} />
                </div>
                <div className="pane-content">
                  <div className="ocr-rendered-view markdown-body">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {selectedHistory.ocrResult}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
