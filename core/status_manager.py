from threading import Lock

class StatusManager:
    _instance = None
    _lock = Lock()
    
    def __init__(self):
        self.loading_status = {
            "is_loading": False,
            "model_id": None,
            "progress": 0, # 0-100
            "message": "Idle"
        }
        self.current_model = None

    @classmethod
    def get_instance(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = StatusManager()
        return cls._instance

    def set_loading(self, is_loading: bool, model_id: str = None, message: str = None):
        with self._lock:
            self.loading_status["is_loading"] = is_loading
            if model_id:
                self.loading_status["model_id"] = model_id
            if message:
                self.loading_status["message"] = message
            
            if not is_loading and model_id and "error" not in (message or "").lower():
                self.current_model = model_id

    def get_status(self):
        with self._lock:
            return {
                "loading": self.loading_status.copy(),
                "active_model": self.current_model
            }

status_manager = StatusManager.get_instance()
