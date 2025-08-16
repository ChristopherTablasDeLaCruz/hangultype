// apps/web/src/app/practice/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import KoreanKeyboard from "@/components/KoreanKeyboard";

// Physical QWERTY → jamo for live flashes
const qwertyToHangul: Record<string, string> = {
  KeyQ:"ㅂ", KeyW:"ㅈ", KeyE:"ㄷ", KeyR:"ㄱ", KeyT:"ㅅ",
  KeyY:"ㅛ", KeyU:"ㅕ", KeyI:"ㅑ", KeyO:"ㅐ", KeyP:"ㅔ",
  KeyA:"ㅁ", KeyS:"ㄴ", KeyD:"ㅇ", KeyF:"ㄹ", KeyG:"ㅎ",
  KeyH:"ㅗ", KeyJ:"ㅓ", KeyK:"ㅏ", KeyL:"ㅣ",
  KeyZ:"ㅋ", KeyX:"ㅌ", KeyC:"ㅊ", KeyV:"ㅍ", KeyB:"ㅠ", KeyN:"ㅜ", KeyM:"ㅡ",
};

// ---- Hangul decomposition helpers ----
const CHO = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
const JUNG = ["ㅏ","ㅐ","ㅑ","ㅒ","ㅓ","ㅔ","ㅕ","ㅖ","ㅗ","ㅘ","ㅙ","ㅚ","ㅛ","ㅜ","ㅝ","ㅞ","ㅟ","ㅠ","ㅡ","ㅢ","ㅣ"];
const JONG = ["", "ㄱ","ㄲ","ㄳ","ㄴ","ㄵ","ㄶ","ㄷ","ㄹ","ㄺ","ㄻ","ㄼ","ㄽ","ㄾ","ㄿ","ㅀ","ㅁ","ㅂ","ㅄ","ㅅ","ㅆ","ㅇ","ㅈ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];

function decomposeSyllable(ch: string): string[] {
  const code = ch.charCodeAt(0);
  const base = 0xac00, end = 0xd7a3; // Hangul Syllables block
  if (code < base || code > end) return [ch]; // not a Hangul syllable
  const s = code - base;
  const cho = Math.floor(s / (21 * 28));
  const jung = Math.floor((s % (21 * 28)) / 28);
  const jong = s % 28;
  const parts = [CHO[cho], JUNG[jung]];
  if (JONG[jong]) parts.push(JONG[jong]);
  return parts;
}

function jamoSequenceOf(text: string): string[] {
  const out: string[] = [];
  for (const ch of text) {
    if (ch === " ") { out.push(" "); continue; }
    out.push(...decomposeSyllable(ch));
  }
  return out;
}
// -----------------------------------------------

export default function PracticePage() {
  const targetText = "한글 타자 연습";

  const [typedText, setTypedText] = useState("");
  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  const [shiftActive, setShiftActive] = useState(false);

  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);

  // Decomposed target jamo sequence
  const targetJamoSeq = useMemo(() => jamoSequenceOf(targetText), [targetText]);
  const [jamoCursor, setJamoCursor] = useState(0);

  // timers per key for flashing
  const timeoutsRef = useRef<Record<string, number>>({});

  const flashKey = (jamo: string) => {
    setActiveKeys((prev) => (prev.includes(jamo) ? prev : [...prev, jamo]));
    if (timeoutsRef.current[jamo]) clearTimeout(timeoutsRef.current[jamo]);
    timeoutsRef.current[jamo] = window.setTimeout(() => {
      setActiveKeys((prev) => prev.filter((k) => k !== jamo));
      delete timeoutsRef.current[jamo];
    }, 120);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // track Shift visual state
    if (e.key === "Shift") { setShiftActive(true); return; }

    // SPACE: flash and advance if expected
    if (e.code === "Space") {
      flashKey(" ");
      if (targetJamoSeq[jamoCursor] === " ") {
        setJamoCursor((i) => Math.min(i + 1, targetJamoSeq.length));
      }
      return;
    }

    // Letters: map physical key to jamo → flash → advance guide if it matches
    const jamo = qwertyToHangul[e.code];
    if (!jamo) return;

    flashKey(jamo);

    const expected = targetJamoSeq[jamoCursor];
    if (expected && expected !== " " && jamo === expected) {
      setJamoCursor((i) => Math.min(i + 1, targetJamoSeq.length));
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Shift") setShiftActive(false);
  };

  // IME-composed text + start timer
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (startTime === null) setStartTime(Date.now());
    setTypedText(e.target.value);
  };

  // Stats Calculation
  useEffect(() => {
    if (!startTime) return;
    const elapsedMinutes = (Date.now() - startTime) / 1000 / 60;
    const wordsTyped = typedText.length / 5;
    setWpm(Math.max(0, Math.round(wordsTyped / elapsedMinutes)));

    let correct = 0;
    for (let i = 0; i < typedText.length; i++) {
      if (typedText[i] === targetText[i]) correct++;
    }
    setAccuracy(typedText.length ? Math.round((correct / typedText.length) * 100) : 100);
  }, [typedText, startTime, targetText]);

  // Guide the next expected jamo (including space)
  const guideKeys = useMemo(() => {
    const next = targetJamoSeq[jamoCursor];
    return next ? [next] : [];
  }, [targetJamoSeq, jamoCursor]);

  // Render target with correctness coloring
  const TargetLine = () => (
    <div className="p-4 rounded bg-gray-100 leading-8 text-xl">
      {[...targetText].map((ch, i) => {
        const typed = typedText[i];
        let cls = "text-gray-400";
        if (typed !== undefined) cls = typed === ch ? "text-green-600" : "text-red-500";
        return <span key={i} className={cls}>{ch}</span>;
      })}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Practice</h1>

      <TargetLine />

      <input
        type="text"
        className="w-full p-4 border rounded text-lg"
        value={typedText}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        placeholder="Start typing..."
      />

      <div className="flex gap-4">
        <div>WPM: {wpm}</div>
        <div>Accuracy: {accuracy}%</div>
      </div>

      {/* Pressed (blue) + Guide (amber) + Shift + Space */}
      <KoreanKeyboard
        activeKeys={activeKeys}
        guideKeys={guideKeys}
        shiftActive={shiftActive}
      />
    </div>
  );
}