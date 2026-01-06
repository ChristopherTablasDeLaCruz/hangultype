// src/components/practice/PerformanceStats.tsx
interface PerformanceStatsProps {
  wpm: number;
  accuracy: number;
  progress: number;
}

export function PerformanceStats({
  wpm,
  accuracy,
  progress,
}: PerformanceStatsProps) {
  return (
    <div className="flex items-center gap-6 sm:gap-8">
      {/* WPM */}
      <div className="text-center group">
        <div className="text-2xl font-mono font-bold text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
          {wpm}
        </div>
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-cyan-400/70 transition-colors">
          WPM
        </div>
      </div>

      {/* Vertical Divider */}
      <div className="h-8 w-px bg-white/10" />

      {/* Accuracy */}
      <div className="text-center group">
        <div className="text-2xl font-mono font-bold text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">
          {accuracy}%
        </div>
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-emerald-400/70 transition-colors">
          ACC
        </div>
      </div>

      {/* Vertical Divider */}
      <div className="h-8 w-px bg-white/10" />

      {/* Progress */}
      <div className="text-center group">
        <div className="text-2xl font-mono font-bold text-violet-400 drop-shadow-[0_0_8px_rgba(167,139,250,0.5)]">
          {progress}%
        </div>
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-violet-400/70 transition-colors">
          DONE
        </div>
      </div>
    </div>
  );
}
