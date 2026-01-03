import logging
import os
import sys
from logging.handlers import RotatingFileHandler
from typing import Optional

def setup_logger(
    name: str = "app",
    log_dir: str = "logs",
    level: int = logging.INFO,
    max_bytes: int = 10 * 1024 * 1024,  # 10 MB per file
    backup_count: int = 5
) -> logging.Logger:
    """
    Sets up a production-grade logger with console and file handlers.
    
    Features:
    - distinct log files for general logs and separate error logs.
    - RotatingFileHandler to manage disk usage.
    - Console output for real-time monitoring.
    
    Args:
        name: Name of the logger.
        log_dir: Directory to store log files.
        level: Logging level (default: logging.INFO).
        max_bytes: Max size of a log file before rotation.
        backup_count: Number of backup log files to keep.
        
    Returns:
        Configured logging.Logger instance.
    """
    logger = logging.getLogger(name)
    logger.setLevel(level)
    
    # Prevent adding handlers multiple times if function is called repeatedly
    if logger.hasHandlers():
        return logger

    # Formatter
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )

    # Ensure log directory exists
    try:
        os.makedirs(log_dir, exist_ok=True)
    except OSError as e:
        print(f"CRITICAL: Failed to create log directory {log_dir}: {e}", file=sys.stderr)
        return logger

    # 1. Console Handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    console_handler.setLevel(level)
    logger.addHandler(console_handler)

    # 2. General File Handler (Rotating)
    app_log_path = os.path.join(log_dir, f"{name}.log")
    file_handler = RotatingFileHandler(
        app_log_path, maxBytes=max_bytes, backupCount=backup_count, encoding='utf-8'
    )
    file_handler.setFormatter(formatter)
    file_handler.setLevel(level)
    logger.addHandler(file_handler)

    # 3. Error File Handler (Separate errors for easier debugging)
    error_log_path = os.path.join(log_dir, f"{name}_error.log")
    error_handler = RotatingFileHandler(
        error_log_path, maxBytes=max_bytes, backupCount=backup_count, encoding='utf-8'
    )
    error_handler.setFormatter(formatter)
    error_handler.setLevel(logging.ERROR)
    logger.addHandler(error_handler)

    return logger