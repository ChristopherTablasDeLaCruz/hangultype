// src/components/KoreanKeyboard.tsx
// Korean keyboard component for Hangul typing tutor
"use client";

type KeyboardProps = {
  /** Keys currently being pressed */
  activeKeys: string[];
  /** Next key user should press */
  guideKeys?: string[];
  /** Keys being practiced in current lesson */
  focusKeys?: string[];
  /** Whether shift is currently pressed */
  shiftActive: boolean;
  /** Smaller keyboard for mobile/constrained spaces */
  isCompact?: boolean;
};

// Korean keyboard layout (두벌식 layout)
const keyboardRows: string[][] = [
  ["ㅂ", "ㅈ", "ㄷ", "ㄱ", "ㅅ", "ㅛ", "ㅕ", "ㅑ", "ㅐ", "ㅔ"], // Top row
  ["ㅁ", "ㄴ", "ㅇ", "ㄹ", "ㅎ", "ㅗ", "ㅓ", "ㅏ", "ㅣ"], // Home row
  ["ㅋ", "ㅌ", "ㅊ", "ㅍ", "ㅠ", "ㅜ", "ㅡ"], // Bottom row
];

// Map Korean characters to their QWERTY positions
const koreanToQwertyMap: Record<string, string> = {
  ㅂ: "Q",
  ㅈ: "W",
  ㄷ: "E",
  ㄱ: "R",
  ㅅ: "T",
  ㅛ: "Y",
  ㅕ: "U",
  ㅑ: "I",
  ㅐ: "O",
  ㅔ: "P",
  ㅁ: "A",
  ㄴ: "S",
  ㅇ: "D",
  ㄹ: "F",
  ㅎ: "G",
  ㅗ: "H",
  ㅓ: "J",
  ㅏ: "K",
  ㅣ: "L",
  ㅋ: "Z",
  ㅌ: "X",
  ㅊ: "C",
  ㅍ: "V",
  ㅠ: "B",
  ㅜ: "N",
  ㅡ: "M",
};

// What you get when you press Shift
const shiftVariants: Record<string, string> = {
  ㅂ: "ㅃ",
  ㅈ: "ㅉ",
  ㄷ: "ㄸ",
  ㄱ: "ㄲ",
  ㅅ: "ㅆ",
  ㅐ: "ㅒ",
  ㅔ: "ㅖ",
};

export default function KoreanKeyboard({
  activeKeys,
  guideKeys = [],
  focusKeys = [],
  shiftActive,
  isCompact = false,
}: KeyboardProps) {
  // Check key states
  const isKeyActive = (key: string) => activeKeys.includes(key);
  const isKeyGuided = (key: string) => guideKeys.includes(key);
  const isKeyFocused = (key: string) => focusKeys.includes(key);

  // Check if special keys are being guided
  const isShiftGuided = guideKeys.includes("shift");
  const isBackspaceGuided = guideKeys.includes("backspace");

  // Spacebar gets special treatment
  const spacebarState = {
    active: isKeyActive(" "),
    guided: isKeyGuided(" "),
    focused: isKeyFocused(" "),
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-2 sm:p-4 rounded-lg bg-gray-100">
      {/* Top row (10 keys + backspace) */}
      <div className="flex justify-center gap-1 sm:gap-2 mb-1 sm:mb-2">
        {keyboardRows[0].map((koreanChar) => (
          <KeyButton
            key={koreanChar}
            koreanChar={koreanChar}
            qwertyChar={koreanToQwertyMap[koreanChar]}
            isActive={isKeyActive(koreanChar)}
            isGuided={isKeyGuided(koreanChar)}
            isFocused={isKeyFocused(koreanChar)}
            displayChar={
              shiftActive && shiftVariants[koreanChar]
                ? shiftVariants[koreanChar]
                : koreanChar
            }
            isCompact={isCompact}
          />
        ))}

        {/* Backspace key */}
        <BackspaceKey
          isActive={isKeyActive("backspace")}
          isGuided={isBackspaceGuided}
          isFocused={isKeyFocused("backspace")}
          isCompact={isCompact}
        />
      </div>

      {/* Home row (9 keys) */}
      <div className="flex justify-center gap-1 sm:gap-2 mb-1 sm:mb-2">
        {keyboardRows[1].map((koreanChar) => (
          <KeyButton
            key={koreanChar}
            koreanChar={koreanChar}
            qwertyChar={koreanToQwertyMap[koreanChar]}
            isActive={isKeyActive(koreanChar)}
            isGuided={isKeyGuided(koreanChar)}
            isFocused={isKeyFocused(koreanChar)}
            displayChar={
              shiftActive && shiftVariants[koreanChar]
                ? shiftVariants[koreanChar]
                : koreanChar
            }
            isCompact={isCompact}
          />
        ))}
      </div>

      {/* Bottom row with shift keys (7 keys + 2 shifts) */}
      <div className="flex justify-center items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
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
            displayChar={
              shiftActive && shiftVariants[koreanChar]
                ? shiftVariants[koreanChar]
                : koreanChar
            }
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

      {/* Spacebar row */}
      <div className="flex items-center justify-center">
        <SpacebarKey
          isActive={spacebarState.active}
          isGuided={spacebarState.guided}
          isFocused={spacebarState.focused}
          isCompact={isCompact}
        />
      </div>
    </div>
  );
}

