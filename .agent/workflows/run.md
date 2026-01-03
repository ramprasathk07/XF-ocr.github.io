---
description: how to run the XFINITE-OCR backend and frontend
---

To run the XFINITE-OCR project locally, follow these steps:

### 1. Install Dependencies
You need Python installed. Run the following command to install the necessary libraries:

// turbo
```powershell
pip install fastapi uvicorn python-multipart google-auth
```

### 2. Run the Backend
Start the FastAPI server. This will handle the document processing and authentication verification.

// turbo
```powershell
python main.py
```
The backend will be available at `http://localhost:8000`.

### 3. Open the Frontend
The frontend is a static site located in the `docs/` folder. You can open it directly in your browser:

- Double-click `docs/index.html` in your file explorer.
- Or, if you want to serve it properly:
  ```powershell
  python -m http.server 8080 --directory docs
  ```
  Then visit `http://localhost:8080`.

### 4. Configuration (Required for Google Sign-In)
- Ensure the `GOOGLE_CLIENT_ID` in `main.py` matches the one in `docs/index.html`.
- For Google Sign-In to work locally, you must access the frontend via `localhost` (not `file://`) and add `http://localhost:8080` (or your port) to the "Authorized JavaScript origins" in your Google Cloud Console.
