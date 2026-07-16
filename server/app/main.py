import logging
import os
from statistics import mean

from fastapi import Depends, FastAPI, Header, HTTPException, Path
from fastapi.middleware.cors import CORSMiddleware
from supabase import Client

from .dependencies import get_supabase
from .models import AttemptCreate, AttemptResponse, LessonResponse, ProgressResponse

logger = logging.getLogger("hangultype")

app = FastAPI(title="HangulType API")

origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_current_user_id(
    authorization: str = Header(...),
    db: Client = Depends(get_supabase),
) -> str:
    """Validate the Supabase JWT from the Authorization header and return the user id."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = authorization.removeprefix("Bearer ")

    try:
        response = db.auth.get_user(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    if not response or not response.user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return response.user.id


@app.get("/")
def health_check():
    return {"status": "ok", "message": "HangulType API is running"}


@app.get("/user/progress/{user_id}", response_model=ProgressResponse)
def get_user_progress(
    user_id: str = Path(min_length=36, max_length=36),
    current_user_id: str = Depends(get_current_user_id),
    db: Client = Depends(get_supabase),
):
    if user_id != current_user_id:
        raise HTTPException(status_code=403, detail="You can only view your own progress")

    try:
        # Only verified attempts count toward progress and averages
        response = db.table("attempts") \
            .select("lesson_id, wpm, accuracy") \
            .eq("user_id", user_id) \
            .eq("verified", True) \
            .execute()
    except Exception:
        logger.exception("Failed to fetch progress for user %s", user_id)
        raise HTTPException(status_code=500, detail="Failed to fetch progress")

    data = response.data

    # New user with 0 attempts
    if not data:
        return {
            "completed_lessons": [],
            "average_wpm": 0,
            "average_accuracy": 0,
        }

    completed_ids = list({item["lesson_id"] for item in data})

    # Filter out None values just in case data integrity is off
    wpm_values = [item["wpm"] for item in data if item.get("wpm") is not None]
    acc_values = [item["accuracy"] for item in data if item.get("accuracy") is not None]

    return {
        "completed_lessons": completed_ids,
        "average_wpm": round(mean(wpm_values), 1) if wpm_values else 0,
        "average_accuracy": round(mean(acc_values), 1) if acc_values else 0,
    }


@app.get("/lessons", response_model=list[LessonResponse])
def get_lessons(db: Client = Depends(get_supabase)):
    """Fetch all lessons from Supabase, sorted by their order."""
    try:
        response = db.table("lessons").select("*").order("order_index").execute()
        return response.data
    except Exception:
        logger.exception("Failed to fetch lessons")
        raise HTTPException(status_code=500, detail="Failed to fetch lessons")


@app.post("/attempts", response_model=AttemptResponse)
def record_attempt(
    attempt: AttemptCreate,
    user_id: str = Depends(get_current_user_id),
    db: Client = Depends(get_supabase),
):
    """Validate typing performance and save the attempt for the authenticated user."""
    data = {
        "user_id": user_id,
        "lesson_id": attempt.lesson_id,
        "wpm": attempt.wpm,
        "accuracy": round(attempt.accuracy, 2),
        "duration_seconds": round(attempt.duration_seconds, 2),
        "verified": attempt.verified,
    }

    try:
        response = db.table("attempts").insert(data).execute()
    except Exception:
        logger.exception("Failed to save attempt for user %s", user_id)
        raise HTTPException(status_code=500, detail="Failed to save attempt")

    return {"status": "success", "data": response.data[0]}
