// apps/web/src/app/practice/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import KoreanKeyboard from "@/components/KoreanKeyboard";

/**
 * Korean Typing Practice page
 * Shows an on-screen keyboard, guides the next jamo, and tracks WPM/accuracy.
 */

const FLASH_MS = 120; // how long a key stays "lit" after you press it (ms)

// Physical QWERTY → jamo for live flashes
const qwertyToHangul: Record<string, string> = {
  KeyQ: "ㅂ",
  KeyW: "ㅈ",
  KeyE: "ㄷ",
  KeyR: "ㄱ",
  KeyT: "ㅅ",
  KeyY: "ㅛ",
  KeyU: "ㅕ",
  KeyI: "ㅑ",
  KeyO: "ㅐ",
  KeyP: "ㅔ",
  KeyA: "ㅁ",
  KeyS: "ㄴ",
  KeyD: "ㅇ",
  KeyF: "ㄹ",
  KeyG: "ㅎ",
  KeyH: "ㅗ",
  KeyJ: "ㅓ",
  KeyK: "ㅏ",
  KeyL: "ㅣ",
  KeyZ: "ㅋ",
  KeyX: "ㅌ",
  KeyC: "ㅊ",
  KeyV: "ㅍ",
  KeyB: "ㅠ",
  KeyN: "ㅜ",
  KeyM: "ㅡ",
};

// hangul decomposition helpers
// CHO(초성) = leading consonant, JUNG(중성) = vowel, JONG(종성) = trailing consonant.
const CHO = [
  "ㄱ",
  "ㄲ",
  "ㄴ",
  "ㄷ",
  "ㄸ",
  "ㄹ",
  "ㅁ",
  "ㅂ",
  "ㅃ",
  "ㅅ",
  "ㅆ",
  "ㅇ",
  "ㅈ",
  "ㅉ",
  "ㅊ",
  "ㅋ",
  "ㅌ",
  "ㅍ",
  "ㅎ",
];
const JUNG = [
  "ㅏ",
  "ㅐ",
  "ㅑ",
  "ㅒ",
  "ㅓ",
  "ㅔ",
  "ㅕ",
  "ㅖ",
  "ㅗ",
  "ㅘ",
  "ㅙ",
  "ㅚ",
  "ㅛ",
  "ㅜ",
  "ㅝ",
  "ㅞ",
  "ㅟ",
  "ㅠ",
  "ㅡ",
  "ㅢ",
  "ㅣ",
];
const JONG = [
  "",
  "ㄱ",
  "ㄲ",
  "ㄳ",
  "ㄴ",
  "ㄵ",
  "ㄶ",
  "ㄷ",
  "ㄹ",
  "ㄺ",
  "ㄻ",
  "ㄼ",
  "ㄽ",
  "ㄾ",
  "ㄿ",
  "ㅀ",
  "ㅁ",
  "ㅂ",
  "ㅄ",
  "ㅅ",
  "ㅆ",
  "ㅇ",
  "ㅈ",
  "ㅊ",
  "ㅋ",
  "ㅌ",
  "ㅍ",
  "ㅎ",
];

/** Split a single Hangul syllable into its jamo components. */
function decomposeSyllable(ch: string): string[] {
  const code = ch.charCodeAt(0);
  const base = 0xac00,
    end = 0xd7a3; // Hangul Syllables block
  if (code < base || code > end) return [ch]; // not a Hangul syllable

  // Reverse the Unicode composition formula:
  // index = (cho * 21 * 28) + (jung * 28) + jong
  const s = code - base;
  const cho = Math.floor(s / (21 * 28));
  const jung = Math.floor((s % (21 * 28)) / 28);
  const jong = s % 28;

  const parts = [CHO[cho], JUNG[jung]];
  if (JONG[jong]) parts.push(JONG[jong]); // add 종성 only if non-empty
  return parts;
}

/** Expands a whole string into a flat jamo sequence (spaces preserved). */
function jamoSequenceOf(text: string): string[] {
  const out: string[] = [];
  for (const ch of text) {
    if (ch === " ") {
      out.push(" ");
      continue;
    }
    out.push(...decomposeSyllable(ch));
  }
  return out;
}

