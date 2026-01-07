import os
import fitz
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from db.database import OCRRequest
from datetime import date

from dotenv import load_dotenv
load_dotenv()
DAILY_PAGE_LIMIT = int(os.getenv("DAILY_PAGE_LIMIT", 40))

def get_pdf_page_count(file_path: str) -> int:
    try:
        doc = fitz.open(file_path)
        count = len(doc)
        doc.close()
        return count
    except Exception as e:
        print(f"Error counting PDF pages: {e}")
        return 0

def check_usage_limit(email: str, additional_pages: int, db: Session):
    today = date.today()
    current_usage = db.query(func.sum(OCRRequest.total_pages)).filter(
        OCRRequest.user_email == email,
        func.date(OCRRequest.timestamp) == today
    ).scalar() or 0
    
    if current_usage + additional_pages > DAILY_PAGE_LIMIT:
        remaining = DAILY_PAGE_LIMIT - current_usage
        raise HTTPException(
            status_code=429, 
            detail=f"Daily limit reached. You have {max(0, remaining)} pages remaining today. Requested: {additional_pages} pages."
        )
    return current_usage
