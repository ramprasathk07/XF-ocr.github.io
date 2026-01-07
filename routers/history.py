import os
import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.database import get_db, OCRRequest
from core.auth import verify_google_token

router = APIRouter()

@router.get("/history")
def get_history(user: dict = Depends(verify_google_token), db: Session = Depends(get_db)):
    email = user.get("email")
    db_requests = db.query(OCRRequest).filter(OCRRequest.user_email == email).order_by(OCRRequest.timestamp.desc()).all()
    
    history = []
    for req in db_requests:
        meta_path = req.metadata_json_path
        data = {}
        if os.path.exists(meta_path):
            try:
                with open(meta_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
            except:
                pass
        
        data["id"] = req.id
        data["timestamp"] = req.timestamp.strftime("%Y%m%d_%H%M%S")
        data["model"] = req.model
        data["total_pages"] = req.total_pages
        
        if "savedFiles" not in data or not data["savedFiles"]:
            data["savedFiles"] = [
                {
                    "original_name": f.original_name,
                    "safe_name": f.safe_name,
                    "saved_path": f.saved_path,
                    "type": f.file_type
                } for f in req.files
            ]
        
        if "filename" not in data:
            names = [f.original_name for f in req.files]
            data["filename"] = ", ".join(names) if names else "Unknown Document"
            
        if "ocrResult" not in data:
            if os.path.exists(req.result_md_path):
                with open(req.result_md_path, "r", encoding="utf-8") as rf:
                    data["ocrResult"] = rf.read()
            else:
                data["ocrResult"] = "No result content available."

        history.append(data)
        
    return history
