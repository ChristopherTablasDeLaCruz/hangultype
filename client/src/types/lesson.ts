// src/types/lesson.ts
// Lesson and progress tracking types

export interface Lesson {
  id: string;
  title: string;
  description: string;
  phase: "foundation" | "syllables" | "words" | "sentences" | "advanced";
  unit: number;
  lessonNumber: number;

  // What the user will practice
  targetText: string;
  instructions: string;

  // Keys featured in this lesson
  focusKeys: string[]; // New keys being learned
  reviewKeys?: string[]; // Previously learned keys to reinforce

  // How challenging this lesson is
  difficulty: 1 | 2 | 3 | 4 | 5;
}

export interface LessonAttempt {
  timestamp: Date;
  wpm: number;
  accuracy: number;
  completionTime: number; // How long it took in seconds
}

export interface LessonProgress {
  lessonId: string;
  attempts: LessonAttempt[];
  completed: boolean;
  lastAttempt?: Date;
}

export interface UserProgress {
  completedLessons: string[];
  lessonProgress: Record<string, LessonProgress>;
  overallStats: {
    totalPracticeTime: number;
    averageWpm: number;
    averageAccuracy: number;
  };
}
