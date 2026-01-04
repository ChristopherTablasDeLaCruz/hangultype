// src/hooks/useKoreanTyping.ts
import { useState, useRef, useMemo } from "react";
import {
  qwertyToKorean,
  complexVowelSequences,
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
  currentLineJamo: string[]
) {
  // Typing state
  const [currentLineTyped, setCurrentLineTyped] = useState("");
  const [jamoIndex, setJamoIndex] = useState(0);

  // Complex character handling
  const [lockedMedialIndices, setLockedMedialIndices] = useState<Set<number>>(
    new Set()
  );

  // Keyboard feedback
  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  const [shiftPressed, setShiftPressed] = useState(false);
  const flashTimeouts = useRef<Record<string, number>>({});

  // Lock indices when complex vowels get into weird IME states
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

  // Flash key visual feedback
  const flashKey = (jamo: string) => {
    setActiveKeys((prev) => (prev.includes(jamo) ? prev : [...prev, jamo]));

    if (flashTimeouts.current[jamo]) clearTimeout(flashTimeouts.current[jamo]);

    flashTimeouts.current[jamo] = window.setTimeout(() => {
      setActiveKeys((prev) => prev.filter((k) => k !== jamo));
      delete flashTimeouts.current[jamo];
    }, KEY_FLASH_MS);
  };

  // Show what key to press next based on current typing state
  const smartGuidance = useMemo(() => {
    return getSmartGuidance(
      currentLineJamo,
      jamoIndex,
      currentLineTyped,
      shiftPressed,
      lockedMedialIndices,
      lockIndex
    );
  }, [
    currentLineJamo,
    jamoIndex,
    currentLineTyped,
    shiftPressed,
    lockedMedialIndices,
  ]);

  // Keyboard handlers
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Shift") {
      setShiftPressed(true);
      return;
    }

    if (e.key === "Backspace") return; // Let onChange handle this

    // Flash the corresponding Korean key
    if (e.code === "Space") {
      flashKey(" ");
      return;
    }

    const koreanKey = qwertyToKorean[e.code];
    if (koreanKey) {
      flashKey(koreanKey);

      // Check if they're pressing the right key, but don't move cursor yet
      const expected = currentLineJamo[jamoIndex];
      if (expected && expected !== " ") {
        const typedJamo = textToJamoSequence(currentLineTyped);
        const expectedGuidance = getGuidanceForCharacter(
          expected,
          getSequenceProgress(expected, typedJamo)
        );

        // Flash feedback if they're on the right track
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

  // Handle text input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Don't allow changes if line is already complete
    if (currentLineTyped === currentLine) return;

    const newText = e.target.value;
    const wasBackspace = newText.length < currentLineTyped.length;
    const oldText = currentLineTyped;

    setCurrentLineTyped(newText);

    // Handle locking/unlocking for complex vowels that need multiple keystrokes
    const targetAtIdx = currentLineJamo[jamoIndex];
    const seq = complexVowelSequences[targetAtIdx];
    const firstPart = seq?.[0];

    if (wasBackspace) {
      // User typed the first part but needs to complete the vowel
      if (seq && textToJamoSequence(newText)[jamoIndex] === firstPart) {
        lockIndex(jamoIndex);
      }

      // Slot is now empty, so unlock it for fresh typing
      if (!textToJamoSequence(newText)[jamoIndex]) {
        unlockIndex(jamoIndex);
      }
    } else {
      // They successfully typed the complete complex vowel
      if (seq && textToJamoSequence(newText)[jamoIndex] === targetAtIdx) {
        unlockIndex(jamoIndex);
      }
    }

    // Only advance the cursor when characters match exactly
    if (wasBackspace) {
      // Find where we should be based on what actually matches
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

      // Only advance if we have a perfect match at the current position
      if (
        jamoIndex < currentLineJamo.length &&
        jamoIndex < newTextJamo.length
      ) {
        const targetAtCurrentPos = currentLineJamo[jamoIndex];
        const actualAtCurrentPos = newTextJamo[jamoIndex];

        // Only advance on exact match
        if (actualAtCurrentPos === targetAtCurrentPos) {
          unlockIndex(jamoIndex);
          setJamoIndex((prev) => Math.min(prev + 1, currentLineJamo.length));
        }
      }
    }

    return newText;
  };

  // Reset function
  const resetTyping = () => {
    setCurrentLineTyped("");
    setJamoIndex(0);
    setActiveKeys([]);
    clearAllLocks();
  };

  return {
    // State
    currentLineTyped,
    jamoIndex,
    activeKeys,
    shiftPressed,

    // Guidance
    nextExpectedKey: smartGuidance.keys,
    guidanceMessage: smartGuidance.message,

    // Handlers
    handleKeyDown,
    handleKeyUp,
    handleInputChange,

    // Actions
    resetTyping,
    clearAllLocks,
  };
}
