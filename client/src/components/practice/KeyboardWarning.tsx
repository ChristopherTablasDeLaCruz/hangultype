"use client";

interface KeyboardWarningProps {
  isVisible: boolean;
  onClose: () => void;
}

export function KeyboardWarning({ isVisible, onClose }: KeyboardWarningProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-slate-900/90 border border-cyan-500/30 backdrop-blur-xl px-6 py-5 rounded-2xl flex items-center gap-5 shadow-[0_0_50px_rgba(6,182,212,0.2)]">
        <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400">
          <svg
            className="w-7 h-7 animate-pulse"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
        </div>

        <div className="text-left">
          <p className="text-white text-sm font-bold uppercase tracking-widest font-mono mb-1">
            English Input Detected
          </p>
          <p className="text-slate-400 text-xs font-mono leading-relaxed">
            Please switch your input source to{" "}
            <span className="text-cyan-400 font-bold">Korean 2-Set</span>.
          </p>
        </div>

        <button
          onClick={onClose}
          className="ml-2 p-2 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-colors"
          aria-label="Close warning"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
