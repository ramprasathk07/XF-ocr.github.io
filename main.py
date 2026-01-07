import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from db.database import init_db
from core.metrics import REQUEST_STATS
from routers import process, history, usage, health

# Static file setup
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)

app = FastAPI(title="XFINITE-OCR Professional Backend")

app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ramprasathk07.github.io",
        "https://ramprasathk07.github.io/XF-ocr.github.io",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://192.168.52.1:3000"
    ],
    allow_origin_regex=r"https?://.*\.ngrok-free\.(app|dev)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Middleware for stats tracking
@app.middleware("http")
async def track_stats(request: Request, call_next):
    REQUEST_STATS["total"] += 1
    try:
        response = await call_next(request)
        if response.status_code < 400:
            REQUEST_STATS["success"] += 1
        else:
            REQUEST_STATS["failed"] += 1
        return response
    except Exception as e:
        REQUEST_STATS["failed"] += 1
        raise e

# DB Startup
@app.on_event("startup")
def startup_db():
    try:
        init_db()
        print("Database initialized successfully.")
    except Exception as e:
        print(f"CRITICAL: Database initialization failed: {e}")
        raise e

# Include Routers
app.include_router(process.router)
app.include_router(history.router)
app.include_router(usage.router)
app.include_router(health.router)

# Static frontend serving
docs_path = os.path.join(BASE_DIR, "docs")
SUBPATH = "/XF-ocr.github.io"

if os.path.exists(docs_path):
    app.mount(f"{SUBPATH}/_next", StaticFiles(directory=os.path.join(docs_path, "_next")), name="next-static")
    app.mount(SUBPATH, StaticFiles(directory=docs_path, html=True), name="static")
    
    @app.get("/")
    async def root_redirect():
        return RedirectResponse(url=SUBPATH)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
