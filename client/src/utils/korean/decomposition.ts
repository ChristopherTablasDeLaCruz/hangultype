import {
  CONSONANTS,
  VOWELS,
  FINALS,
  complexVowelSequences,
  doubleConsonantMappings,
  shiftVowelMappings,
} from "./mappings";

// syllable = 0xAC00 + (initialIndex × 588) + (vowelIndex × 28) + finalIndex
export function breakDownSyllable(char: string): string[] {
  const code = char.charCodeAt(0);

  if (code < 0xac00 || code > 0xd7a3) return [char];

  const syllableIndex = code - 0xac00;
  const consonantIndex = Math.floor(syllableIndex / (21 * 28));
  const vowelIndex = Math.floor((syllableIndex % (21 * 28)) / 28);
  const finalIndex = syllableIndex % 28;

  const parts = [CONSONANTS[consonantIndex], VOWELS[vowelIndex]];
  if (FINALS[finalIndex]) parts.push(FINALS[finalIndex]);

  return parts;
}

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
