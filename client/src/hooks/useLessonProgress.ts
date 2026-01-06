// src/hooks/useLessonProgress.ts
import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Lesson } from "@/types/lesson";
import { createClient } from "@/utils/supabase/client"; // Added to get user ID

export function useLessonProgress() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Data State
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Core lesson state
  const lessonParam = searchParams.get("lesson");
  const [currentLessonId, setCurrentLessonId] = useState(
    lessonParam || "1.1.1",
  );
  const [showLessonIntro, setShowLessonIntro] = useState(true);

  // 1. Cloud-based completion state (Initialized empty)
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  useEffect(() => {
    async function fetchLessons() {
      try {
        const res = await fetch(`${API_URL}/lessons`);
        const dbData = await res.json();
        const formatted = dbData.map((row: any) => ({
          id: row.id,
          title: row.title,
          description: row.description,
          phase: row.phase,
          unit: row.unit,
          lessonNumber: row.lesson_number,
          difficulty: row.difficulty,
          ...row.content_json,
        }));
        setLessons(formatted);
      } catch (err) {
        setError("Failed to load lessons");
      }
    }
    fetchLessons();
  }, []);

  // Effect 2: Fetch User Progress (The Cloud Sync)
  useEffect(() => {
    async function syncProgress() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        console.log("Syncing progress for user:", user.id);
        try {
          const res = await fetch(`${API_URL}/user/progress/${user.id}`);
          if (res.ok) {
            const data = await res.json();
            console.log("Cloud progress received:", data.completed_lessons);
            setCompletedLessons(data.completed_lessons);
          }
        } catch (err) {
          console.error("Cloud sync failed", err);
        } finally {
          setIsLoading(false); // Only stop loading after progress is synced
        }
      } else {
        setIsLoading(false);
      }
    }

    // Only try to sync progress once lessons are loaded
    if (lessons.length > 0) {
      syncProgress();
    }
  }, [lessons.length]); // Re-run when lessons array is populated

  // Derived: Current lesson object
  const currentLesson = useMemo(() => {
    return lessons.find((l) => l.id === currentLessonId) || lessons[0];
  }, [lessons, currentLessonId]);

  const markLessonComplete = (lessonId: string) => {
    if (!completedLessons.includes(lessonId)) {
      setCompletedLessons((prev) => [...prev, lessonId]);
    }
  };

  const resetLessonState = () => {
    setCurrentLineIndex(0);
    setShowLessonIntro(true);
  };

  const switchToLesson = (lessonId: string) => {
    setCurrentLessonId(lessonId);
    router.push(`/practice?lesson=${lessonId}`);
    resetLessonState();
  };

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

  const advanceToNextLine = () => {
    setCurrentLineIndex((prev) => prev + 1);
  };

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
