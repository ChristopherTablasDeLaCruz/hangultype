// src/components/practice/LessonIntro.tsx
// Lesson introduction modal component
import { Lesson } from "@/types/lesson";

interface LessonIntroProps {
  lesson: Lesson;
  currentLineIndex: number;
  totalLines: number;
  onStart: () => void;
  isVisible: boolean;
}

export function LessonIntro({
  lesson,
  currentLineIndex,
  totalLines,
  onStart,
  isVisible,
}: LessonIntroProps) {
  if (!isVisible) return null;

  // Only show focus keys for foundation lessons where they're learning individual characters
  const shouldShowFocusKeys = lesson.phase === "foundation";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Lesson {lesson.lessonNumber}: {lesson.title}
          </h2>
          <div className="text-sm text-gray-500 mb-4">
            {lesson.phase.charAt(0).toUpperCase() + lesson.phase.slice(1)} •
            Difficulty: {lesson.difficulty}/5 • Line {currentLineIndex + 1} of{" "}
            {totalLines}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Instructions:
          </h3>
          <p className="text-gray-700 leading-relaxed">{lesson.instructions}</p>
        </div>

        {shouldShowFocusKeys && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Focus Keys:
            </h3>
            <div className="flex flex-wrap gap-2">
              {lesson.focusKeys.map((key, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg font-mono text-lg"
                >
                  {key}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={onStart}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium text-lg
                     hover:bg-blue-700 transition-colors shadow-sm"
          >
            Start Typing
          </button>
        </div>
      </div>
    </div>
  );
}
