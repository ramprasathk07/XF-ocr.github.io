import os
import time
import base64
import json
import secrets
import hashlib
import signal
import sys
import logging
from io import BytesIO
from pathlib import Path
from PIL import Image
from openai import OpenAI
from logger import setup_logger
import torch

logger = setup_logger(name="ocr-worker", log_dir="logs")

class OCRGPU:
    def __init__(
        self,
        model_name: str,
        out_dir: str = "outputs",
        batch_size: int = 1,
    ):
        self.model_name = model_name
        self.out_dir = out_dir
        self.batch_size = batch_size
        self.temperature = 0.0
        self.max_tokens = 16384

        os.makedirs(self.out_dir, exist_ok=True)

        # start_vllm.py would be needed here, assuming 'start' is imported
        from model.start_vllm import start
        start(model_name)

        # Wait for server to be ready
        time.sleep(10) 

        self.client = OpenAI(
            api_key="EMPTY",
            base_url="http://localhost:8000/v1",
            timeout=3600,
        )

        self.PaddleOCR_TASKS = {
            "ocr": {"ocr", "text", "extract", "read", "markdown"},
            "table": {"table", "rows", "columns", "spreadsheet"},
            "formula": {"formula", "equation", "latex", "math"},
            "chart": {"chart", "graph", "plot", "bar", "line"},
        }

    # -------------------------
    # HELPERS
    # -------------------------
    def generate_hash(self):
        return hashlib.sha256(secrets.token_bytes(32)).hexdigest()

    def assign_task_from_prompt(self, prompt: str) -> str:
        scores = {k: 0 for k in self.PaddleOCR_TASKS}
        pl = prompt.lower()
        for task, kws in self.PaddleOCR_TASKS.items():
            for kw in kws:
                if kw in pl:
                    scores[task] += 1
        best = max(scores, key=scores.get)
        return best if scores[best] > 0 else "ocr"

    def img_to_b64(self, path: str) -> str:
        try:
            img = Image.open(path).convert("RGB")
            buf = BytesIO()
            img.save(buf, format="PNG")
            return base64.b64encode(buf.getvalue()).decode()
        except Exception as e:
            logger.error(f"Failed to load image {path}: {e}")
            raise

    # -------------------------
    # UNIFIED PROCESSOR
    # -------------------------
    def run_batch(self, image_paths: list, prompt: str = "OCR the text in the image and output as markdown."):
        """
        Unified entry point for both models. 
        Returns a list of extracted text strings corresponding to image_paths.
        """
        logger.info(f"Processing batch of {len(image_paths)} images with {self.model_name}")
        
        if self.model_name == "xf1-standard":
            prompt = self.assign_task_from_prompt(prompt)
            logger.info(f"Assigned PaddleOCR task: {prompt}")

        results = []
        
        for i in range(0, len(image_paths), self.batch_size):
            batch = image_paths[i:i + self.batch_size]
            
            messages = []
            for img_path in batch:
                img_b64 = self.img_to_b64(img_path)
                messages.append({
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/png;base64,{img_b64}"
                            },
                        },
                        {"type": "text", "text": prompt},
                    ],
                })

            # Call vLLM
            try:
                extra_body = {}
                if self.model_name == "xf3-pro":
                    extra_body = {
                        "skip_special_tokens": False,
                        "vllm_xargs": {
                            "ngram_size": 30,
                            "window_size": 90,
                            "whitelist_token_ids": [128821, 128822],
                        },
                    }

                response = self.client.chat.completions.create(
                    model=self.model_name,
                    messages=messages,
                    temperature=self.temperature,
                    max_tokens=self.max_tokens,
                    extra_body=extra_body,
                )
                
                # Extract results
                for choice in response.choices:
                    text = choice.message.content
                    results.append(text)

            except Exception as e:
                logger.error(f"Inference error: {e}")
                raise

        return results

    def _save_output(self, img_path, text, model_name):
         out_name = (
            f"{Path(img_path).stem}_"
            f"{model_name.replace('/', '_')}_"
            f"{self.generate_hash()}.txt"
        )
         out_path = os.path.join(self.out_dir, out_name)
         with open(out_path, "w", encoding="utf-8") as f:
             f.write(text)
         logger.info(f"Saved local copy -> {out_path}")
