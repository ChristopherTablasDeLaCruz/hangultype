// src/components/practice/GuidanceMessage.tsx
// Show helpful hints when user makes mistakes
interface GuidanceMessageProps {
  message?: string;
}

export function GuidanceMessage({ message }: GuidanceMessageProps) {
  return (
    <div className="h-8 flex items-center">
      {/* Fixed height to prevent layout shifts */}
      {message && (
        <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          💡 {message}
        </div>
      )}
    </div>
  );
}
