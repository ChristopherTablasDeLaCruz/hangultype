// Character-by-character display with Korean typing progress
import {
  complexVowelSequences, // ㅘ -> ["ㅗ","ㅏ"]
  doubleConsonantMappings, // ㄲ -> { base: "ㄱ", shift: true }
  shiftVowelMappings, // e.g., ㅒ -> { base: "ㅐ", shift: true }
} from "@/utils/korean/mappings";

interface CharacterDisplayProps {
  targetText: string;
  typedText: string;
  jamoIndex: number; // kept for compatibility; not used for cursor now
  isCompact?: boolean;
}

// Visual component for character-by-character highlighting
export function CharacterDisplay({
  targetText,
  typedText,
  jamoIndex,
  isCompact = false,
}: CharacterDisplayProps) {
  const textSize = isCompact ? "text-lg sm:text-xl" : "text-xl sm:text-2xl";
  const padding = isCompact ? "p-2" : "p-4";
  const charPadding = isCompact ? "px-1.5 py-0.5" : "px-2 py-1";
  const minWidth = isCompact ? "min-w-[1.5rem]" : "min-w-[2rem]";

  // Check if user typed the first part of a complex character (yellow state)
  function checkPartialProgress(
    typedChar: string,
    targetChar: string
  ): boolean {
    // Complex vowels: first half typed ( Ex: target ㅘ, typed ㅗ)
    if (complexVowelSequences[targetChar]) {
      const [first] = complexVowelSequences[targetChar];
      return typedChar === first;
    }
    // Double consonants: base typed (Ex: target ㄲ, typed ㄱ)
    if (doubleConsonantMappings[targetChar]) {
      return doubleConsonantMappings[targetChar].base === typedChar;
    }
    // Shift vowels: base typed (Ex: target ㅒ, typed ㅐ)
    if (shiftVowelMappings[targetChar]) {
      return shiftVowelMappings[targetChar].base === typedChar;
    }
    return false;
  }

  // Check if user messed up the second part of a complex character
  function isWrongFollowUp(target: string, typed: string, i: number): boolean {
    const targetChar = target[i];
    const current = typed[i];
    const next = typed[i + 1];

    if (current === undefined) return false;

    // Complex vowel: first part typed; next exists but doesn't complete correctly
    if (complexVowelSequences[targetChar]) {
      const [first, second] = complexVowelSequences[targetChar];
      if (current === first) {
        if (next !== undefined && next !== second && next !== targetChar) {
          return true;
        }
      }
    }

    // Double consonant: base typed; next exists but doesn't complete correctly
    if (doubleConsonantMappings[targetChar]) {
      const base = doubleConsonantMappings[targetChar].base;
      if (current === base) {
        if (next !== undefined && next !== targetChar) {
          return true;
        }
      }
    }

    // Shift vowel: base typed; next exists but doesn't complete correctly
    if (shiftVowelMappings[targetChar]) {
      const base = shiftVowelMappings[targetChar].base;
      if (current === base) {
        if (next !== undefined && next !== targetChar) {
          return true;
        }
      }
    }

    return false;
  }

  // Figure out where the cursor should be based on what they've typed
  function computeCursorIndex(target: string, typed: string): number {
    const trimmed = typed.slice(0, target.length); // don't go beyond target

    for (let i = 0; i < target.length; i++) {
      const targetChar = target[i];
      const typedChar = trimmed[i];

      // Haven't typed anything for this position yet
      if (typedChar === undefined) return i;

      // Perfect match - continue to next character
      if (typedChar === targetChar) continue;

      // Partial progress but they messed up the follow-up - treat as wrong and continue
      if (checkPartialProgress(typedChar, targetChar)) {
        if (isWrongFollowUp(target, trimmed, i)) {
          continue; // they messed up the follow-up
        }
        return i; // real partial progress - cursor stays here
      }

      // Typed something wrong
      continue;
    }

    // Everything has been typed - cursor at end
    return target.length;
  }

  const cursorCharIndex = computeCursorIndex(targetText, typedText);

  return (
    <div
      className={`
        ${textSize} font-mono flex flex-wrap gap-1 ${padding}
        bg-white border-2 border-blue-200 rounded-lg
      `}
    >
      {[...targetText].map((char, i) => {
        const typedChar = typedText[i];
        const isCursor = i === cursorCharIndex;

        // Default colors
        let bgColor = "bg-gray-100";
        let textColor = "text-gray-500";

        if (typedChar !== undefined) {
          // Wrong follow-up gets red even if first part was right
          if (isWrongFollowUp(targetText, typedText, i)) {
            bgColor = "bg-red-200";
            textColor = "text-red-800";
          } else if (typedChar === char) {
            bgColor = "bg-green-200";
            textColor = "text-green-800";
          } else if (checkPartialProgress(typedChar, char)) {
            bgColor = "bg-yellow-100";
            textColor = "text-yellow-800";
          } else {
            bgColor = "bg-red-200";
            textColor = "text-red-800";
          }
        }

        return (
          <span
            key={i}
            className={`
              ${charPadding} rounded ${minWidth} text-center
              ${bgColor} ${textColor}
              ${isCursor ? "border-b-2 border-blue-500 animate-pulse" : ""}
              transition-colors duration-150
            `}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        );
      })}
    </div>
  );
}
