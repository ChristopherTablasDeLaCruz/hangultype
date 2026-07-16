import {
  CONSONANTS,
  VOWELS,
  complexVowelSequences,
  compoundFinalSequences,
  doubleConsonantMappings,
  shiftVowelMappings,
} from "./mappings";
import { textToJamoSequence } from "./decomposition";

export interface SmartGuidance {
  keys: string[];
  message?: string;
  /** The current jamo slot is corrupted and must be cleared before retyping. */
  lockCurrentIndex?: boolean;
}

// ㅆ and ㄲ have different input methods: Initial = Shift+base, Final = base+base
function isFinalConsonantPosition(targetJamo: string[], index: number): boolean {
  const current = targetJamo[index];
  if (!CONSONANTS.includes(current)) return false;

  const next = targetJamo[index + 1];

  if (next && VOWELS.includes(next)) {
    return false;
  }

  if (index < 2) return false;
  const prev1 = targetJamo[index - 1];
  if (VOWELS.includes(prev1)) {
    return true;
  }

  return false;
}

/**
 * Guidance for a two-jamo sequence (complex vowels like ㅘ, compound finals
 * like ㄺ) that the IME composes from two keystrokes.
 */
function getSequenceGuidance(
  targetChar: string,
  sequence: string[],
  typedJamo: string[],
  currentPos: number,
  isLocked: boolean,
): SmartGuidance {
  const [first, second] = sequence;
  const restartMessage = `Backspace until this slot is empty, then type ${first} → ${second} to make ${targetChar}`;

  if (isLocked) {
    return { keys: ["backspace"], message: restartMessage };
  }

  const typedAtPos = typedJamo[currentPos];

  if (typedAtPos === undefined) {
    // Nothing typed yet - start with first part
    return {
      keys: [first],
      message: `Type ${first} then ${second} to make ${targetChar}`,
    };
  }
  if (typedAtPos === targetChar) {
    // Already correct
    return { keys: [] };
  }

  // Extra jamo would corrupt the IME composition
  const expectedJamoCount = currentPos + 1;
  if (typedJamo.length > expectedJamoCount) {
    return { keys: ["backspace"], message: restartMessage, lockCurrentIndex: true };
  }

  if (typedAtPos === first) {
    // First part is correct (no extra jamo can follow — handled above)
    return {
      keys: [second],
      message: `Add ${second} to complete ${targetChar}`,
    };
  }

  // Wrong first part - start over
  return { keys: ["backspace"], message: restartMessage };
}

export function getSmartGuidance(
  targetJamo: string[],
  jamoIndex: number,
  currentTyped: string,
  shiftPressed: boolean,
  lockedMedialIndices: Set<number>,
): SmartGuidance {
  if (jamoIndex >= targetJamo.length) return { keys: [] };

  const idx = jamoIndex;
  const targetChar = targetJamo[idx];
  const typedJamo = textToJamoSequence(currentTyped);
  const currentPos = jamoIndex;

  for (let i = 0; i < currentPos; i++) {
    const earlierTarget = targetJamo[i];
    const typedChar = typedJamo[i];

    if (typedChar === undefined) continue;
    if (typedChar !== earlierTarget) {
      const isPartialMatch =
        (complexVowelSequences[earlierTarget] && complexVowelSequences[earlierTarget][0] === typedChar) ||
        (compoundFinalSequences[earlierTarget] && compoundFinalSequences[earlierTarget][0] === typedChar);

      if (!isPartialMatch) {
        return {
          keys: ["backspace"],
          message: "Backspace to fix the earlier mistake(s)",
        };
      }
    }
  }

  const sequence =
    complexVowelSequences[targetChar] ?? compoundFinalSequences[targetChar];
  if (sequence) {
    return getSequenceGuidance(
      targetChar,
      sequence,
      typedJamo,
      currentPos,
      lockedMedialIndices.has(idx),
    );
  }

  const typedAtPos = typedJamo[currentPos];
  const typedNextAtPos = typedJamo[currentPos + 1];

  if (doubleConsonantMappings[targetChar]) {
    const base = doubleConsonantMappings[targetChar];
    const isFinal = isFinalConsonantPosition(targetJamo, idx);

    if ((targetChar === "ㅆ" || targetChar === "ㄲ") && isFinal) {
      if (typedAtPos === undefined) {
        return {
          keys: [base],
          message: `Type ${base} twice to make ${targetChar}`,
        };
      }
      if (typedAtPos === targetChar) return { keys: [] };
      if (typedAtPos === base) {
        if (typedNextAtPos === undefined) {
          return {
            keys: [base],
            message: `Type ${base} again to complete ${targetChar}`,
          };
        } else if (typedNextAtPos === base) {
          return { keys: [] };
        } else {
          return {
            keys: ["backspace"],
            message: `Backspace and type ${base} twice for ${targetChar}`,
          };
        }
      }
      return {
        keys: ["backspace"],
        message: `Backspace and type ${base} twice for ${targetChar}`,
      };
    } else {
      if (typedAtPos === undefined) {
        return shiftPressed
          ? { keys: [base] }
          : {
              keys: ["shift"],
              message: `Hold Shift, then press ${base} for ${targetChar}`,
            };
      }
      if (typedAtPos === targetChar) return { keys: [] };
      if (typedAtPos === base) {
        if (typedNextAtPos && typedNextAtPos !== base) {
          return {
            keys: ["backspace"],
            message: `Backspace and try again for ${targetChar}`,
          };
        }
        return {
          keys: ["shift", base],
          message: `Hold Shift and press ${base} for ${targetChar}`,
        };
      }
      return {
        keys: ["backspace"],
        message: `Backspace and try again for ${targetChar}`,
      };
    }
  }

  if (shiftVowelMappings[targetChar]) {
    const base = shiftVowelMappings[targetChar];

    if (typedAtPos === undefined) {
      return shiftPressed
        ? { keys: [base] }
        : {
            keys: ["shift"],
            message: `Hold Shift, then press ${base} for ${targetChar}`,
          };
    }
    if (typedAtPos === targetChar) return { keys: [] };
    if (typedAtPos === base) {
      if (typedNextAtPos && typedNextAtPos !== base) {
        return {
          keys: ["backspace"],
          message: `Backspace and try again for ${targetChar}`,
        };
      }
      return {
        keys: ["shift", base],
        message: `Hold Shift and press ${base} for ${targetChar}`,
      };
    }
    return {
      keys: ["backspace"],
      message: `Backspace and try again for ${targetChar}`,
    };
  }

  if (typedAtPos === undefined) {
    return {
      keys: [targetChar],
      message: targetChar === " " ? "Press Space" : `Type ${targetChar}`,
    };
  }
  if (typedAtPos === targetChar) return { keys: [] };
  return {
    keys: ["backspace"],
    message: `Backspace and try again for ${targetChar}`,
  };
}
