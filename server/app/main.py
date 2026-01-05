from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import Client
from statistics import mean 
from .dependencies import get_supabase
from .models import AttemptCreate

app = FastAPI(title="HangulType API")

origins = [
    "*"
]
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

@app.get("/user/progress/{user_id}")
def get_user_progress(user_id: str, db: Client = Depends(get_supabase)):
    try:
        print(f"Fetching full stats for user: {user_id}")
        
        # Fetch ALL relevant columns (lesson_id, wpm, accuracy)
        # We need wpm and accuracy to calculate the means
        response = db.table("attempts") \
            .select("lesson_id, wpm, accuracy") \
            .eq("user_id", user_id) \
            .execute()
        
        data = response.data

        # Handle empty state (New user with 0 attempts)
        if not data:
            return {
                "completed_lessons": [],
                "average_wpm": 0,
                "average_accuracy": 0
            }
        
        # Aggregations
        completed_ids = list({item['lesson_id'] for item in data})
        
        # Filter out None values just in case data integrity is off
        wpm_values = [item['wpm'] for item in data if item.get('wpm') is not None]
        acc_values = [item['accuracy'] for item in data if item.get('accuracy') is not None]

        # Calculate means
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

@app.get("/lessons")
def get_lessons(db: Client = Depends(get_supabase)):
    """
    Fetch all lessons from Supabase, sorted by their order.
    """
    try:
        response = db.table("lessons").select("*").order("order_index").execute()
        return response.data
    except Exception as e:
        print(f"Error fetching lessons: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/attempts")
def record_attempt(attempt: AttemptCreate, db: Client = Depends(get_supabase)):
    """
    Validates typing performance and saves the attempt to Supabase.
    """
    # 1. Calculate Duration
    duration_ms = attempt.end_time - attempt.start_time
    duration_seconds = duration_ms / 1000.0
    
    if duration_seconds <= 0:
        raise HTTPException(status_code=400, detail="Invalid duration")

    # 2. Server-side WPM Calculation
    minutes = duration_seconds / 60.0
    wpm = int((attempt.total_keystrokes / 5.0) / minutes)

    # 3. Accuracy Calculation
    if attempt.total_keystrokes > 0:
        accuracy = max(0, (attempt.total_keystrokes - attempt.error_count) / attempt.total_keystrokes) * 100
    else:
        accuracy = 0

    # 4. Anti-Cheat Heuristic
    verified = wpm < 250

    # 5. Save to Supabase
    try:
        data = {
            "user_id": attempt.user_id,
            "lesson_id": attempt.lesson_id,
            "wpm": wpm,
            "accuracy": round(accuracy, 2),
            "duration_seconds": round(duration_seconds, 2),
            "verified": verified
        }
        
        response = db.table("attempts").insert(data).execute()
        return {"status": "success", "data": response.data[0]}
        
    except Exception as e:
        print(f"Error saving attempt: {e}")
        raise HTTPException(status_code=500, detail="Failed to save attempt")