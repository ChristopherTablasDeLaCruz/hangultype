// src/components/practice/PerformanceStats.tsx
// Show typing performance metrics during practice
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
    <div className="flex items-center gap-4 text-sm">
      <div className="text-center">
        <div className="text-lg font-bold text-blue-600">{wpm}</div>
        <div className="text-xs text-gray-500">WPM</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-bold text-green-600">{accuracy}%</div>
        <div className="text-xs text-gray-500">Accuracy</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-bold text-purple-600">{progress}%</div>
        <div className="text-xs text-gray-500">Progress</div>
      </div>
    </div>
  );
}
