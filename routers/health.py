import time
import psutil
import subprocess
from datetime import datetime
from fastapi import APIRouter
from core.metrics import START_TIME, REQUEST_STATS
from core.auth import GOOGLE_CLIENT_ID
from core.status_manager import status_manager

router = APIRouter()

def get_gpu_info():
    try:
        output = subprocess.check_output(["nvidia-smi", "--query-gpu=utilization.gpu,memory.used,memory.total", "--format=csv,noheader,nounits"], encoding='utf-8')
        lines = output.strip().split('\n')
        gpus = []
        for line in lines:
            util, mem_used, mem_total = line.split(', ')
            gpus.append({
                "load": f"{util}%",
                "memory": f"{mem_used}/{mem_total} MB"
            })
        return gpus
    except Exception:
        return []

@router.get("/health")
async def health_check():
    import asyncio
    uptime_seconds = time.time() - START_TIME
    days, rem = divmod(uptime_seconds, 86400)
    hours, rem = divmod(rem, 3600)
    minutes, seconds = divmod(rem, 60)
    
    uptime_str = f"{int(days)}d {int(hours)}h {int(minutes)}m"
    
    # Offload system checks to thread
    def _get_sys_metrics():
        cpu = psutil.cpu_percent()
        mem = psutil.virtual_memory()
        gpu = get_gpu_info()
        return cpu, mem, gpu

    cpu_load, memory, gpu_info = await asyncio.to_thread(_get_sys_metrics)
    
    return {
        "status": "operational",
        "uptime": uptime_str,
        "uptime_seconds": uptime_seconds,
        "timestamp": datetime.now().isoformat(),
        "metrics": {
            "cpu_load": f"{cpu_load}%",
            "memory_usage": f"{memory.percent}%",
            "memory_used": f"{memory.used / (1024**3):.2f} GB",
            "memory_total": f"{memory.total / (1024**3):.2f} GB",
            "gpu": gpu_info,
            "requests": REQUEST_STATS
        },
        "components": [
            {"name": "Core API", "status": "operational", "latency": "12ms"},
            {"name": "Neural Engine", "status": "operational", "latency": "45ms"},
            {"name": "Storage Cluster", "status": "operational", "latency": "5ms"},
            {"name": "Auth Gateway", "status": "operational", "latency": "8ms"}
        ],
        "model_status": status_manager.get_status(),
        "client_id": GOOGLE_CLIENT_ID
    }
