from pydantic import BaseModel
from typing import Optional

class AttemptCreate(BaseModel):
    lesson_id: str
    user_id: str
    start_time: float  # Unix timestamp (milliseconds)
    end_time: float    # Unix timestamp (milliseconds)
    total_keystrokes: int
    error_count: int