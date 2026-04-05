import {
  complexVowelSequences,
  compoundFinalSequences,
  doubleConsonantMappings,
  shiftVowelMappings,
} from "./mappings";
import { textToJamoSequence } from "./decomposition";

export function getGuidanceForCharacter(
  targetChar: string,
  progressInSequence: number = 0,
): string[] {
  if (complexVowelSequences[targetChar]) {
    const sequence = complexVowelSequences[targetChar];
    if (progressInSequence < sequence.length) {
      return [sequence[progressInSequence]];
    }
    return [];
  }

  if (compoundFinalSequences[targetChar]) {
    const sequence = compoundFinalSequences[targetChar];
    if (progressInSequence < sequence.length) {
      return [sequence[progressInSequence]];
    }
    return [];
  }

  if (doubleConsonantMappings[targetChar]) {
    if (progressInSequence === 0) {
      return ["shift", doubleConsonantMappings[targetChar].base];
    }
    return [];
  }

  if (shiftVowelMappings[targetChar]) {
    if (progressInSequence === 0) {
      return ["shift", shiftVowelMappings[targetChar].base];
    }
    return [];
  }

  return [targetChar];
}

export function getSequenceProgress(
  targetChar: string,
  typedJamo: string[],
): number {
  if (complexVowelSequences[targetChar]) {
    const sequence = complexVowelSequences[targetChar];
    let progress = 0;

    for (let i = 0; i < sequence.length && i < typedJamo.length; i++) {
      if (typedJamo[typedJamo.length - sequence.length + i] === sequence[i]) {
        progress = i + 1;
      } else {
        break;
      }
    }

    return progress;
  }

  if (compoundFinalSequences[targetChar]) {
    const sequence = compoundFinalSequences[targetChar];
    let progress = 0;

    for (let i = 0; i < sequence.length && i < typedJamo.length; i++) {
      if (typedJamo[typedJamo.length - sequence.length + i] === sequence[i]) {
        progress = i + 1;
      } else {
        break;
      }
    }

    return progress;
  }

  if (doubleConsonantMappings[targetChar] || shiftVowelMappings[targetChar]) {
    return typedJamo.length > 0 &&
      typedJamo[typedJamo.length - 1] === targetChar
      ? 1
      : 0;
  }

  return typedJamo.length > 0 && typedJamo[typedJamo.length - 1] === targetChar
    ? 1
    : 0;
}

// ㅆ and ㄲ have different input methods: Initial = Shift+base, Final = base+base
function isFinalConsonantPosition(targetJamo: string[], index: number): boolean {
  if (index < 2) return false;

  const CONSONANTS = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
  const VOWELS = ["ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅗ", "ㅘ", "ㅙ", "ㅚ", "ㅛ", "ㅜ", "ㅝ", "ㅞ", "ㅟ", "ㅠ", "ㅡ", "ㅢ", "ㅣ"];

  const current = targetJamo[index];
  if (!CONSONANTS.includes(current)) return false;

  const prev1 = targetJamo[index - 1];
  const prev2 = index >= 2 ? targetJamo[index - 2] : undefined;

  if (VOWELS.includes(prev1)) {
    return true;
  }

  return false;
}

export function getSmartGuidance(
  targetJamo: string[],
  jamoIndex: number,
  currentTyped: string,
  shiftPressed: boolean,
  lockedMedialIndices: Set<number>,
  lockIndex: (i: number) => void,
): { keys: string[]; message?: string } {
  if (jamoIndex >= targetJamo.length) return { keys: [] };

  const idx = jamoIndex;
  const targetChar = targetJamo[idx];
  const typedJamo = textToJamoSequence(currentTyped);
  const currentPos = jamoIndex;

  for (let i = 0; i < currentPos; i++) {
    const targetChar = targetJamo[i];
    const typedChar = typedJamo[i];

    if (typedChar === undefined) continue;
    if (typedChar !== targetChar) {
      const isPartialMatch =
        (complexVowelSequences[targetChar] && complexVowelSequences[targetChar][0] === typedChar) ||
        (compoundFinalSequences[targetChar] && compoundFinalSequences[targetChar][0] === typedChar);

      if (!isPartialMatch) {
        return {
          keys: ["backspace"],
          message: "Backspace to fix the earlier mistake(s)",
        };
      }
    }
  }

  const typedAtPos = typedJamo[currentPos];
  const typedNextAtPos = typedJamo[currentPos + 1];

  if (complexVowelSequences[targetChar]) {
    const [first, second] = complexVowelSequences[targetChar];

    if (lockedMedialIndices.has(idx)) {
      return {
        keys: ["backspace"],
        message: `Backspace until this slot is empty, then type ${first} → ${second} to make ${targetChar}`,
      };
    }

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

    // Check for extra jamo that might mess up the IME
    const expectedJamoCount = currentPos + 1;
    if (typedJamo.length > expectedJamoCount) {
      lockIndex(idx);
      return {
        keys: ["backspace"],
        message: `Backspace until this slot is empty, then type ${first} → ${second} to make ${targetChar}`,
      };
    }

    if (typedAtPos === first) {
      // First part is correct
      if (typedNextAtPos === undefined) {
        return {
          keys: [second],
          message: `Add ${second} to complete ${targetChar}`,
        };
      } else if (typedNextAtPos === second) {
        // Both parts correct, waiting for IME to compose
        return { keys: [] };
      } else {
        // Wrong second part
        lockIndex(idx);
        return {
          keys: ["backspace"],
          message: `Backspace until this slot is empty, then type ${first} → ${second} to make ${targetChar}`,
        };
      }
    }

    // Wrong first part - start over
    return {
      keys: ["backspace"],
      message: `Backspace until this slot is empty, then type ${first} → ${second} to make ${targetChar}`,
    };
  }

  if (compoundFinalSequences[targetChar]) {
    const [first, second] = compoundFinalSequences[targetChar];

    if (lockedMedialIndices.has(idx)) {
      return {
        keys: ["backspace"],
        message: `Backspace until this slot is empty, then type ${first} → ${second} to make ${targetChar}`,
      };
    }

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

    // Check for extra jamo that might mess up the IME
    const expectedJamoCount = currentPos + 1;
    if (typedJamo.length > expectedJamoCount) {
      lockIndex(idx);
      return {
        keys: ["backspace"],
        message: `Backspace until this slot is empty, then type ${first} → ${second} to make ${targetChar}`,
      };
    }

    if (typedAtPos === first) {
      // First part is correct
      if (typedNextAtPos === undefined) {
        return {
          keys: [second],
          message: `Add ${second} to complete ${targetChar}`,
        };
      } else if (typedNextAtPos === second) {
        // Both parts correct, waiting for IME to compose
        return { keys: [] };
      } else {
        // Wrong second part
        lockIndex(idx);
        return {
          keys: ["backspace"],
          message: `Backspace until this slot is empty, then type ${first} → ${second} to make ${targetChar}`,
        };
      }
    }

    // Wrong first part - start over
    return {
      keys: ["backspace"],
      message: `Backspace until this slot is empty, then type ${first} → ${second} to make ${targetChar}`,
    };
  }

  if (doubleConsonantMappings[targetChar]) {
    const base = doubleConsonantMappings[targetChar].base;
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
    const base = shiftVowelMappings[targetChar].base;

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
