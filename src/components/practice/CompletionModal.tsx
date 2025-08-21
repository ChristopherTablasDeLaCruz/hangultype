// src/components/practice/CompletionModal.tsx
// Celebration banner when user finishes a lesson
interface CompletionModalProps {
  isVisible: boolean;
  wpm: number;
  accuracy: number;
  onTryAgain: () => void;
  onNextLesson: () => void;
  hasNextLesson: boolean;
}

export function CompletionModal({
  isVisible,
  wpm,
  accuracy,
  onTryAgain,
  onNextLesson,
  hasNextLesson,
}: CompletionModalProps) {
  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-x-4 top-16 
                  bg-gradient-to-r from-green-400 to-blue-500 text-white 
                  p-4 rounded-lg text-center shadow-lg z-10 max-w-4xl mx-auto
                  border border-white/20"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1 text-center sm:text-left">
          <div className="text-lg font-bold mb-1">🎉 Lesson Complete!</div>
          <div className="text-sm opacity-90">
            You achieved {wpm} WPM with {accuracy}% accuracy
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onTryAgain}
            className="px-4 py-2 bg-white/20 text-white rounded-lg text-sm font-medium
                     hover:bg-white/30 transition-colors border border-white/30"
          >
            Try Again
          </button>

          {hasNextLesson && (
            <button
              onClick={onNextLesson}
              className="px-4 py-2 bg-white text-blue-600 rounded-lg text-sm font-bold
                       hover:bg-gray-100 transition-colors shadow-sm"
            >
              Next Lesson →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