/** Compare typed vs target at the word level and return a small report. */
function getWordAccuracy(typed: string, target: string) {
  const typedWords = typed
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);
  const targetWords = target
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);

  if (targetWords.length === 0)
    return {
      accuracy: 100,
      breakdown: [] as {
        status: "correct" | "incorrect" | "typing" | "pending";
        targetWord: string;
        typedWord: string;
        isCurrentlyTyping: boolean;
      }[],
      correctWords: 0,
      totalWords: 0,
    };

  const breakdown = targetWords.map((targetWord, i) => {
    const typedWord = typedWords[i];
    if (typedWord === undefined) {
      return {
        status: "pending",
        targetWord,
        typedWord: "",
        isCurrentlyTyping: false,
      } as const;
    }
    if (typedWord === targetWord) {
      return {
        status: "correct",
        targetWord,
        typedWord,
        isCurrentlyTyping: false,
      } as const;
    }

    // Check if this is the word currently being typed
    const isCurrentlyTyping =
      i === typedWords.length - 1 && !typed.endsWith(" ") && i < targetWords.length;

    return {
      status: isCurrentlyTyping ? "typing" : "incorrect",
      targetWord,
      typedWord,
      isCurrentlyTyping,
    } as const;
  });

  const correctCount = breakdown.filter((w) => w.status === "correct").length;
  const accuracy = Math.round((correctCount / targetWords.length) * 100);

  return {
    accuracy,
    breakdown,
    correctWords: correctCount,
    totalWords: targetWords.length,
  };
}

/** Character-by-character diff line */
function CharDiffLine({ target, typed }: { target: string; typed: string }) {
  return (
    <div className="text-2xl leading-relaxed mb-3 font-mono">
      {[...target].map((ch, i) => {
        const t = typed[i];
        const cls =
          t === undefined ? "text-gray-300" : t === ch ? "text-green-500" : "text-red-500";
        return (
          <span key={i} className={cls}>
            {ch}
          </span>
        );
      })}
    </div>
  );
}