// Individual key with visual feedback
function KeyButton({
  koreanChar,
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
  // Responsive sizing
  const keySize = isCompact
    ? "w-7 h-7"
    : "w-6 h-8 sm:w-8 sm:h-10 md:w-10 md:h-12 lg:w-11 lg:h-13 xl:w-12 xl:h-14";

  const textSize = isCompact
    ? "text-xs"
    : "text-xs sm:text-sm md:text-base lg:text-lg";

  // Visual priority: active > guided+focused > guided > focused > default
  const getKeyStyle = () => {
    if (isActive) {
      return "bg-blue-500 text-white"; // User is pressing this key right now
    }

    if (isGuided && isFocused) {
      // Next key to press AND part of lesson focus
      return "bg-green-100 text-green-800 ring-4 ring-amber-400";
    }

    if (isGuided) {
      // Next key to press
      return "bg-white text-black ring-2 ring-amber-400";
    }

    if (isFocused) {
      // Part of the lesson's focus
      return "bg-green-100 text-green-800 border-green-400";
    }

    // Default state
    return "bg-gray-100 text-gray-400";
  };

  return (
    <div
      className={`
      ${keySize} flex flex-col items-center justify-center 
      border border-gray-300 rounded shadow-sm 
      transition-all duration-150 ${getKeyStyle()}
    `}
    >
      {/* Main Korean character */}
      <span className={`${textSize} font-bold leading-none`}>
        {displayChar}
      </span>

      {/* QWERTY reference (hidden in compact mode) */}
      {qwertyChar && !isCompact && (
        <span
          className={`
          text-[8px] sm:text-[10px] leading-none mt-0.5 sm:mt-1
          ${
            isActive
              ? "text-white/80"
              : isFocused
              ? "text-green-600/80"
              : "text-gray-500"
          }
        `}
        >
          {qwertyChar}
        </span>
      )}
    </div>
  );
}

// Spacebar with special handling
function SpacebarKey({
  isActive,
  isGuided,
  isFocused,
  isCompact,
}: {
  isActive: boolean;
  isGuided: boolean;
  isFocused: boolean;
  isCompact: boolean;
}) {
  const spacebarSize = isCompact
    ? "h-6 w-28 sm:w-32"
    : "h-8 sm:h-10 w-32 sm:w-52 md:w-64";

  // Same state logic as regular keys
  const getSpacebarStyle = () => {
    if (isActive) {
      return "bg-blue-500";
    }

    if (isGuided && isFocused) {
      return "bg-green-100 ring-4 ring-amber-400";
    }

    if (isGuided) {
      return "bg-white ring-2 ring-amber-400";
    }

    if (isFocused) {
      return "bg-green-100 border-green-400";
    }

    return "bg-white";
  };

  return (
    <div
      className={`
        ${spacebarSize} border rounded shadow 
        transition-all duration-150 ${getSpacebarStyle()}
      `}
      aria-label="Space"
      title="Space"
    />
  );
}

// Modifier keys like Shift
function ModifierKey({
  label,
  isActive,
  isGuided = false,
  isCompact,
}: {
  label: string;
  isActive: boolean;
  isGuided?: boolean;
  isCompact?: boolean;
}) {
  const modifierSize = isCompact
    ? "w-12 h-7"
    : "w-12 h-8 sm:w-16 sm:h-10 md:w-20 md:h-12";

  const textSize = isCompact ? "text-xs" : "text-xs sm:text-sm";

  // Styling logic with guidance support
  const getModifierStyle = () => {
    if (isActive) {
      return "bg-blue-500 text-white";
    }

    if (isGuided) {
      return "bg-white text-black ring-2 ring-amber-400";
    }

    return "bg-white text-black";
  };

  return (
    <div
      className={`
      ${modifierSize} flex items-center justify-center 
      border border-gray-300 rounded shadow-sm 
      ${textSize} font-bold transition-all duration-150
      ${getModifierStyle()}
    `}
    >
      {label}
    </div>
  );
}

// Backspace key
function BackspaceKey({
  isActive,
  isGuided,
  isFocused,
  isCompact,
}: {
  isActive: boolean;
  isGuided: boolean;
  isFocused: boolean;
  isCompact: boolean;
}) {
  const backspaceSize = isCompact
    ? "w-12 h-7"
    : "w-12 h-8 sm:w-16 sm:h-10 md:w-20 md:h-12 lg:w-22 lg:h-13 xl:w-24 xl:h-14";

  const textSize = isCompact ? "text-xs" : "text-xs sm:text-sm md:text-base";

  // Same visual state logic as other keys
  const getBackspaceStyle = () => {
    if (isActive) {
      return "bg-blue-500 text-white";
    }

    if (isGuided && isFocused) {
      return "bg-green-100 text-green-800 ring-4 ring-amber-400";
    }

    if (isGuided) {
      return "bg-white text-black ring-2 ring-amber-400";
    }

    if (isFocused) {
      return "bg-green-100 text-green-800 border-green-400";
    }

    return "bg-gray-100 text-gray-400";
  };

  return (
    <div
      className={`
      ${backspaceSize} flex items-center justify-center 
      border border-gray-300 rounded shadow-sm 
      ${textSize} font-bold transition-all duration-150
      ${getBackspaceStyle()}
    `}
    >
      ⌫
    </div>
  );
}
