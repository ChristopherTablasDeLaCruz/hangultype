// src/hooks/usePerformanceTracking.ts
import { useState, useEffect, useMemo } from "react";
import { calculateAccuracy } from "@/utils/typing/accuracy";

export function usePerformanceTracking(
  currentLineTyped: string,
  currentLine: string,
  currentLineIndex: number,
  textLines: string[]
) {
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);

  // Start timing when user begins typing
  const startTiming = () => {
    if (startTime === null) {
      setStartTime(Date.now());
    }
  };

  // Reset for new lesson
  const resetTiming = () => {
    setStartTime(null);
    setWpm(0);
  };

  // Current line accuracy stats
  const lineStats = useMemo(
    () => calculateAccuracy(currentLineTyped, currentLine),
    [currentLineTyped, currentLine]
  );

  // How far through the lesson
  const overallProgress = useMemo(() => {
    const completedChars =
      textLines.slice(0, currentLineIndex).join(" ").length +
      currentLineTyped.length;
    const totalChars = textLines.join(" ").length;
    return Math.round((completedChars / totalChars) * 100);
  }, [currentLineIndex, textLines, currentLineTyped]);

  // WPM based on correct words only
  useEffect(() => {
    if (!startTime) return;

    const elapsedMinutes = (Date.now() - startTime) / 1000 / 60;
    const completedWords =
      textLines.slice(0, currentLineIndex).reduce((acc, line) => {
        return acc + line.split(/\s+/).length;
      }, 0) + lineStats.correctWords;

    const newWpm = Math.max(0, Math.round(completedWords / elapsedMinutes));
    setWpm(newWpm);
  }, [
    currentLineTyped,
    startTime,
    lineStats.correctWords,
    currentLineIndex,
    textLines,
  ]);

  return {
    // State
    wpm,
    accuracy: lineStats.accuracy,
    overallProgress,
    lineStats,

    // Actions
    startTiming,
    resetTiming,
  };
}
