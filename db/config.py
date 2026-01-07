import os
from dotenv import load_dotenv

load_dotenv(override=True)

class Config:
    DB_USER = os.getenv("DB_USER", "postgres")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "5432")
    DB_NAME = os.getenv("DB_NAME", "xf_ocr")

    DATABASE_URL = os.getenv("DATABASE_URL")
    if not DATABASE_URL:
        import urllib.parse
        encoded_user = urllib.parse.quote_plus(DB_USER)
        encoded_pass = urllib.parse.quote_plus(DB_PASSWORD)
        DATABASE_URL = f"postgresql://{encoded_user}:{encoded_pass}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

    _print_url = DATABASE_URL
    if ":" in DATABASE_URL and "@" in DATABASE_URL:
        _parts = DATABASE_URL.split("@")
        _left = _parts[0].split(":")
        if len(_left) > 2:
            _print_url = f"{_left[0]}:{_left[1]}:****@{_parts[1]}"
    print(f"DEBUG: Using Database URL: {_print_url}")

config = Config()
