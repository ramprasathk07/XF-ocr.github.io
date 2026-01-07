
import subprocess
import signal
import sys
import os
import time
import httpx

# ---------------- PATH SETUP ----------------
parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from misc.logger import setup_logger

# ---------------- CONFIG ----------------
PID_FILE = "vllm_server.pid"
VLLM_PORT = 8001
VLLM_HOST = "127.0.0.1"

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

        # Give vLLM time to shutdown cleanly
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


def wait_for_vllm(timeout: int = 120):
    """Wait until vLLM OpenAI-compatible API is ready"""
    url = f"http://{VLLM_HOST}:{VLLM_PORT}/v1/models"
    start = time.time()

    logger.info("⏳ Waiting for vLLM to become ready...")

    while time.time() - start < timeout:
        try:
            r = httpx.get(url, timeout=2)
            if r.status_code == 200:
                logger.info("✅ vLLM is ready to accept requests")
                return
        except Exception:
            pass
        time.sleep(1)

    raise RuntimeError("❌ vLLM did not become ready within timeout")


def build_command(model_name: str):
    if model_name == "deepseek-ai/DeepSeek-OCR":
        return [
            "vllm", "serve",
            model_name,
            "--logits_processors",
            "vllm.model_executor.models.deepseek_ocr:NGramPerReqLogitsProcessor",
            "--no-enable-prefix-caching",
            "--mm-processor-cache-gb", "0",
            "--port", str(VLLM_PORT),
        ]

    elif model_name == "PaddlePaddle/PaddleOCR-VL":
        return [
            "vllm", "serve",
            model_name,
            "--trust-remote-code",
            "--gpu-memory-utilization", "0.9",
            "--no-enable-prefix-caching",
            "--mm-processor-cache-gb", "0",
            "--max-num-batched-tokens", "16384",
            "--port", str(VLLM_PORT),
        ]

    elif model_name == "tencent/HunyuanOCR":
        return [
            "vllm", "serve",
            model_name,
            "--trust-remote-code",
            "--dtype", "float16",
            "--gpu-memory-utilization", "0.9",
            "--enforce-eager",
            "--port", str(VLLM_PORT),
        ]

    else:
        raise ValueError(f"❌ Unsupported model: {model_name}")


# ---------------- START SERVER ----------------
def start(model_name: str):
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

    # 🔥 CRITICAL FIX: wait until server is actually ready
    wait_for_vllm()

    logger.info(f"✅ vLLM fully initialized (PID={process.pid})")
    return process


# ---------------- MAIN ----------------
if __name__ == "__main__":
    model = sys.argv[1] if len(sys.argv) > 1 else "xf3-pro"

    proc = start(model)

    try:
        proc.wait()
    except KeyboardInterrupt:
        logger.info("🛑 Ctrl+C received, stopping server")
        stop_existing_server()
        logger.info("✅ Server stopped cleanly")
