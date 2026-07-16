import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Lesson } from "@/types/lesson";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export function useLessonProgress() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const lessonParam = searchParams.get("lesson");
  const [currentLessonId, setCurrentLessonId] = useState(
    lessonParam || "1.1.1",
  );
  const [showLessonIntro, setShowLessonIntro] = useState(true);

  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  useEffect(() => {
    api
      .getLessons()
      .then(setLessons)
      .catch(() => setError("Failed to load lessons"));
  }, []);

  useEffect(() => {
    async function syncProgress() {
      if (user) {
        try {
          const data = await api.getProgress(user.id);
          setCompletedLessons(data.completed_lessons);
        } catch (err) {
          console.error("Cloud sync failed", err);
        } finally {
          setIsLoading(false);
        }
      } else {
        // Guest mode: progress is not saved
        setIsLoading(false);
      }
    }

    if (lessons.length > 0) {
      syncProgress();
    }
  }, [lessons.length, user]);

  const currentLesson = useMemo(() => {
    return lessons.find((l) => l.id === currentLessonId) || lessons[0];
  }, [lessons, currentLessonId]);

  const markLessonComplete = useCallback((lessonId: string) => {
    setCompletedLessons((prev) =>
      prev.includes(lessonId) ? prev : [...prev, lessonId],
    );
  }, []);

  const resetLessonState = useCallback(() => {
    setCurrentLineIndex(0);
    setShowLessonIntro(true);
  }, []);

  const switchToLesson = useCallback(
    (lessonId: string) => {
      setCurrentLessonId(lessonId);
      router.push(`/practice?lesson=${lessonId}`);
      resetLessonState();
    },
    [router, resetLessonState],
  );

  const handleNextLesson = () => {
    const currentIndex = lessons.findIndex((l) => l.id === currentLessonId);
    const nextLesson = lessons[currentIndex + 1];
    if (nextLesson) {
      switchToLesson(nextLesson.id);
    } else {
      resetLessonState();
    }
  };

  const startTyping = () => {
    setShowLessonIntro(false);
  };

  const hasNextLesson = () => {
    const currentIndex = lessons.findIndex((l) => l.id === currentLessonId);
    return currentIndex < lessons.length - 1;
  };

  const advanceToNextLine = useCallback(() => {
    setCurrentLineIndex((prev) => prev + 1);
  }, []);

  return {
    isLoading,
    error,
    lessons,
    currentLessonId,
    currentLesson,
    showLessonIntro,
    completedLessons,
    currentLineIndex,
    hasNextLesson: hasNextLesson(),
    switchToLesson,
    resetLessonState,
    handleNextLesson,
    startTyping,
    markLessonComplete,
    advanceToNextLine,
    setCurrentLineIndex,
  };
}
