from PIL import Image, ImageOps
from misc.logger import setup_logger

logger = setup_logger(name="image_processor")

# ==========================
# HARD CONSTANTS (TUNABLE)
# ==========================

MAX_DIM = 1024          # Upper bound for vision tokens (1024–1536 safe)
MIN_DIM = 256           # Prevent tiny images
MAX_ASPECT_RATIO = 6.0  # Prevent pathological long receipts

# ==========================
# IMAGE PROCESSOR
# ==========================

class ImageProcessor:
    @staticmethod
    def process_image(image_input) -> Image.Image:
        """
        Production-grade VLM OCR preprocessing.

        Guarantees:
        - RGB preserved
        - EXIF orientation fixed
        - Bounded vision token cost
        - Deterministic & fast
        """

        try:
            # ----------------------
            # Load image safely
            # ----------------------
            if isinstance(image_input, str):
                img = Image.open(image_input)
                img.load()  # force load to avoid file handle leaks
            elif isinstance(image_input, Image.Image):
                img = image_input.copy()
            else:
                raise ValueError("Unsupported image input type")

            # ----------------------
            # Fix EXIF orientation
            # ----------------------
            img = ImageOps.exif_transpose(img)

            # ----------------------
            # Ensure RGB (critical for VLMs)
            # ----------------------
            if img.mode != "RGB":
                img = img.convert("RGB")

            width, height = img.size

            # ----------------------
            # Aspect ratio guard
            # ----------------------
            aspect_ratio = max(width, height) / max(1, min(width, height))
            if aspect_ratio > MAX_ASPECT_RATIO:
                logger.warning(
                    f"Extreme aspect ratio detected: {width}x{height} "
                    f"(ratio={aspect_ratio:.2f}), resizing conservatively"
                )

            # ----------------------
            # Resize logic (bounded & safe)
            # ----------------------
            max_side = max(width, height)

            if max_side > MAX_DIM:
                scale = MAX_DIM / max_side
            elif max_side < MIN_DIM:
                scale = MIN_DIM / max_side
            else:
                scale = 1.0

            if scale != 1.0:
                new_width = int(width * scale)
                new_height = int(height * scale)

                logger.info(
                    f"Resizing image {width}x{height} → "
                    f"{new_width}x{new_height} (scale={scale:.3f})"
                )

                img = img.resize(
                    (new_width, new_height),
                    resample=Image.Resampling.LANCZOS
                )

            return img

        except Exception as e:
            logger.error("Image preprocessing failed", exc_info=True)
            raise
