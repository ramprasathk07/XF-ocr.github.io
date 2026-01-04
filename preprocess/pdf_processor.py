import argparse
import os
import pathlib
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from functools import lru_cache
from typing import List, Optional
from preprocess.image_processor import ImageProcessor
from PIL import Image

import fitz  # PyMuPDF
from logger import setup_logger

# Initialize Logger
logger = setup_logger(name="pdf_processor", log_dir="logs")


@lru_cache(maxsize=16)
def get_zoom_matrix(dpi: int) -> fitz.Matrix:
    """
    Returns a cached fitz.Matrix for the given DPI.
    
    Args:
        dpi: The Dots Per Inch value.
        
    Returns:
        A fitz.Matrix scaled to the correct zoom level.
    """
    zoom = dpi / 72
    return fitz.Matrix(zoom, zoom)


# def render_pages(
#     pdf_path: str, 
#     page_nums: List[int], 
#     output_dir: str, 
#     dpi: int
# ) -> List[str]:
#     """
#     Renders a subset of pages from a PDF to PNG images.
    
#     Args:
#         pdf_path: Path to the input PDF file.
#         page_nums: List of page numbers (0-indexed) to render.
#         output_dir: Directory to save generated images.
#         dpi: Dots Per Inch for rendering quality.
        
#     Returns:
#         List of paths to the generated image files.
#     """
#     results: List[str] = []
    
#     # Error handling: Open Doc
#     try:
#         doc = fitz.open(pdf_path)
#     except Exception as e:
#         logger.error(f"Failed to open PDF in worker: {e}", exc_info=True)
#         return []

#     mat = get_zoom_matrix(dpi)
#     stem = pathlib.Path(pdf_path).stem

#     for page_num in page_nums:
#         try:
#             page = doc.load_page(page_num)
            
#             # alpha=False avoids RGBA, making it OCR friendly (RGB output)
#             pix = page.get_pixmap(matrix=mat, alpha=False)
            
#             output_filename = f"{stem}_p{page_num}.png"
#             output_path = os.path.join(output_dir, output_filename)
            
#             # Saving as PNG (lossless)
#             pix.save(output_path)
#             results.append(output_path)
            
#         except Exception as e:
#             # Catch specific page errors so one bad page doesn't crash the worker
#             logger.error(f"Error rendering page {page_num}: {e}")
#             continue

#     doc.close()
#     return results


def render_pages(
    pdf_path: str,
    page_nums: List[int],
    output_dir: str,
    dpi: int
) -> List[str]:
    results: List[str] = []

    try:
        doc = fitz.open(pdf_path)
    except Exception as e:
        logger.error(f"Failed to open PDF in worker: {e}", exc_info=True)
        return results

    mat = get_zoom_matrix(dpi)
    stem = pathlib.Path(pdf_path).stem

    for page_num in page_nums:
        try:
            page = doc.load_page(page_num)

            # Render page → pixmap (RGB)
            pix = page.get_pixmap(matrix=mat, alpha=False)

            # Pixmap → PIL Image (NO disk I/O)
            img = Image.frombytes(
                "RGB",
                (pix.width, pix.height),
                pix.samples
            )

            # Apply VLM-safe preprocessing
            img = ImageProcessor.process_image(img)

            output_filename = f"{stem}_p{page_num}.png"
            output_path = os.path.join(output_dir, output_filename)

            img.save(output_path, format="PNG", optimize=True)
            results.append(output_path)

        except Exception as e:
            logger.error(f"Error rendering page {page_num}: {e}", exc_info=True)

    doc.close()
    return results

def chunkify(items: List[int], n: int) -> List[List[int]]:
    """
    Splits a list of items into n roughly equal chunks.
    
    Args:
        items: List of items to split.
        n: Number of chunks.
    
    Returns:
        A list of lists (chunks).
    """
    if n < 1: 
        n = 1
    k, m = divmod(len(items), n)
    return [
        items[i * k + min(i, m):(i + 1) * k + min(i + 1, m)]
        for i in range(n)
    ]


def pdf_processor(
    pdf_path: str, 
    output_dir: str, 
    workers: int, 
    dpi: int
) -> List[str]:
    """
    Orchestrates the parallel rendering of a PDF file using ThreadPoolExecutor.
    
    Args:
        pdf_path: Path to input PDF.
        output_dir: Output directory for images.
        workers: Number of parallel threads.
        dpi: DPI for rendering.
    """
    start_time = time.time()
    logger.info("Starting PDF processing job...")

    # Edge case: Input file check
    if not os.path.exists(pdf_path):
        logger.error(f"Input PDF file not found: {pdf_path}")
        return

    # Edge case: Output dir creation
    try:
        os.makedirs(output_dir, exist_ok=True)
    except OSError as e:
        logger.critical(f"Failed to create output directory '{output_dir}': {e}", exc_info=True)
        return

    # Get page count safely
    try:
        doc = fitz.open(pdf_path)
        num_pages = doc.page_count
        doc.close()
    except Exception as e:
        logger.error(f"Failed to read PDF metadata: {e}", exc_info=True)
        return

    # Edge case: Empty PDF
    if num_pages == 0:
        logger.warning("PDF has 0 pages. Nothing to process.")
        return

    # Don't create more workers than pages
    workers = min(workers, num_pages)

    pages = list(range(num_pages))
    chunks = chunkify(pages, workers)

    logger.info(
        f"Job Details: file={pdf_path} | pages={num_pages} | workers={workers} | dpi={dpi}"
    )

    total_rendered = 0
    
    all_results = []
    with ThreadPoolExecutor(max_workers=workers) as executor:
        # Submit all tasks
        futures = {
            executor.submit(render_pages, pdf_path, chunk, output_dir, dpi): chunk 
            for chunk in chunks if chunk
        }

        # Process as they complete
        for future in as_completed(futures):
            try:
                result_paths = future.result()
                all_results.extend(result_paths)
                total_rendered += len(result_paths)
                logger.info(f"Progress: {total_rendered}/{num_pages} pages rendered.")
            except Exception as e:
                logger.error(f"Worker thread failed: {e}", exc_info=True)

    duration = time.time() - start_time
    logger.info(f"Job Completed! Rendered {total_rendered} pages in {duration:.2f}s")
    return sorted(all_results)

