// src/components/KoreanKeyboard.tsx
// "Zen UI" Korean Keyboard Component
"use client";

type KeyboardProps = {
  activeKeys: string[];
  guideKeys?: string[];
  focusKeys?: string[];
  shiftActive: boolean;
  isCompact?: boolean;
};

// Korean keyboard layout (Same logic, new style)
const keyboardRows: string[][] = [
  ["ㅂ", "ㅈ", "ㄷ", "ㄱ", "ㅅ", "ㅛ", "ㅕ", "ㅑ", "ㅐ", "ㅔ"],
  ["ㅁ", "ㄴ", "ㅇ", "ㄹ", "ㅎ", "ㅗ", "ㅓ", "ㅏ", "ㅣ"],
  ["ㅋ", "ㅌ", "ㅊ", "ㅍ", "ㅠ", "ㅜ", "ㅡ"],
];

const koreanToQwertyMap: Record<string, string> = {
  ㅂ: "Q", ㅈ: "W", ㄷ: "E", ㄱ: "R", ㅅ: "T", ㅛ: "Y", ㅕ: "U", ㅑ: "I", ㅐ: "O", ㅔ: "P",
  ㅁ: "A", ㄴ: "S", ㅇ: "D", ㄹ: "F", ㅎ: "G", ㅗ: "H", ㅓ: "J", ㅏ: "K", ㅣ: "L",
  ㅋ: "Z", ㅌ: "X", ㅊ: "C", ㅍ: "V", ㅠ: "B", ㅜ: "N", ㅡ: "M",
};

const shiftVariants: Record<string, string> = {
  ㅂ: "ㅃ", ㅈ: "ㅉ", ㄷ: "ㄸ", ㄱ: "ㄲ", ㅅ: "ㅆ", ㅐ: "ㅒ", ㅔ: "ㅖ",
};

export default function KoreanKeyboard({
  activeKeys,
  guideKeys = [],
  focusKeys = [],
  shiftActive,
  isCompact = false,
}: KeyboardProps) {
  const isKeyActive = (key: string) => activeKeys.includes(key);
  const isKeyGuided = (key: string) => guideKeys.includes(key);
  const isKeyFocused = (key: string) => focusKeys.includes(key);

  const isShiftGuided = guideKeys.includes("shift");
  const isBackspaceGuided = guideKeys.includes("backspace");

  return (
    <div className="w-full max-w-4xl mx-auto p-4 rounded-2xl bg-slate-900/40 backdrop-blur-sm border border-white/5 select-none">
      {/* Top row */}
      <div className="flex justify-center gap-1.5 sm:gap-2 mb-2">
        {keyboardRows[0].map((koreanChar) => (
          <KeyButton
            key={koreanChar}
            koreanChar={koreanChar}
            qwertyChar={koreanToQwertyMap[koreanChar]}
            isActive={isKeyActive(koreanChar)}
            isGuided={isKeyGuided(koreanChar)}
            isFocused={isKeyFocused(koreanChar)}
            displayChar={shiftActive && shiftVariants[koreanChar] ? shiftVariants[koreanChar] : koreanChar}
            isCompact={isCompact}
          />
        ))}
        <BackspaceKey
          isActive={isKeyActive("backspace")}
          isGuided={isBackspaceGuided}
          isCompact={isCompact}
        />
      </div>

      {/* Home row */}
      <div className="flex justify-center gap-1.5 sm:gap-2 mb-2 pl-4">
        {keyboardRows[1].map((koreanChar) => (
          <KeyButton
            key={koreanChar}
            koreanChar={koreanChar}
            qwertyChar={koreanToQwertyMap[koreanChar]}
            isActive={isKeyActive(koreanChar)}
            isGuided={isKeyGuided(koreanChar)}
            isFocused={isKeyFocused(koreanChar)}
            displayChar={shiftActive && shiftVariants[koreanChar] ? shiftVariants[koreanChar] : koreanChar}
            isCompact={isCompact}
          />
        ))}
      </div>

      {/* Bottom row */}
      <div className="flex justify-center items-center gap-1.5 sm:gap-2 mb-2 pl-12">
        <ModifierKey
          label="Shift"
          isActive={shiftActive}
          isGuided={isShiftGuided}
          isCompact={isCompact}
        />
        {keyboardRows[2].map((koreanChar) => (
          <KeyButton
            key={koreanChar}
            koreanChar={koreanChar}
            qwertyChar={koreanToQwertyMap[koreanChar]}
            isActive={isKeyActive(koreanChar)}
            isGuided={isKeyGuided(koreanChar)}
            isFocused={isKeyFocused(koreanChar)}
            displayChar={shiftActive && shiftVariants[koreanChar] ? shiftVariants[koreanChar] : koreanChar}
            isCompact={isCompact}
          />
        ))}
        <ModifierKey
          label="Shift"
          isActive={shiftActive}
          isGuided={isShiftGuided}
          isCompact={isCompact}
        />
      </div>

      {/* Spacebar */}
      <div className="flex items-center justify-center mt-2">
        <SpacebarKey
          isActive={isKeyActive(" ")}
          isGuided={isKeyGuided(" ")}
          isCompact={isCompact}
        />
      </div>
    </div>
  );
}

