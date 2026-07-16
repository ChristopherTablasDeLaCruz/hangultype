import { describe, it, expect } from "vitest";
import { breakDownSyllable, textToJamoSequence } from "./decomposition";

describe("breakDownSyllable", () => {
  it("splits a CV syllable into initial + vowel", () => {
    expect(breakDownSyllable("가")).toEqual(["ㄱ", "ㅏ"]);
  });

  it("splits a CVC syllable into initial + vowel + final", () => {
    expect(breakDownSyllable("한")).toEqual(["ㅎ", "ㅏ", "ㄴ"]);
  });

  it("keeps complex vowels as a single jamo", () => {
    expect(breakDownSyllable("과")).toEqual(["ㄱ", "ㅘ"]);
    expect(breakDownSyllable("의")).toEqual(["ㅇ", "ㅢ"]);
  });

  it("keeps compound finals as a single jamo", () => {
    expect(breakDownSyllable("닭")).toEqual(["ㄷ", "ㅏ", "ㄺ"]);
    expect(breakDownSyllable("값")).toEqual(["ㄱ", "ㅏ", "ㅄ"]);
  });

  it("handles the first and last syllables of the Unicode block", () => {
    expect(breakDownSyllable("가")).toEqual(["ㄱ", "ㅏ"]); // U+AC00
    expect(breakDownSyllable("힣")).toEqual(["ㅎ", "ㅣ", "ㅎ"]); // U+D7A3
  });

  it("passes through standalone jamo unchanged", () => {
    expect(breakDownSyllable("ㅏ")).toEqual(["ㅏ"]);
    expect(breakDownSyllable("ㄺ")).toEqual(["ㄺ"]);
  });

  it("passes through non-Korean characters unchanged", () => {
    expect(breakDownSyllable("A")).toEqual(["A"]);
    expect(breakDownSyllable(".")).toEqual(["."]);
  });
});

describe("textToJamoSequence", () => {
  it("decomposes multi-syllable text", () => {
    expect(textToJamoSequence("안녕")).toEqual([
      "ㅇ",
      "ㅏ",
      "ㄴ",
      "ㄴ",
      "ㅕ",
      "ㅇ",
    ]);
  });

  it("preserves spaces as their own entries", () => {
    expect(textToJamoSequence("가 나")).toEqual(["ㄱ", "ㅏ", " ", "ㄴ", "ㅏ"]);
  });

  it("handles mixed jamo and syllables (drill text)", () => {
    expect(textToJamoSequence("ㅗ 한")).toEqual(["ㅗ", " ", "ㅎ", "ㅏ", "ㄴ"]);
  });

  it("is invariant under IME resyllabification", () => {
    // 한 + ㅏ recomposes to 하나, but the jamo sequence is identical —
    // this invariant is what makes jamo-level cursor tracking work.
    expect(textToJamoSequence("하나")).toEqual(textToJamoSequence("한") .concat(["ㅏ"]));
  });

  it("returns empty array for empty input", () => {
    expect(textToJamoSequence("")).toEqual([]);
  });
});
