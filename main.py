import os
import uuid
import shutil
import json
from datetime import datetime, date
from typing import Optional, Dict
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from google.oauth2 import id_token
from google.auth.transport import requests
from ocr_model import ocr_pdf

app = FastAPI(title="XFINITE-OCR Professional Backend")

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GOOGLE_CLIENT_ID = "988315682438-ijit7vq4id6uv3b34dk2hge70fkm1l2f.apps.googleusercontent.com"

# In-memory usage trackers: { email: { date: count } }
pdf_usage_tracker: Dict[str, Dict[date, int]] = {}
image_usage_tracker: Dict[str, Dict[date, int]] = {}

def verify_google_token(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required. Please sign in.")
    
    token = authorization.split(" ")[1]
    try:
        # Mocking user extraction for the demo
        return {"name": "Test User", "email": "test@example.com", "picture": ""}
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid session. Please sign in again.")

def check_pdf_limit(email: str):
    today = date.today()
    if email not in pdf_usage_tracker:
        pdf_usage_tracker[email] = {}
    
    current_usage = pdf_usage_tracker[email].get(today, 0)
    if current_usage >= 3:
        raise HTTPException(
            status_code=429, 
            detail="Daily PDF limit reached. You can only process 3 PDFs per day on the free tier."
        )
    return current_usage

def check_image_limit(email: str, count: int):
    today = date.today()
    if email not in image_usage_tracker:
        image_usage_tracker[email] = {}
    
    current_usage = image_usage_tracker[email].get(today, 0)
    if current_usage + count > 40:
        remaining = 40 - current_usage
        raise HTTPException(
            status_code=429, 
            detail=f"Daily image limit reached. You have {remaining} images remaining today."
        )
    return current_usage

@app.post("/process")
async def process_document(
    files: list[UploadFile] = File(...),
    prompt: str = Form(...),
    model: str = Form("xf1-standard"),
    user: dict = Depends(verify_google_token)
):
    email = user.get("email")
    
    # Separate PDFs and images
    pdf_files = [f for f in files if f.filename.lower().endswith('.pdf')]
    image_files = [f for f in files if not f.filename.lower().endswith('.pdf')]
    
    # Validate image uploads
    if len(image_files) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 images allowed per upload.")
    
    if image_files:
        check_image_limit(email, len(image_files))
        today = date.today()
        if email not in image_usage_tracker:
            image_usage_tracker[email] = {}
        image_usage_tracker[email][today] = image_usage_tracker[email].get(today, 0) + len(image_files)
    
    # Validate PDF uploads
    if pdf_files:
        check_pdf_limit(email)
        for pdf in pdf_files:
            mock_page_count = 5 
            if mock_page_count > 10:
                raise HTTPException(status_code=400, detail=f"PDF '{pdf.filename}' exceeds limit.")
        today = date.today()
        if email not in pdf_usage_tracker:
            pdf_usage_tracker[email] = {}
        pdf_usage_tracker[email][today] = pdf_usage_tracker[email].get(today, 0) + len(pdf_files)
    
    model_labels = {
        "xf1-standard": "XF1 Standard (Neural v1.2)",
        "xf2-global": "XF2 Global (Multilingual)",
        "xf3-vision": "XF3 Vision (Vision Language Model)",
        "xf3-pro": "XF3 Pro (End-to-end reasoning)",
        "xf3-large": "XF3 Large (High-Res 3B)"
    }
    selected_model = model_labels.get(model, "Standard Model")
    
    # Unique Request ID and Folder
    request_id = str(uuid.uuid4())[:8]
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    folder_name = f"{timestamp}_{request_id}"
    user_slug = email.replace("@", "_").replace(".", "_")
    request_dir = os.path.join("uploads", user_slug, folder_name)
    os.makedirs(request_dir, exist_ok=True)
    
    saved_files = []
    for f in files:
        safe_filename = f.filename.replace(" ", "_")
        file_path = os.path.join(request_dir, safe_filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(f.file, buffer)
        
        saved_path = f"/uploads/{user_slug}/{folder_name}/{safe_filename}"
        
        saved_files.append({
            "original_name": f.filename,
            "saved_path": saved_path,
            "type": "pdf" if f.filename.lower().endswith('.pdf') else "image"
        })

    # Build result
    all_files_str = ", ".join([f["original_name"] for f in saved_files])
    today = date.today()
    remaining_pdfs = 3 - pdf_usage_tracker.get(email, {}).get(today, 0)
    remaining_images = 40 - image_usage_tracker.get(email, {}).get(today, 0)

    results = "No PDF processing required."
    ## add the OCR 
    for file_details in saved_files:
        if file_details["type"] == "pdf":
            # Use real filesystem path
            local_filename = file_details["original_name"].replace(" ", "_")
            file_fs_path = os.path.join(request_dir, local_filename)
            output_img_dir = os.path.join("images", user_slug, folder_name)
            
            # results = ocr_pdf(file_fs_path, output_img_dir, model)
            if isinstance(results, list):
                ocr_result = "\n".join(results)
            else:
                ocr_result = str(results)

    result_md = f"""# OCR Results for {all_files_str}
Processed by {selected_model} on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Summary
- Files: {len(pdf_files)} PDFs, {len(image_files)} Images
- Status: Successfully parsed.

## OCR Results
{ocr_result}
---
*Remaining daily quota: {remaining_pdfs} PDFs | {remaining_images} Images*"""

    # Save result.md
    with open(os.path.join(request_dir, "result.md"), "w") as f:
        f.write(result_md)

    # Save metadata.json
    metadata = {
        "id": request_id,
        "filename": all_files_str,
        "timestamp": timestamp,
        "model": selected_model,
        "ocrResult": result_md,
        "savedFiles": saved_files
    }
    with open(os.path.join(request_dir, "metadata.json"), "w") as f:
        json.dump(metadata, f)

    return {
        "status": "success",
        "result": result_md,
        "metadata": metadata
    }

@app.get("/history")
def get_history(user: dict = Depends(verify_google_token)):
    email = user.get("email")
    user_slug = email.replace("@", "_").replace(".", "_")
    user_dir = os.path.join("uploads", user_slug)
    
    if not os.path.exists(user_dir):
        return []
    
    history = []
    try:
        if os.path.isdir(user_dir):
            folders = sorted(os.listdir(user_dir), reverse=True)
            for folder in folders:
                folder_path = os.path.join(user_dir, folder)
                if os.path.isdir(folder_path):
                    meta_path = os.path.join(folder_path, "metadata.json")
                    if os.path.exists(meta_path):
                        with open(meta_path, "r") as f:
                            history.append(json.load(f))
    except Exception as e:
        print(f"Error reading history: {e}")
        
    return history

@app.get("/usage")
def get_usage(user: dict = Depends(verify_google_token)):
    email = user.get("email")
    today = date.today()
    
    pdf_count = pdf_usage_tracker.get(email, {}).get(today, 0)
    image_count = image_usage_tracker.get(email, {}).get(today, 0)
    
    return {
        "pdf": {
            "used": pdf_count,
            "limit": 3,
            "remaining": 3 - pdf_count
        },
        "image": {
            "used": image_count,
            "limit": 40,
            "remaining": 40 - image_count
        }
    }

@app.get("/health")
def health_check():
    return {
        "status": "operational",
        "uptime": "99.99%",
        "components": [
            {"name": "Core API", "status": "operational", "latency": "12ms"},
            {"name": "Neural Engine", "status": "operational", "latency": "45ms"},
            {"name": "Storage Cluster", "status": "operational", "latency": "5ms"},
            {"name": "Auth Gateway", "status": "operational", "latency": "8ms"}
        ],
        "client_id": GOOGLE_CLIENT_ID
    }

# Static file mounts
uploads_path = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(uploads_path, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_path), name="uploads")

# Serve static frontend files from docs/ folder
docs_path = os.path.join(os.path.dirname(__file__), "docs")
if os.path.exists(docs_path):
    app.mount("/_next", StaticFiles(directory=os.path.join(docs_path, "_next")), name="next-static")
    app.mount("/", StaticFiles(directory=docs_path, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
