// src/components/practice/GuidanceMessage.tsx
interface GuidanceMessageProps {
  message?: string;
}

export function GuidanceMessage({ message }: GuidanceMessageProps) {
  return (
    <div className="h-8 flex items-center">
      {/* Fixed height prevents the typing area from "jumping" when hints appear */}
      {message ? (
        <div className="
          animate-in fade-in zoom-in-95 duration-300
          flex items-center gap-2 
          px-3 py-1 
          rounded-full 
          bg-cyan-500/10 
          backdrop-blur-md 
          border border-cyan-500/20 
          text-xs font-mono font-bold tracking-tight text-cyan-400
          shadow-[0_0_15px_rgba(34,211,238,0.1)]
        ">
          <span className="opacity-70">SYSTEM:</span>
          <span>{message.toUpperCase()}</span>
        </div>
      ) : (
        <div className="h-full w-1" />
      )}
    </div>
  );
}