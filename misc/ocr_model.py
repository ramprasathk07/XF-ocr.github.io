from preprocess import pdf_processor
from model.ocr_gpu import OCRGPU
from misc.logger import setup_logger

logger = setup_logger(name="ocr-model", log_dir="logs")

import threading

# Singleton-ish or factory for processor to avoid re-init
_processors = {}
_processor_lock = threading.Lock()

def get_processor(model_name):
    with _processor_lock:
        if model_name not in _processors:
            logger.info(f"Loading processor for {model_name}...")
            _processors[model_name] = OCRGPU(model_name)
        else:
            logger.info(f"Using cached processor for {model_name}")
    return _processors[model_name]

def ocr_pdf(pdf_path, output_dir, model):
    logger.info(f"Processing PDF: {pdf_path}")
    list_of_images = pdf_processor(pdf_path, output_dir, workers=4, dpi=300)
    logger.info(f"Processing {len(list_of_images)} images")

    processor = get_processor(model)
    results = processor.run_batch(list_of_images)
    
    # Map 'page_no' from OCRGPU to 'page_index' for the backend
    for res in results:
        res['page_index'] = res.get('page_no', 1) - 1
        
    logger.info(f"Completed processing {len(list_of_images)} images")
    return results

def ocr_image(image_path, model):
    logger.info(f"Processing Image: {image_path}")
    processor = get_processor(model)
    results = processor.run_batch([image_path])
    if results:
        return results[0].get("text", "")
    return ""