from pydantic import BaseModel, Field, field_validator
from typing import Optional, Annotated


class AttemptCreate(BaseModel):
    lesson_id: str
    user_id: str
    start_time: Annotated[float, Field(gt=0, description="Unix timestamp in milliseconds when typing began")]
    end_time: Annotated[float, Field(gt=0, description="Unix timestamp in milliseconds when typing finished")]
    total_keystrokes: Annotated[int, Field(gt=0, description="Total number of keys pressed (excluding Shift/Tab)")]
    error_count: Annotated[int, Field(ge=0, description="Number of backspaces (used as error metric)")]

    @field_validator("end_time")
    @classmethod
    def validate_end_time(cls, v, info):
        if "start_time" in info.data and v <= info.data["start_time"]:
            raise ValueError("end_time must be greater than start_time")
        return v

    @property
    def duration_seconds(self) -> float:
        duration_ms = self.end_time - self.start_time
        return duration_ms / 1000.0

    @property
    def wpm(self) -> int:
        minutes = self.duration_seconds / 60.0
        return int((self.total_keystrokes / 5.0) / minutes)

    @property
    def accuracy(self) -> float:
        if self.total_keystrokes > 0:
            return max(0, (self.total_keystrokes - self.error_count) / self.total_keystrokes) * 100
        return 0

    @property
    def verified(self) -> bool:
        # World record is ~216 WPM, so 250+ is likely cheating
        return self.wpm < 250

class ProgressResponse(BaseModel):
    completed_lessons: list[str]
    average_wpm: Annotated[float, Field(ge=0, description="Average words per minute across all attempts")]
    average_accuracy: Annotated[float, Field(ge=0, le=100)]

class LessonResponse(BaseModel):
    id: str
    title: str
    description: str
    phase: str
    unit: Annotated[int, Field(gt=0)]
    lesson_number: Annotated[int, Field(gt=0)]
    difficulty: Annotated[int, Field(ge=1, le=5)]  # 1=easiest, 5=hardest
    order_index: Annotated[int, Field(ge=0)]
    content_json: dict

class AttemptResponse(BaseModel):
    status: str
    data: dict