export default function PracticePage() {
  // Lesson target
  const targetText = "한글 타자 연습";

  // State
  const [typedText, setTypedText] = useState("");
  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  const [shiftActive, setShiftActive] = useState(false);

  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);

  // Derived: target jamo sequence + current index
  const targetJamoSeq = useMemo(() => jamoSequenceOf(targetText), [targetText]);
  const [jamoIndex, setJamoIndex] = useState(0);

  // Derived: word accuracy stats
  const wordStats = useMemo(
    () => getWordAccuracy(typedText, targetText),
    [typedText, targetText]
  );

  //  Key flash timeouts 
  const flashTimeoutsRef = useRef<Record<string, number>>({});

  // Clear any pending flashes 
  useEffect(() => {
    return () => {
      Object.values(flashTimeoutsRef.current).forEach((id) => clearTimeout(id));
    };
  }, []);

  // Flash a key briefly on the on-screen keyboard 
  const flashKey = (jamo: string) => {
    setActiveKeys((prev) => (prev.includes(jamo) ? prev : [...prev, jamo]));
    if (flashTimeoutsRef.current[jamo]) clearTimeout(flashTimeoutsRef.current[jamo]);
    flashTimeoutsRef.current[jamo] = window.setTimeout(() => {
      setActiveKeys((prev) => prev.filter((k) => k !== jamo));
      delete flashTimeoutsRef.current[jamo];
    }, FLASH_MS);
  };

  // Keyboard events 
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // track Shift visual state 
    if (e.key === "Shift") {
      setShiftActive(true);
      return;
    }

    // Ignore Backspace (handled in onChange)
    if (e.key === "Backspace") {
      return;
    }

    // SPACE: flash and advance if expected
    if (e.code === "Space") {
      flashKey(" ");
      if (targetJamoSeq[jamoIndex] === " ") {
        setJamoIndex((i) => Math.min(i + 1, targetJamoSeq.length));
      }
      return;
    }

    // Letters: map physical key to jamo → flash → advance guide if it matches
    const jamo = qwertyToHangul[e.code];
    if (!jamo) return;

    flashKey(jamo);

    const expected = targetJamoSeq[jamoIndex];
    if (expected && expected !== " " && jamo === expected) {
      setJamoIndex((i) => Math.min(i + 1, targetJamoSeq.length));
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Shift") setShiftActive(false);
  };

  // Input change (for handling backspace and full text)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (startTime === null) setStartTime(Date.now());

    const newTypedText = e.target.value;
    const oldTypedText = typedText;

    setTypedText(newTypedText);

    // Detect if this was a backspace 
    const wasBackspace = newTypedText.length < oldTypedText.length;

    if (wasBackspace) {
      // User deleted something - move index back to new end
      const typedJamoSeq = jamoSequenceOf(newTypedText);
      setJamoIndex(typedJamoSeq.length);
    } else {
      // User added text: only advance if last jamo matches whats expected at that position
      const typedJamoSeq = jamoSequenceOf(newTypedText);
      if (typedJamoSeq.length <= targetJamoSeq.length) {
        const lastTypedJamo = typedJamoSeq[typedJamoSeq.length - 1];
        const expectedJamo = targetJamoSeq[typedJamoSeq.length - 1];

        if (lastTypedJamo === expectedJamo) {
          setJamoIndex(typedJamoSeq.length);
        }
      }
    }
  };

  // Stats calculation: recompute WPM after text changes
  useEffect(() => {
    if (!startTime) return;

    const elapsedMinutes = (Date.now() - startTime) / 1000 / 60;
    // WPM based on correct words 
    const newWpm = Math.max(0, Math.round(wordStats.correctWords / elapsedMinutes));

    setWpm(newWpm);
  }, [typedText, startTime, wordStats.correctWords]);

  //Guide the next expected jamo
  const guideKeys = useMemo(() => {
    const next = targetJamoSeq[jamoIndex];
    return next ? [next] : [];
  }, [targetJamoSeq, jamoIndex]);

  return (
    <div className="min-h-screen max-h-screen overflow-hidden flex flex-col p-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900">Korean Typing Practice</h1>

        {/* Compact stats */}
        <div className="flex items-center gap-3 text-sm bg-gray-50 px-4 py-2 rounded-lg">
          <div className="text-center">
            <div className="text-base font-semibold text-blue-600">{wpm}</div>
            <div className="text-xs text-gray-500">WPM</div>
          </div>
          <div className="text-center">
            <div className="text-base font-semibold text-green-600">{wordStats.accuracy}%</div>
            <div className="text-xs text-gray-500">Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-base font-semibold text-purple-600">
              {wordStats.correctWords}/{wordStats.totalWords}
            </div>
            <div className="text-xs text-gray-500">Words</div>
          </div>
        </div>
      </div>

      {/* Target section */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 flex-shrink-0">
        <CharDiffLine target={targetText} typed={typedText} />

        {/* Word pills */}
        <div className="flex gap-2 mb-3">
          {wordStats.breakdown.map((word, index) => {
            const getStatusColor = (status: string) => {
              switch (status) {
                case "correct":
                  return "bg-green-500 text-white";
                case "incorrect":
                  return "bg-red-500 text-white";
                case "typing":
                  return "bg-blue-500 text-white animate-pulse";
                default:
                  return "bg-gray-200 text-gray-600";
              }
            };

            const getStatusIcon = (status: string) => {
              switch (status) {
                case "correct":
                  return "✓";
                case "incorrect":
                  return "✗";
                case "typing":
                  return "●";
                default:
                  return "○";
              }
            };

            return (
              <div
                key={index}
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  word.status
                )}`}
              >
                <span className="mr-1">{getStatusIcon(word.status)}</span>
                {word.targetWord}
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">Progress</span>
          <span className="text-sm text-gray-500">
            {wordStats.correctWords} of {wordStats.totalWords} completed
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
            style={{
              width: typedText.length === 0 ? "0%" : `${wordStats.accuracy}%`,
            }}
          />
        </div>
      </div>

      {/* Input */}
      <input
        type="text"
        className="w-full p-4 text-xl border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4 flex-shrink-0 bg-white shadow-sm"
        value={typedText}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        placeholder="Start typing the Korean text above..."
      />

      {/* Keyboard */}
      <div className="flex-1 flex items-center justify-center min-h-0">
        <div className="transform scale-110 origin-center">
          <KoreanKeyboard activeKeys={activeKeys} guideKeys={guideKeys} shiftActive={shiftActive} />
        </div>
      </div>

      {/* Completion overlay */}
      {typedText === targetText && (
        <div className="fixed top-4 left-4 right-4 bg-gradient-to-r from-green-400 to-blue-500 text-white p-4 rounded-lg text-center shadow-lg z-10 max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-lg font-bold">🎉 Perfect! Lesson Complete!</div>
              <div className="text-sm opacity-90">
                You achieved {wpm} WPM with {wordStats.accuracy}% accuracy
              </div>
            </div>
            <button
              onClick={() => {
                setTypedText("");
                setStartTime(null);
                setJamoIndex(0);
                setActiveKeys([]);
              }}
              className="ml-4 px-4 py-2 bg-white text-blue-600 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors shadow-sm border"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}