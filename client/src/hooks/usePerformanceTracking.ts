import { useState, useCallback } from "react";
import {
  calculateWPM,
  calculateKeystrokeAccuracy,
} from "@/utils/typing/accuracy";
import { useAuth } from "@/context/AuthContext";

export function usePerformanceTracking() {
  const { user } = useAuth();

  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Nullish coalescing ensures timer only starts once
  const startTracking = useCallback(() => {
    setStartTime((prev) => prev ?? Date.now());
  }, []);

  const endTracking = useCallback(() => {
    setEndTime(Date.now());
  }, []);

  const incrementKeystrokes = useCallback(() => {
    setTotalKeystrokes((prev) => prev + 1);
  }, []);

  const incrementErrors = useCallback(() => {
    setErrorCount((prev) => prev + 1);
  }, []);

  const resetTracking = useCallback(() => {
    setStartTime(null);
    setEndTime(null);
    setTotalKeystrokes(0);
    setErrorCount(0);
    setIsSubmitting(false);
  }, []);

  const submitAttempt = useCallback(
    async (lessonId: string) => {
      if (!startTime) return;

      const finalEndTime = endTime || Date.now();
      setIsSubmitting(true);

      try {
        if (!user) {
          console.log(
            "Guest mode: Performance not saved. Sign up to track progress!",
          );
          setIsSubmitting(false);
          return;
        }

        const payload = {
          lesson_id: lessonId,
          user_id: user.id,
          start_time: startTime,
          end_time: finalEndTime,
          total_keystrokes: totalKeystrokes,
          error_count: errorCount,
        };

        const res = await fetch(`${API_URL}/attempts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Submission failed");

        const result = await res.json();
        console.log("✅ Attempt Saved:", result);
      } catch (e) {
        console.error("❌ Error submitting attempt:", e);
      } finally {
        setIsSubmitting(false);
      }
    },
    [startTime, endTime, totalKeystrokes, errorCount, user],
  );

  const getStats = useCallback(
    (currentTextTyped: string) => {
      const now = endTime || Date.now();
      const durationMs = startTime ? now - startTime : 0;
      const durationMin = Math.max(durationMs / 60000, 0.001);

      const wpm = calculateWPM(totalKeystrokes, durationMin);
      const accuracy = calculateKeystrokeAccuracy(totalKeystrokes, errorCount);

      return { wpm, accuracy };
    },
    [startTime, endTime, totalKeystrokes, errorCount],
  );

  return {
    startTime,
    totalKeystrokes,
    isSubmitting,
    startTracking,
    endTracking,
    resetTracking,
    incrementKeystrokes,
    incrementErrors,
    submitAttempt,
    getStats,
  };
}
