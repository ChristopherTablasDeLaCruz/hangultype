import { useState, useRef, useMemo } from "react";
import {
  qwertyToKorean,
  complexVowelSequences,
  compoundFinalSequences,
  KEY_FLASH_MS,
} from "@/utils/korean/mappings";
import { textToJamoSequence } from "@/utils/korean/decomposition";
import {
  getSmartGuidance,
  getGuidanceForCharacter,
  getSequenceProgress,
} from "@/utils/korean/guidance";

export function useKoreanTyping(
  currentLine: string,
  currentLineJamo: string[],
) {
  const [currentLineTyped, setCurrentLineTyped] = useState("");
  const [jamoIndex, setJamoIndex] = useState(0);

  const [lockedMedialIndices, setLockedMedialIndices] = useState<Set<number>>(
    new Set(),
  );

  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  const [shiftPressed, setShiftPressed] = useState(false);
  const flashTimeouts = useRef<Record<string, number>>({});

  // Prevents IME corruption
  const lockIndex = (i: number) => {
    setLockedMedialIndices((prev) => {
      const next = new Set(prev);
      next.add(i);
      return next;
    });
  };

  const unlockIndex = (i: number) => {
    setLockedMedialIndices((prev) => {
      if (!prev.has(i)) return prev;
      const next = new Set(prev);
      next.delete(i);
      return next;
    });
  };

  const clearAllLocks = () => {
    setLockedMedialIndices(new Set());
  };

  const flashKey = (jamo: string) => {
    setActiveKeys((prev) => (prev.includes(jamo) ? prev : [...prev, jamo]));

    if (flashTimeouts.current[jamo]) clearTimeout(flashTimeouts.current[jamo]);

    flashTimeouts.current[jamo] = window.setTimeout(() => {
      setActiveKeys((prev) => prev.filter((k) => k !== jamo));
      delete flashTimeouts.current[jamo];
    }, KEY_FLASH_MS);
  };

  const smartGuidance = useMemo(() => {
    return getSmartGuidance(
      currentLineJamo,
      jamoIndex,
      currentLineTyped,
      shiftPressed,
      lockedMedialIndices,
      lockIndex,
    );
  }, [
    currentLineJamo,
    jamoIndex,
    currentLineTyped,
    shiftPressed,
    lockedMedialIndices,
  ]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Shift") {
      setShiftPressed(true);
      return;
    }

    if (e.key === "Backspace") return;

    if (e.code === "Space") {
      flashKey(" ");
      return;
    }

    const koreanKey = qwertyToKorean[e.code];
    if (koreanKey) {
      flashKey(koreanKey);

      const expected = currentLineJamo[jamoIndex];
      if (expected && expected !== " ") {
        const typedJamo = textToJamoSequence(currentLineTyped);
        const expectedGuidance = getGuidanceForCharacter(
          expected,
          getSequenceProgress(expected, typedJamo),
        );

        if (
          expectedGuidance.includes(koreanKey) ||
          (shiftPressed && expectedGuidance.includes("shift"))
        ) {
        }
      }
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Shift") setShiftPressed(false);
  };

  /**
   * Main input handler - processes every keystroke.
   *
   * The Korean IME outputs composed characters,
   * but we need to track individual jamo positions. This handler:
   *
   * 1. Updates the typed text state
   * 2. Detects backspace vs forward progress
   * 3. Manages locking for multi-stroke characters
   * 4. Advances the cursor only on exact matches
   * 5. Handles partial completion states
   *
   * The complexity comes from Korean IME behavior - it can modify previous
   * characters as you type (e.g., ㅎ → 하 → 한 with three keystrokes).
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentLineTyped === currentLine) return;

    const newText = e.target.value;
    const wasBackspace = newText.length < currentLineTyped.length;
    const oldText = currentLineTyped;

    setCurrentLineTyped(newText);

    const targetAtIdx = currentLineJamo[jamoIndex];
    const vowelSeq = complexVowelSequences[targetAtIdx];
    const finalSeq = compoundFinalSequences[targetAtIdx];
    const seq = vowelSeq || finalSeq;
    const firstPart = seq?.[0];

    if (wasBackspace) {
      if (seq && textToJamoSequence(newText)[jamoIndex] === firstPart) {
        lockIndex(jamoIndex);
      }

      if (!textToJamoSequence(newText)[jamoIndex]) {
        unlockIndex(jamoIndex);
      }
    } else {
      if (seq && textToJamoSequence(newText)[jamoIndex] === targetAtIdx) {
        unlockIndex(jamoIndex);
      }
    }

    if (wasBackspace) {
      let newJamoIndex = 0;
      const newTextJamo = textToJamoSequence(newText);

      for (
        let i = 0;
        i < Math.min(newTextJamo.length, currentLineJamo.length);
        i++
      ) {
        if (newTextJamo[i] === currentLineJamo[i]) {
          newJamoIndex = i + 1;
        } else {
          break;
        }
      }

      setJamoIndex(newJamoIndex);
    } else {
      const newTextJamo = textToJamoSequence(newText);

      if (
        jamoIndex < currentLineJamo.length &&
        jamoIndex < newTextJamo.length
      ) {
        const targetAtCurrentPos = currentLineJamo[jamoIndex];
        const actualAtCurrentPos = newTextJamo[jamoIndex];

        if (actualAtCurrentPos === targetAtCurrentPos) {
          unlockIndex(jamoIndex);
          setJamoIndex((prev) => Math.min(prev + 1, currentLineJamo.length));
        }
      }
    }

    return newText;
  };

  const resetTyping = () => {
    setCurrentLineTyped("");
    setJamoIndex(0);
    setActiveKeys([]);
    clearAllLocks();
  };

  return {
    currentLineTyped,
    jamoIndex,
    activeKeys,
    shiftPressed,
    nextExpectedKey: smartGuidance.keys,
    guidanceMessage: smartGuidance.message,
    handleKeyDown,
    handleKeyUp,
    handleInputChange,
    resetTyping,
    clearAllLocks,
  };
}
