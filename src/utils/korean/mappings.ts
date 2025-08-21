// src/utils/korean/mappings.ts
// How long to flash keys when user presses them
export const KEY_FLASH_MS = 120;

// Map QWERTY keys to Korean characters for keyboard highlighting
export const qwertyToKorean: Record<string, string> = {
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

// Complex vowels - what keys to press in sequence
export const complexVowelSequences: Record<string, string[]> = {
  ㅢ: ["ㅡ", "ㅣ"], // M + L
  ㅘ: ["ㅗ", "ㅏ"], // H + K
  ㅙ: ["ㅗ", "ㅐ"], // H + O
  ㅚ: ["ㅗ", "ㅣ"], // H + L
  ㅝ: ["ㅜ", "ㅓ"], // N + J
  ㅞ: ["ㅜ", "ㅔ"], // N + P
  ㅟ: ["ㅜ", "ㅣ"], // N + L
};

// Double consonants - need shift key
export const doubleConsonantMappings: Record<
  string,
  { base: string; needsShift: boolean }
> = {
  ㄲ: { base: "ㄱ", needsShift: true }, // Shift + R
  ㄸ: { base: "ㄷ", needsShift: true }, // Shift + E
  ㅃ: { base: "ㅂ", needsShift: true }, // Shift + Q
  ㅆ: { base: "ㅅ", needsShift: true }, // Shift + T
  ㅉ: { base: "ㅈ", needsShift: true }, // Shift + W
};

// Shift vowels
export const shiftVowelMappings: Record<
  string,
  { base: string; needsShift: boolean }
> = {
  ㅒ: { base: "ㅐ", needsShift: true }, // Shift + O
  ㅖ: { base: "ㅔ", needsShift: true }, // Shift + P
};

// Korean building blocks
export const CONSONANTS = [
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
export const VOWELS = [
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
export const FINALS = [
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
