# XFINITE-OCR Professional

A state-of-the-art OCR (Optical Character Recognition) SaaS platform featuring a modern dashboard, multi-model support, and a hybrid architecture designed for flexibility. This project hosts a static frontend on GitHub Pages while connecting securely to a powerful local backend via ngrok.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-live-green.svg)

## 🚀 Key Features

-   **✨ Professional UI/UX**: A sleek, responsive dashboard built with **Next.js 14**, standard CSS, and glassmorphism design elements.
-   **🔐 Secure Authentication**: Integrated **Google Sign-In** (OAuth 2.0) for seamless and secure user access.
-   **🧠 Multi-Model AI Engine**:
    -   **XF1 Standard**: Fast neural processing for standard documents.
    -   **XF2 Global**: Multilingual support.
    -   **XF3 Vision**: Vision Language Model (VLM) for complex layouts.
    -   **XF3 Pro**: End-to-end reasoning and extraction.
-   **📊 Smart Quota System**:
    -   Daily limits managed per user (e.g., 3 PDFs, 40 Images).
    -   Real-time usage tracking and visual progress bars.
-   **Ql History & File Management**:
    -   Automatic saving of all uploaded files and OCR results.
    -   Interactive history list to revisit past extractions.
    -   Split-view interface to compare original vs. extracted text.
-   **📂 Hybrid Deployment**: Designed to run the frontend globally on **GitHub Pages** while keeping data processing on your secure **Local Machine**.

> **⚠️ Hardware & Performance Note**:
> This project demonstrates how to run powerful AI pipelines on consumer hardware. The backend currently runs all models (PaddleOCR, VL-1B, Huyuan-1B, DeepSeek-OCR) on a single **NVIDIA RTX 3060 (12GB)** using **vLLM** for optimization.
> Due to these "GPU limit" constraints, please be patient as inference times may be longer than cloud-native APIs. We are actively optimizing for low-VRAM environments!

---

## 🛠️ Architecture Overview

This application uses a decoupled architecture:

1.  **Frontend**: Static Next.js application hosted on GitHub Pages. It handles the UI, Auth, and communication.
2.  **Backend**: FastAPI Python server running on a high-performance local machine (e.g., with GPU).
3.  **Tunnel**: **ngrok** provides a secure public URL to expose the local backend API to the global frontend.

---

## 📦 Installation & Setup

### 1. Backend Setup (Local Machine)

The backend handles the heavy lifting of OCR processing.

**Prerequisites:** Python 3.10+, pip, and Tesseract (if using standard OCR).

```bash
# Clone the repository
git clone https://github.com/your-repo/openwebUI.git
cd openwebUI/v1

# Install Python dependencies
pip install -r requirements.txt

# Run the Server
python main.py
```

The server will start at `http://localhost:8000`.

### 2. Expose Backend via Ngrok

To allow the GitHub Pages frontend to reach your local backend, use ngrok.

```bash
# Install ngrok and login
ngrok config add-authtoken <YOUR_TOKEN>

# Start the tunnel
ngrok http 8000
```

Copy the forwarding URL (e.g., `https://your-app.ngrok-free.app`).

### 3. Frontend Setup (GitHub Pages)

The frontend is configured to be static exportable.

**Configuration:**
1.  Navigate to `frontend/src/app/page.tsx`.
2.  Update the `API_BASE` variable with your ngrok URL:
    ```typescript
    const API_BASE = "https://your-app.ngrok-free.app";
    ```
    *(Alternatively, use `NEXT_PUBLIC_API_BASE` in your local environment)*.

**Build & Deploy:**

```bash
cd frontend

# Install dependencies
npm install

# Build the static site (Output goes to /out)
npm run build

# Deploy the 'out' folder to your GitHub Pages branch (gh-pages)
# (You can use gh-pages package or manual upload)
```

---

## 📖 Usage Guide

1.  **Login**: Open your GitHub Pages URL and sign in with Google.
2.  **Check Status**: The dashboard will ping your backend. If connected, you'll see "Backend Online".
3.  **Upload**: Click the upload area to select Images or PDFs.
4.  **Process**: The file is sent to your local machine, processed, and the result is returned instantly.
5.  **Review**: View the Markdown results side-by-side with the original document.

---

## 🔧 Troubleshooting

-   **CORS Errors**: Ensure your ngrok URL allows the frontend origin. Start ngrok with host-header if needed:
    `ngrok http 8000 --host-header="localhost:8000"`
-   **Google Auth Error**: Make sure your local address (`localhost:3000`) or production URL is added to "Authorized Origins" in your Google Cloud Console.
-   **404 on History**: Ensure `main.py` is running and the `uploads` directory is writable.

---

## 🤝 Credits

- **Frontend & Design**: Crafted by **Antigravity**.
- **Backend & AI Architecture**: Built by **Xfinite**.

---

## 📄 License
MIT License.
