import { useState, useCallback } from "react";
import {
  calculateWPM,
  calculateKeystrokeAccuracy,
} from "@/utils/typing/accuracy";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export function usePerformanceTracking() {
  const { user } = useAuth();

  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [errorCount, setErrorCount] = useState(0);

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
  }, []);

  const submitAttempt = useCallback(
    async (lessonId: string) => {
      // Guests practice freely; nothing to save
      if (!startTime || !user) return;

      try {
        await api.submitAttempt({
          lesson_id: lessonId,
          start_time: startTime,
          end_time: endTime || Date.now(),
          total_keystrokes: totalKeystrokes,
          error_count: errorCount,
        });
      } catch (e) {
        console.error("Error submitting attempt:", e);
      }
    },
    [startTime, endTime, totalKeystrokes, errorCount, user],
  );

  const getStats = useCallback(() => {
    const now = endTime || Date.now();
    const durationMs = startTime ? now - startTime : 0;
    const durationMin = Math.max(durationMs / 60000, 0.001);

    const wpm = calculateWPM(totalKeystrokes, durationMin);
    const accuracy = calculateKeystrokeAccuracy(totalKeystrokes, errorCount);

    return { wpm, accuracy };
  }, [startTime, endTime, totalKeystrokes, errorCount]);

  return {
    startTracking,
    endTracking,
    resetTracking,
    incrementKeystrokes,
    incrementErrors,
    submitAttempt,
    getStats,
  };
}