// --- KEY COMPONENTS ---

function KeyButton({
  qwertyChar,
  isActive,
  isGuided,
  isFocused,
  displayChar,
  isCompact,
}: {
  koreanChar: string;
  qwertyChar: string;
  isActive: boolean;
  isGuided: boolean;
  isFocused: boolean;
  displayChar: string;
  isCompact: boolean;
}) {
  const keySize = isCompact
    ? "w-8 h-9"
    : "w-8 h-10 sm:w-10 sm:h-12 md:w-12 md:h-14";
  
  const textSize = isCompact ? "text-sm" : "text-base sm:text-lg";

  // UI State Logic
  let styleClass = "bg-slate-800 border-slate-700 text-slate-400"; // Default
  
  if (isActive) {
    // Pressed State (Cyan Glow)
    styleClass = "bg-cyan-500 border-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.6)] scale-95";
  } else if (isGuided) {
    // Guide State (Emerald Ring)
    styleClass = "bg-slate-800 border-emerald-400 text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.2)]";
  } else if (isFocused) {
    // Focused State (Subtle Slate Highlight)
    styleClass = "bg-slate-700 border-slate-600 text-slate-200";
  }

  return (
    <div
      className={`
        ${keySize} flex flex-col items-center justify-center 
        border-b-4 rounded-lg transition-all duration-75 
        ${styleClass}
      `}
    >
      <span className={`${textSize} font-mono font-bold leading-none mb-0.5`}>
        {displayChar}
      </span>
      
      {!isCompact && (
        <span className={`text-[9px] font-mono leading-none opacity-50 ${isActive ? 'text-slate-900' : ''}`}>
          {qwertyChar}
        </span>
      )}
    </div>
  );
}

function SpacebarKey({
  isActive,
  isGuided,
  isCompact,
}: {
  isActive: boolean;
  isGuided: boolean;
  isFocused?: boolean;
  isCompact: boolean;
}) {
  const width = isCompact ? "w-40 h-8" : "w-64 h-10 sm:h-12";
  
  let styleClass = "bg-slate-800 border-slate-700";
  
  if (isActive) {
    styleClass = "bg-cyan-500 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.6)] scale-95";
  } else if (isGuided) {
    styleClass = "bg-slate-800 border-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.2)]";
  }

  return (
    <div className={`${width} border-b-4 rounded-lg transition-all duration-75 ${styleClass}`} />
  );
}

function ModifierKey({
  label,
  isActive,
  isGuided,
  isCompact,
}: {
  label: string;
  isActive: boolean;
  isGuided: boolean;
  isCompact?: boolean;
}) {
  const size = isCompact ? "w-14 h-9" : "w-16 h-10 sm:w-20 sm:h-12 md:w-24 md:h-14";
  
  let styleClass = "bg-slate-900 border-slate-800 text-slate-500";
  
  if (isActive) {
    styleClass = "bg-cyan-600 border-cyan-500 text-white shadow-lg scale-95";
  } else if (isGuided) {
    styleClass = "bg-slate-800 border-emerald-500 text-emerald-400";
  }

  return (
    <div
      className={`
        ${size} flex items-center justify-center 
        border-b-4 rounded-lg font-mono text-xs sm:text-sm font-bold 
        transition-all duration-75 ${styleClass}
      `}
    >
      {label}
    </div>
  );
}

function BackspaceKey({
  isActive,
  isGuided,
  isCompact,
}: {
  isActive: boolean;
  isGuided: boolean;
  isCompact: boolean;
}) {
  const size = isCompact ? "w-14 h-9" : "w-16 h-10 sm:w-20 sm:h-12 md:w-24 md:h-14";
  
  let styleClass = "bg-slate-900 border-slate-800 text-slate-500";
  
  if (isActive) {
    styleClass = "bg-cyan-600 border-cyan-500 text-white scale-95";
  } else if (isGuided) {
    styleClass = "bg-slate-800 border-emerald-500 text-emerald-400";
  }

  return (
    <div
      className={`
        ${size} flex items-center justify-center 
        border-b-4 rounded-lg transition-all duration-75 
        ${styleClass}
      `}
    >
      <span className="text-sm sm:text-lg">⌫</span>
    </div>
  );
}