import os
import uuid
import shutil
import json
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db, OCRRequest, ProcessedFile, OCRPage
from core.auth import verify_google_token
from core.utils import get_pdf_page_count, check_usage_limit
from misc.ocr_model import ocr_pdf, ocr_image

router = APIRouter()

UPLOADS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")

@router.post("/process")
async def process_document(
    files: list[UploadFile] = File(...),
    prompt: str = Form(...),
    model: str = Form("xf1-standard"),
    user: dict = Depends(verify_google_token),
    db: Session = Depends(get_db)
):
    email = user.get("email")
    pdf_files = [f for f in files if f.filename.lower().endswith(".pdf")]
    image_files = [f for f in files if not f.filename.lower().endswith(".pdf")]

    model_labels = {
        "xf1-standard": "XF1 Standard (Neural v1.2)",
        "xf2-global": "XF2 Global (Multilingual)",
        "xf3-vision": "XF3 Vision (Vision Language Model)",
        "xf3-pro": "XF3 Pro (End-to-end reasoning)",
        "xf3-large": "XF3 Large (High-Res 3B)"
    }
    selected_model = model_labels.get(model, "Standard Model")

    request_id = str(uuid.uuid4())[:8]
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    user_slug = email.replace("@", "_").replace(".", "_")
    request_dir = os.path.join(UPLOADS_DIR, user_slug, f"{timestamp}_{request_id}")
    os.makedirs(request_dir, exist_ok=True)

    saved_files = []
    all_filenames = []
    for f in files:
        safe_name = f.filename.replace(" ", "_")
        rel_folder = os.path.join(user_slug, f"{timestamp}_{request_id}")
        file_path = os.path.join(UPLOADS_DIR, rel_folder, safe_name)
        
        with open(file_path, "wb") as buf:
            shutil.copyfileobj(f.file, buf)

        saved_files.append({
            "original_name": f.filename,
            "safe_name": safe_name,
            "path": file_path,
            "saved_path": f"/uploads/{rel_folder}/{safe_name}".replace("\\", "/"),
            "type": "pdf" if safe_name.lower().endswith(".pdf") else "image"
        })
        all_filenames.append(f.filename)

    all_files_str = ", ".join(all_filenames)

    total_requested_pages = 0
    for file_info in saved_files:
        if file_info["type"] == "pdf":
            file_info["page_count"] = get_pdf_page_count(file_info["path"])
        else:
            file_info["page_count"] = 1
        total_requested_pages += file_info["page_count"]

    check_usage_limit(email, total_requested_pages, db)
    ocr_pages = []
    global_page_no = 1

    for f in saved_files:
        if f["type"] == "pdf":
            try:
                output_img_dir = os.path.join(UPLOADS_DIR, "images", user_slug, request_id)
                os.makedirs(output_img_dir, exist_ok=True)

                pdf_pages = ocr_pdf(f["path"], output_img_dir, model)

                for page in pdf_pages:
                    ocr_pages.append({
                        "page_no": global_page_no,
                        "source_type": "pdf",
                        "source_file": f["original_name"],
                        "pdf_page_no": page.get("page_index", 0) + 1,
                        "text": page.get("text", "")
                    })
                    global_page_no += 1

            except Exception as e:
                ocr_pages.append({
                    "page_no": global_page_no,
                    "source_type": "pdf",
                    "source_file": f["original_name"],
                    "pdf_page_no": None,
                    "text": f"OCR error: {str(e)}"
                })
                global_page_no += 1

    for f in saved_files:
        if f["type"] == "image":
            try:
                text = ocr_image(f["path"], model)
                ocr_pages.append({
                    "page_no": global_page_no,
                    "source_type": "image",
                    "source_file": f["original_name"],
                    "pdf_page_no": None,
                    "text": text
                })
                global_page_no += 1

            except Exception as e:
                ocr_pages.append({
                    "page_no": global_page_no,
                    "source_type": "image",
                    "source_file": f["original_name"],
                    "pdf_page_no": None,
                    "text": f"OCR error: {str(e)}"
                })
                global_page_no += 1

    if not ocr_pages:
        ocr_md = "No text extracted."
    else:
        sections = []
        for p in ocr_pages:
            if p["source_type"] == "pdf":
                header = f"## Page {p['page_no']} (PDF: {p['source_file']} — Page {p['pdf_page_no']})"
            else:
                header = f"## Page {p['page_no']} (Image: {p['source_file']})"

            sections.append(f"{header}\n{p['text']}")

        ocr_md = "\n\n".join(sections)

    result_md = f"""# OCR Results
Processed by **{selected_model}**  
Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Summary
- PDFs: {len(pdf_files)}
- Images: {len(image_files)}
- Total Pages: {len(ocr_pages)}

## OCR Output
{ocr_md}
"""

    with open(os.path.join(request_dir, "result.md"), "w", encoding="utf-8") as f:
        f.write(result_md)

    metadata = {
        "id": request_id, 
        "filename": all_files_str,
        "timestamp": timestamp,
        "model": selected_model,
        "total_pages": len(ocr_pages),
        "pages": ocr_pages,
        "ocrResult": result_md,
        "savedFiles": saved_files
    }

    with open(os.path.join(request_dir, "metadata.json"), "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    db_request = OCRRequest(
        id=request_id,
        user_email=email,
        model=selected_model,
        prompt=prompt,
        total_pages=len(ocr_pages),
        result_md_path=os.path.join(request_dir, "result.md"),
        metadata_json_path=os.path.join(request_dir, "metadata.json")
    )
    db.add(db_request)
    db.flush()

    for file_info in saved_files:
        db_file = ProcessedFile(
            request_id=request_id,
            original_name=file_info["original_name"],
            safe_name=file_info["safe_name"],
            file_path=file_info["path"],
            saved_path=file_info["saved_path"],
            file_type=file_info["type"],
            page_count=file_info["page_count"]
        )
        db.add(db_file)
        db.flush()
        file_info["db_id"] = db_file.id

    for page in ocr_pages:
        target_file_id = None
        for file_info in saved_files:
            if file_info["original_name"] == page["source_file"]:
                target_file_id = file_info["db_id"]
                break
        
        db_page = OCRPage(
            request_id=request_id,
            file_id=target_file_id,
            page_no=page["page_no"],
            source_type=page["source_type"],
            source_file=page["source_file"],
            pdf_page_no=page["pdf_page_no"],
            text=page["text"]
        )
        db.add(db_page)
    
    db.commit()

    return {
        "status": "success",
        "total_pages": len(ocr_pages),
        "pages": ocr_pages,
        "result": result_md,
        "metadata": metadata
    }
