import {
  complexVowelSequences,
  compoundFinalSequences,
  doubleConsonantMappings,
  shiftVowelMappings,
} from "@/utils/korean/mappings";

interface CharacterDisplayProps {
  targetText: string;
  typedText: string;
  jamoIndex: number;
  isCompact?: boolean;
  showCursor?: boolean;
}

export function CharacterDisplay({
  targetText,
  typedText,
  isCompact = false,
  showCursor = true,
}: CharacterDisplayProps) {
  const textSize = isCompact ? "text-2xl" : "text-3xl";
  const spacing = isCompact
    ? "tracking-wide leading-relaxed"
    : "tracking-widest leading-loose";

  function checkPartialProgress(
    typedChar: string,
    targetChar: string,
  ): boolean {
    if (complexVowelSequences[targetChar]) {
      const [first] = complexVowelSequences[targetChar];
      return typedChar === first;
    }
    if (compoundFinalSequences[targetChar]) {
      const [first] = compoundFinalSequences[targetChar];
      return typedChar === first;
    }
    if (doubleConsonantMappings[targetChar]) {
      return doubleConsonantMappings[targetChar].base === typedChar;
    }
    if (shiftVowelMappings[targetChar]) {
      return shiftVowelMappings[targetChar].base === typedChar;
    }
    return false;
  }

  function isWrongFollowUp(target: string, typed: string, i: number): boolean {
    const targetChar = target[i];
    const current = typed[i];
    const next = typed[i + 1];

    if (current === undefined) return false;

    if (complexVowelSequences[targetChar]) {
      const [first, second] = complexVowelSequences[targetChar];
      if (current === first) {
        if (next !== undefined && next !== second && next !== targetChar) {
          return true;
        }
      }
    }
    if (compoundFinalSequences[targetChar]) {
      const [first, second] = compoundFinalSequences[targetChar];
      if (current === first) {
        if (next !== undefined && next !== second && next !== targetChar) {
          return true;
        }
      }
    }
    if (doubleConsonantMappings[targetChar]) {
      const base = doubleConsonantMappings[targetChar].base;
      if (current === base) {
        if (next !== undefined && next !== targetChar) return true;
      }
    }
    if (shiftVowelMappings[targetChar]) {
      const base = shiftVowelMappings[targetChar].base;
      if (current === base) {
        if (next !== undefined && next !== targetChar) return true;
      }
    }
    return false;
  }

  function computeCursorIndex(target: string, typed: string): number {
    const trimmed = typed.slice(0, target.length);
    for (let i = 0; i < target.length; i++) {
      const targetChar = target[i];
      const typedChar = trimmed[i];

      if (typedChar === undefined) return i;
      if (typedChar === targetChar) continue;

      if (checkPartialProgress(typedChar, targetChar)) {
        if (isWrongFollowUp(target, trimmed, i)) continue;
        return i;
      }
      continue;
    }
    return target.length;
  }

  const cursorCharIndex = computeCursorIndex(targetText, typedText);

  return (
    <div
      className={`
        relative w-full break-all
        ${textSize} ${spacing} font-mono
        text-left select-none outline-none
      `}
    >
      {[...targetText].map((char, i) => {
        const typedChar = typedText[i];
        const isCursor = i === cursorCharIndex;

        let textColor = "text-slate-700";
        let textGlow = "";

        if (typedChar !== undefined) {
          if (isWrongFollowUp(targetText, typedText, i)) {
            textColor = "text-red-400";
            textGlow = "drop-shadow-[0_0_8px_rgba(248,113,113,0.4)]";
          } else if (typedChar === char) {
            textColor = "text-emerald-400";
            textGlow = "drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]";
          } else if (checkPartialProgress(typedChar, char)) {
            textColor = "text-yellow-400";
          } else {
            textColor = "text-red-400";
          }
        } else if (isCursor) {
          textColor = "text-slate-500";
        }

        const isHardError =
          typedChar !== undefined &&
          typedChar !== char &&
          !checkPartialProgress(typedChar, char) &&
          !isWrongFollowUp(targetText, typedText, i);

        const isPartialProgress =
          typedChar !== undefined &&
          typedChar !== char &&
          checkPartialProgress(typedChar, char);

        return (
          <span
            key={i}
            className={`relative inline-block transition-colors duration-150 ${textColor} ${textGlow}`}
          >
            {isCursor && showCursor && (
              <span className="absolute -left-1 -top-1 bottom-0 w-[3px] bg-cyan-400 rounded-full shadow-[0_0_12px_rgba(34,211,238,0.8)] animate-[caret-blink_1.5s_ease-in-out_infinite]" />
            )}

            {/* Show mistyped character with target below when wrong */}
            {isHardError ? (
              <span className="inline-flex flex-col items-center">
                <span className="text-red-400 font-bold">
                  {typedChar === " " ? "␣" : typedChar}
                </span>
                <span className="text-[0.6em] text-slate-600 -mt-1">
                  {char === " " ? "␣" : char}
                </span>
              </span>
            ) : isPartialProgress ? (
              <span className="inline-flex flex-col items-center">
                <span className="text-yellow-400 font-bold">
                  {typedChar === " " ? "␣" : typedChar}
                </span>
                <span className="text-[0.6em] text-slate-600 -mt-1">
                  → {char === " " ? "␣" : char}
                </span>
              </span>
            ) : (
              <>{char === " " ? "\u00A0" : char}</>
            )}
          </span>
        );
      })}
    </div>
  );
}
