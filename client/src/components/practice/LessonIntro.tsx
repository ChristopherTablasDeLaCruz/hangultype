// src/components/practice/LessonIntro.tsx
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

  const shouldShowFocusKeys = lesson.phase === "foundation";

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
      <div className="relative bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl max-w-2xl w-full p-8 overflow-hidden">
        {/* Background Glow Effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block px-3 py-1 mb-4 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-cyan-400 text-xs font-mono tracking-widest uppercase">
              {lesson.phase} PHASE
            </div>

            <h2 className="text-3xl font-bold text-slate-100 mb-2 tracking-tight">
              {lesson.title}
            </h2>

            <div className="flex items-center justify-center gap-3 text-sm font-mono text-slate-500">
              <span>LVL {lesson.difficulty}</span>
              <span className="text-slate-700">•</span>
              <span>LESSON {lesson.lessonNumber}</span>
              <span className="text-slate-700">•</span>
              <span>
                LINE {currentLineIndex + 1}/{totalLines}
              </span>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-8 bg-slate-950/50 p-6 rounded-xl border border-white/5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
              Mission Brief
            </h3>
            <p className="text-slate-300 leading-relaxed text-lg">
              {lesson.instructions}
            </p>
          </div>

          {/* Focus Keys */}
          {shouldShowFocusKeys && (
            <div className="mb-8">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 text-center">
                Target Keys
              </h3>
              <div className="flex flex-wrap justify-center gap-3">
                {lesson.focusKeys.map((key, index) => (
                  <span
                    key={index}
                    className="flex items-center justify-center w-10 h-10 bg-slate-800 border-b-2 border-slate-700 text-cyan-400 rounded-lg font-mono text-xl shadow-lg"
                  >
                    {key}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="text-center">
            <button
              onClick={onStart}
              className="group relative px-10 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl font-bold text-lg transition-all duration-200 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:-translate-y-1"
            >
              <span className="font-mono mr-2 opacity-50">./</span>
              START_SESSION
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
