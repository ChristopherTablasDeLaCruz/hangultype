from fastapi import FastAPI, Depends, HTTPException, Path
from fastapi.middleware.cors import CORSMiddleware
from supabase import Client
from statistics import mean
import os
from .dependencies import get_supabase
from .models import AttemptCreate, ProgressResponse, LessonResponse, AttemptResponse

app = FastAPI(title="HangulType API")

origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health_check():
    return {"status": "ok", "message": "HangulType API is running"}

@app.get("/user/progress/{user_id}", response_model=ProgressResponse)
def get_user_progress(
    user_id: str = Path(min_length=36, max_length=36),
    db: Client = Depends(get_supabase)
):
    try:
        print(f"Fetching full stats for user: {user_id}")

        response = db.table("attempts") \
            .select("lesson_id, wpm, accuracy") \
            .eq("user_id", user_id) \
            .execute()

        data = response.data

        if not data:
            return {
                "completed_lessons": [],
                "average_wpm": 0,
                "average_accuracy": 0
            }

        completed_ids = list({item['lesson_id'] for item in data})

        wpm_values = [item['wpm'] for item in data if item.get('wpm') is not None]
        acc_values = [item['accuracy'] for item in data if item.get('accuracy') is not None]

        avg_wpm = round(mean(wpm_values), 1) if wpm_values else 0
        avg_acc = round(mean(acc_values), 1) if acc_values else 0

        return {
            "completed_lessons": completed_ids,
            "average_wpm": avg_wpm,
            "average_accuracy": avg_acc
        }

    except Exception as e:
        print(f"Backend Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/lessons", response_model=list[LessonResponse])
def get_lessons(db: Client = Depends(get_supabase)):
    try:
        response = db.table("lessons").select("*").order("order_index").execute()
        return response.data
    except Exception as e:
        print(f"Error fetching lessons: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/attempts", response_model=AttemptResponse)
def record_attempt(attempt: AttemptCreate, db: Client = Depends(get_supabase)):
    try:
        data = {
            "user_id": attempt.user_id,
            "lesson_id": attempt.lesson_id,
            "wpm": attempt.wpm,
            "accuracy": round(attempt.accuracy, 2),
            "duration_seconds": round(attempt.duration_seconds, 2),
            "verified": attempt.verified
        }

        response = db.table("attempts").insert(data).execute()
        return {"status": "success", "data": response.data[0]}

    except Exception as e:
        print(f"Error saving attempt: {e}")
        raise HTTPException(status_code=500, detail="Failed to save attempt")