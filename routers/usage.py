from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from db.database import get_db, OCRRequest
from core.auth import verify_google_token
from core.utils import DAILY_PAGE_LIMIT

router = APIRouter()

@router.get("/usage")
def get_usage(user: dict = Depends(verify_google_token), db: Session = Depends(get_db)):
    email = user.get("email")
    today = date.today()
    
    used_pages = db.query(func.sum(OCRRequest.total_pages)).filter(
        OCRRequest.user_email == email,
        func.date(OCRRequest.timestamp) == today
    ).scalar() or 0
    
    usage_data = {
        "used": used_pages,
        "limit": DAILY_PAGE_LIMIT,
        "remaining": max(0, DAILY_PAGE_LIMIT - used_pages)
    }
    # Backward compatibility
    usage_data["pdf"] = usage_data.copy()
    usage_data["image"] = {"used": 0, "limit": DAILY_PAGE_LIMIT, "remaining": DAILY_PAGE_LIMIT}
    
    return usage_data
