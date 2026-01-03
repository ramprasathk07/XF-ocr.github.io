import subprocess
import signal
import sys
import os
import time
parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)
from logger import setup_logger

# ---------------- CONFIG ----------------
PID_FILE = "vllm_server.pid"

# ---------------- LOGGER ----------------
logger = setup_logger(name="vLLM-START", log_dir="./logs")

# ---------------- UTILS ----------------
def stop_existing_server():
    if not os.path.exists(PID_FILE):
        return

    try:
        with open(PID_FILE, "r") as f:
            pid = int(f.read().strip())

        logger.info(f"🛑 Stopping existing vLLM server (PID={pid})")
        os.kill(pid, signal.SIGINT)

        # wait a bit for clean shutdown
        time.sleep(3)

    except ProcessLookupError:
        logger.warning("⚠️ Old PID not running")
    except Exception as e:
        logger.error(f"❌ Failed to stop old server: {e}")

    finally:
        try:
            os.remove(PID_FILE)
        except OSError:
            pass


def build_command(model_name: str):
    if model_name == "deepseek-ai/DeepSeek-OCR":
        VLLM_BIN = "/home/kanram/env_paddle/vllm_env/bin/vllm"
        return [
            "vllm", "serve",
            model_name,
            "--logits_processors",
            "vllm.model_executor.models.deepseek_ocr:NGramPerReqLogitsProcessor",
            "--no-enable-prefix-caching",
            "--mm-processor-cache-gb", "0",
        ]

    elif model_name == "PaddlePaddle/PaddleOCR-VL":
        VLLM_BIN = "/home/kanram/env_paddle/vllm_env/bin/vllm"
        return [
            "vllm", "serve",
            model_name,
            "--trust-remote-code",
            "--gpu-memory-utilization", "0.9",
            "--port", "8000",
            "--no-enable-prefix-caching",
            "--mm-processor-cache-gb", "0",
            "--max-num-batched-tokens", "16384"
        ]

    elif model_name == "tencent/HunyuanOCR":
        VLLM_BIN = "/home/kanram/env_pytorch/vllm_env/bin/vllm"
        return [
            "vllm", "serve",
            model_name,
            "--trust-remote-code",
            "--dtype", "float16",
            "--gpu-memory-utilization", "0.9",
            "--enforce-eager",
            "--port", "8000",
        ]
    
    else:
        logger.error(f"❌ Unsupported model: {model_name}")
        raise ValueError(f"Unsupported model: {model_name}")

# ---------------- START SERVER ----------------
def start(model_name: str):
    process = None
    try:
        stop_existing_server()

        cmd = build_command(model_name)

        logger.info(f"🚀 Starting vLLM server with model: {model_name}")
        logger.info("Command: " + " ".join(cmd))

        process = subprocess.Popen(
            cmd,
            stdout=sys.stdout,
            stderr=sys.stderr,
            text=True,
        )

        with open(PID_FILE, "w") as f:
            f.write(str(process.pid))

        logger.info(f"✅ vLLM started (PID={process.pid})")
    except Exception as e:
        logger.error(f"❌ Failed to start vLLM server: {e}")
        # If build_command failed, process is still None.
        # We might want to raise here or return None.
    
    return process

# ---------------- MAIN ----------------
if __name__ == "__main__":
    model = sys.argv[1] if len(sys.argv) > 1 else "deepseek-ai/DeepSeek-OCR"

    proc = start_vllm(model)

    try:
        proc.wait()
    except KeyboardInterrupt:
        logger.info("🛑 Ctrl+C received, stopping server")
        stop_existing_server()
        logger.info("✅ Server stopped cleanly")
