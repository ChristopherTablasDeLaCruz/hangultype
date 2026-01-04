// src/app/practice/components/LessonSelector.tsx
// Grid of all lessons with progress tracking
"use client";

import { ALL_LESSONS } from "@/data/lessons";

interface LessonSelectorProps {
  currentLessonId: string;
  onLessonSelect: (lessonId: string) => void;
  completedLessons: string[];
}

export function LessonSelector({
  currentLessonId,
  onLessonSelect,
  completedLessons,
}: LessonSelectorProps) {
  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1:
        return "bg-green-100 text-green-800";
      case 2:
        return "bg-blue-100 text-blue-800";
      case 3:
        return "bg-yellow-100 text-yellow-800";
      case 4:
        return "bg-orange-100 text-orange-800";
      case 5:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDifficultyLabel = (difficulty: number) => {
    switch (difficulty) {
      case 1:
        return "Beginner";
      case 2:
        return "Easy";
      case 3:
        return "Medium";
      case 4:
        return "Hard";
      case 5:
        return "Expert";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-900">
          Choose Any Lesson
        </h2>
        <div className="text-sm text-gray-600">
          {completedLessons.length} of {ALL_LESSONS.length} completed
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {ALL_LESSONS.map((lesson) => {
          const isCompleted = completedLessons.includes(lesson.id);
          const isCurrent = currentLessonId === lesson.id;

          return (
            <button
              key={lesson.id}
              onClick={() => onLessonSelect(lesson.id)}
              className={`p-3 rounded-lg border text-left transition-all ${
                isCurrent
                  ? "border-blue-500 bg-blue-50 text-blue-900"
                  : isCompleted
                  ? "border-green-500 bg-green-50 text-green-900 hover:bg-green-100"
                  : "border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-medium">
                  {lesson.id}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                      lesson.difficulty
                    )}`}
                  >
                    {getDifficultyLabel(lesson.difficulty)}
                  </span>
                  <div className="flex items-center gap-1">
                    {isCompleted && (
                      <span className="text-green-600 text-sm">✓</span>
                    )}
                    {isCurrent && (
                      <span className="text-blue-600 text-sm">▶</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-sm font-medium mb-1">{lesson.title}</div>
              <div className="text-xs text-gray-600 mb-2">
                {lesson.description}
              </div>

              {/* Only show focus keys for foundation lessons where they're helpful */}
              {lesson.phase === "foundation" && (
                <div className="text-xs">
                  <span className="font-mono text-gray-500">
                    Focus: {lesson.focusKeys.slice(0, 4).join(" ")}
                    {lesson.focusKeys.length > 4 && "..."}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
