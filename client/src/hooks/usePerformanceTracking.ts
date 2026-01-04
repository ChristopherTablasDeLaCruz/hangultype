// src/hooks/usePerformanceTracking.ts
import { useState, useCallback } from "react";
import { calculateWPM, calculateKeystrokeAccuracy } from "@/utils/typing/accuracy";
import { createClient } from "@/utils/supabase/client";

export function usePerformanceTracking() {
  // Telemetry State
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // 1. Start Timer (Idempotent: safe to call multiple times)
  const startTracking = useCallback(() => {
    setStartTime((prev) => prev ?? Date.now());
  }, []);

  // 2. End Timer
  const endTracking = useCallback(() => {
    setEndTime(Date.now());
  }, []);

  // 3. Track Inputs
  const incrementKeystrokes = useCallback(() => {
    setTotalKeystrokes((prev) => prev + 1);
  }, []);

  const incrementErrors = useCallback(() => {
    setErrorCount((prev) => prev + 1);
  }, []);

  // 4. Reset (for "Try Again")
  const resetTracking = useCallback(() => {
    setStartTime(null);
    setEndTime(null);
    setTotalKeystrokes(0);
    setErrorCount(0);
    setIsSubmitting(false);
  }, []);

  // 5. Submit to FastAPI Backend
  const submitAttempt = useCallback(async (lessonId: string) => {
    if (!startTime) return;
    
    // Use current time if endTracking wasn't triggered yet
    const finalEndTime = endTime || Date.now();
    setIsSubmitting(true);

    try {
      // Get User ID from Supabase
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.log("User not logged in, skipping submission.");
        return;
      }

      // Payload matching server/app/models.py
      const payload = {
        lesson_id: lessonId,
        user_id: user.id,
        start_time: startTime,
        end_time: finalEndTime,
        total_keystrokes: totalKeystrokes,
        error_count: errorCount
      };

      const res = await fetch(`${API_URL}/attempts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Submission failed");
      
      const result = await res.json();
      console.log("Attempt Saved:", result);

    } catch (e) {
      console.error("Error submitting attempt:", e);
    } finally {
      setIsSubmitting(false);
    }
  }, [startTime, endTime, totalKeystrokes, errorCount]);

  // 6. Live Stats Calculation (for UI)
  const getStats = useCallback((currentTextTyped: string) => {
    const now = endTime || Date.now();
    const durationMs = startTime ? now - startTime : 0;
    const durationMin = Math.max(durationMs / 60000, 0.001);

    // Calculate WPM based on characters typed so far
    const wpm = calculateWPM(currentTextTyped.length, durationMin);
    
    // Calculate Accuracy based on keystrokes
    const accuracy = calculateKeystrokeAccuracy(totalKeystrokes, errorCount);

    return { wpm, accuracy };
  }, [startTime, endTime, totalKeystrokes, errorCount]);

  return {
    // State
    startTime,
    totalKeystrokes,
    isSubmitting,
    
    // Actions
    startTracking,
    endTracking,
    resetTracking,
    incrementKeystrokes,
    incrementErrors,
    submitAttempt,
    
    // Derived
    getStats
  };
}