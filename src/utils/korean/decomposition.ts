// src/utils/korean/decomposition.ts

import {
  CONSONANTS,
  VOWELS,
  FINALS,
  complexVowelSequences,
  doubleConsonantMappings,
  shiftVowelMappings,
} from "./mappings";

// Break Korean syllables into their component parts
export function breakDownSyllable(char: string): string[] {
  const code = char.charCodeAt(0);

  // Only works on actual Korean syllables
  if (code < 0xac00 || code > 0xd7a3) return [char];

  // Unicode math to extract the parts
  const syllableIndex = code - 0xac00;
  const consonantIndex = Math.floor(syllableIndex / (21 * 28));
  const vowelIndex = Math.floor((syllableIndex % (21 * 28)) / 28);
  const finalIndex = syllableIndex % 28;

  const parts = [CONSONANTS[consonantIndex], VOWELS[vowelIndex]];
  if (FINALS[finalIndex]) parts.push(FINALS[finalIndex]);

  return parts;
}

// Convert text into individual jamo (keeps spaces intact)
export function textToJamoSequence(text: string): string[] {
  const jamo: string[] = [];

  for (const char of text) {
    if (char === " ") {
      jamo.push(" ");
    } else {
      jamo.push(...breakDownSyllable(char));
    }
  }

  return jamo;
}
