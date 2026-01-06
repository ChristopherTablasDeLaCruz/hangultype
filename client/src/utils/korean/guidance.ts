// src/utils/korean/guidance.ts
import {
  complexVowelSequences,
  doubleConsonantMappings,
  shiftVowelMappings,
} from "./mappings";
import { textToJamoSequence } from "./decomposition";

// Show what to type next for each character type
export function getGuidanceForCharacter(
  targetChar: string,
  progressInSequence: number = 0,
): string[] {
  // Complex vowels need multiple keystrokes
  if (complexVowelSequences[targetChar]) {
    const sequence = complexVowelSequences[targetChar];
    if (progressInSequence < sequence.length) {
      return [sequence[progressInSequence]];
    }
    return [];
  }

  // Double consonants need shift + base key
  if (doubleConsonantMappings[targetChar]) {
    if (progressInSequence === 0) {
      return ["shift", doubleConsonantMappings[targetChar].base];
    }
    return [];
  }

  // Shift vowels work the same way
  if (shiftVowelMappings[targetChar]) {
    if (progressInSequence === 0) {
      return ["shift", shiftVowelMappings[targetChar].base];
    }
    return [];
  }

  // Regular characters
  return [targetChar];
}

// Track how far through a complex sequence the user is
export function getSequenceProgress(
  targetChar: string,
  typedJamo: string[],
): number {
  // Complex vowels - check each part of the sequence
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

  // Shift characters - either done or not done
  if (doubleConsonantMappings[targetChar] || shiftVowelMappings[targetChar]) {
    return typedJamo.length > 0 &&
      typedJamo[typedJamo.length - 1] === targetChar
      ? 1
      : 0;
  }

  // Simple characters
  return typedJamo.length > 0 && typedJamo[typedJamo.length - 1] === targetChar
    ? 1
    : 0;
}

// Main logic for what to suggest next
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

  // Check if earlier characters are wrong - fix those first
  const targetSoFar = targetJamo.slice(0, currentPos).join("");
  const typedSoFar = typedJamo.slice(0, currentPos).join("");
  if (typedSoFar !== targetSoFar) {
    return {
      keys: ["backspace"],
      message: "Backspace to fix the earlier mistake(s)",
    };
  }

  const typedAtPos = typedJamo[currentPos];
  const typedNextAtPos = typedJamo[currentPos + 1];

  // Complex vowels need special handling
  if (complexVowelSequences[targetChar]) {
    const [first, second] = complexVowelSequences[targetChar];

    // If locked, force clean restart
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

  // Double consonants
  if (doubleConsonantMappings[targetChar]) {
    const base = doubleConsonantMappings[targetChar].base;

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

  // Shift vowels
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

  // Regular jamo
  if (typedAtPos === undefined) return { keys: [targetChar] };
  if (typedAtPos === targetChar) return { keys: [] };
  return {
    keys: ["backspace"],
    message: `Backspace and try again for ${targetChar}`,
  };
}
