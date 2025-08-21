// src/hooks/useLessonProgress.ts
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ALL_LESSONS } from "@/data/lessons";

export function useLessonProgress() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get lesson from URL or default to first one
  const lessonParam = searchParams.get("lesson");
  const initialLessonId =
    lessonParam && ALL_LESSONS.find((l) => l.id === lessonParam)
      ? lessonParam
      : "1.1.1";

  // Core lesson state
  const [currentLessonId, setCurrentLessonId] = useState(initialLessonId);
  const [showLessonIntro, setShowLessonIntro] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("korean-typing-completed");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Line progression state
  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  // Update lesson when URL changes
  useEffect(() => {
    if (lessonParam && ALL_LESSONS.find((l) => l.id === lessonParam)) {
      setCurrentLessonId(lessonParam);
    }
  }, [lessonParam]);

  // Save progress to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "korean-typing-completed",
        JSON.stringify(completedLessons)
      );
    }
  }, [completedLessons]);

  // Get current lesson
  const currentLesson =
    ALL_LESSONS.find((l) => l.id === currentLessonId) || ALL_LESSONS[0];

  // Mark lesson as complete
  const markLessonComplete = (lessonId: string) => {
    if (!completedLessons.includes(lessonId)) {
      setCompletedLessons((prev) => [...prev, lessonId]);
    }
  };

  // Switch to a different lesson
  const switchToLesson = (lessonId: string) => {
    setCurrentLessonId(lessonId);
    router.push(`/practice?lesson=${lessonId}`);
    resetLessonState();
  };

  const resetLessonState = () => {
    setCurrentLineIndex(0);
    setShowLessonIntro(true);
  };

  const handleNextLesson = () => {
    const currentIndex = ALL_LESSONS.findIndex((l) => l.id === currentLessonId);
    const nextLesson = ALL_LESSONS[currentIndex + 1];

    if (nextLesson) {
      switchToLesson(nextLesson.id);
    } else {
      // No next lesson, restart current one
      resetLessonState();
    }
  };

  const startTyping = () => {
    setShowLessonIntro(false);
  };

  // Check if there's a next lesson available
  const hasNextLesson = () => {
    const currentIndex = ALL_LESSONS.findIndex((l) => l.id === currentLessonId);
    return currentIndex < ALL_LESSONS.length - 1;
  };

  // Move to next line
  const advanceToNextLine = () => {
    setCurrentLineIndex((prev) => prev + 1);
  };

  return {
    // State
    currentLessonId,
    currentLesson,
    showLessonIntro,
    completedLessons,
    currentLineIndex,

    // Computed
    hasNextLesson: hasNextLesson(),

    // Actions
    switchToLesson,
    resetLessonState,
    handleNextLesson,
    startTyping,
    markLessonComplete,
    advanceToNextLine,
    setCurrentLineIndex,
  };
}
