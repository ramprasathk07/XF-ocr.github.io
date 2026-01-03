from preprocess import pdf_processor
from model import OCRGPU
from logger import setup_logger

logger = setup_logger(name="ocr-model", log_dir="logs")

def ocr_pdf(pdf_path,output_dir,model):

    logger.info(f"Processing PDF: {pdf_path}")
    # Passing default workers=4 and dpi=300
    list_of_images = pdf_processor(pdf_path, output_dir, workers=4, dpi=300)
    logger.info(f"Processing {len(list_of_images)} images")

    logger.info(f"Initializing OCR model: {model}")
    OCR_PROCESSOR = OCRGPU(model)
    logger.info(f"OCR Model initialized")

    results = OCR_PROCESSOR.run_batch(list_of_images)
    logger.info(f"Completed processing {len(list_of_images)} images")

    return results