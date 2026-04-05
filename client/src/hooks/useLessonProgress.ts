import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Lesson, DBLesson } from "@/types/lesson";
import { useAuth } from "@/context/AuthContext";

export function useLessonProgress() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
    async function fetchLessons() {
      try {
        const res = await fetch(`${API_URL}/lessons`);
        const dbData = await res.json();
        const formatted: Lesson[] = dbData.map((row: DBLesson) => ({
          id: row.id,
          title: row.title,
          description: row.description,
          phase: row.phase as Lesson["phase"],
          unit: row.unit,
          lessonNumber: row.lesson_number,
          difficulty: row.difficulty as Lesson["difficulty"],
          ...row.content_json,
        }));
        setLessons(formatted);
      } catch (err) {
        setError("Failed to load lessons");
      }
    }
    fetchLessons();
  }, []);

  useEffect(() => {
    async function syncProgress() {
      if (user) {
        console.log("🔄 Syncing progress for user:", user.id);
        try {
          const res = await fetch(`${API_URL}/user/progress/${user.id}`);
          if (res.ok) {
            const data = await res.json();
            console.log("✅ Cloud progress received:", data.completed_lessons);
            setCompletedLessons(data.completed_lessons);
          }
        } catch (err) {
          console.error("❌ Cloud sync failed", err);
        } finally {
          setIsLoading(false);
        }
      } else {
        console.log("👤 Guest mode: Progress will not be saved");
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
