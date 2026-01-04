// src/components/practice/CompletionModal.tsx
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
    <div className="fixed top-24 left-0 right-0 z-50 flex justify-center px-4 animate-in fade-in slide-in-from-top-4 duration-500">
      <div 
        className="
          relative overflow-hidden
          w-full max-w-3xl
          bg-slate-900/80 backdrop-blur-xl 
          border border-emerald-500/30 
          rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.15)]
          p-1
        "
      >
        {/* Ambient Glow */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0" />
        <div className="absolute -left-10 -top-10 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-6 py-4 relative z-10">
          
          {/* Text Content */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3 mb-1">
              <span className="text-xl">🎉</span>
              <h2 className="text-lg font-bold text-slate-100 tracking-tight">
                LESSON COMPLETE
              </h2>
            </div>
            
            <div className="text-sm font-mono text-emerald-400">
              <span className="opacity-70 text-slate-400">RESULT: </span>
              <span className="font-bold">{wpm} WPM</span>
              <span className="mx-2 text-slate-600">|</span>
              <span className="font-bold">{accuracy}% ACCURACY</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onTryAgain}
              className="px-4 py-2 rounded-lg font-mono text-xs font-bold
                       text-slate-400 hover:text-white
                       border border-white/5 hover:border-white/20 hover:bg-white/5 
                       transition-all"
            >
              RETRY_
            </button>

            {hasNextLesson && (
              <button
                onClick={onNextLesson}
                className="group flex items-center gap-2 px-5 py-2 rounded-lg 
                         bg-emerald-500/10 border border-emerald-500/50 text-emerald-400
                         hover:bg-emerald-500 hover:text-slate-950 hover:border-emerald-400
                         transition-all font-mono text-xs font-bold shadow-[0_0_15px_rgba(16,185,129,0.1)]"
              >
                NEXT_MODULE
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}