import { describe, it, expect } from "vitest";
import { getSmartGuidance } from "./guidance";
import { textToJamoSequence } from "./decomposition";

/**
 * Helper: getSmartGuidance decomposes the typed string itself, so tests pass
 * realistic composed/partial strings the way the IME would produce them.
 */
function guide(
  target: string,
  jamoIndex: number,
  typed: string,
  opts: { shift?: boolean; locked?: number[] } = {},
) {
  return getSmartGuidance(
    textToJamoSequence(target),
    jamoIndex,
    typed,
    opts.shift ?? false,
    new Set(opts.locked ?? []),
  );
}

describe("simple jamo", () => {
  it("prompts the target character when nothing is typed", () => {
    expect(guide("ㅗ ㅗ", 0, "")).toEqual({
      keys: ["ㅗ"],
      message: "Type ㅗ",
    });
  });

  it("prompts Space for a space target", () => {
    expect(guide("ㅗ ㅗ", 1, "ㅗ")).toEqual({
      keys: [" "],
      message: "Press Space",
    });
  });

  it("returns no keys while waiting for the cursor to advance", () => {
    // typed char matches target at the current position
    expect(guide("ㅗ", 0, "ㅗ").keys).toEqual([]);
  });

  it("asks for backspace on a wrong character", () => {
    expect(guide("ㅗ ㅗ", 2, "ㅗ ㅏ")).toEqual({
      keys: ["backspace"],
      message: "Backspace and try again for ㅗ",
    });
  });

  it("returns no keys when the line is complete", () => {
    expect(guide("ㅗ", 1, "ㅗ")).toEqual({ keys: [] });
  });
});

describe("earlier mistakes", () => {
  it("points backwards when a previous position is wrong", () => {
    expect(guide("ㅏㅣ", 1, "ㅓ")).toEqual({
      keys: ["backspace"],
      message: "Backspace to fix the earlier mistake(s)",
    });
  });

  it("tolerates a partial complex vowel at an earlier position", () => {
    // ㅡ at position 0 is a valid first half of target ㅢ, not a mistake
    const result = guide("ㅢㅏ", 1, "ㅡ");
    expect(result.message).not.toContain("earlier mistake");
  });
});

describe("complex vowels (e.g. ㅢ = ㅡ + ㅣ)", () => {
  it("prompts the first component from empty", () => {
    expect(guide("ㅢ", 0, "")).toEqual({
      keys: ["ㅡ"],
      message: "Type ㅡ then ㅣ to make ㅢ",
    });
  });

  it("prompts the second component after the first", () => {
    expect(guide("ㅢ", 0, "ㅡ")).toEqual({
      keys: ["ㅣ"],
      message: "Add ㅣ to complete ㅢ",
    });
  });

  it("accepts the composed character", () => {
    expect(guide("ㅢ", 0, "ㅢ").keys).toEqual([]);
  });

  it("locks the slot when extra jamo corrupt the composition", () => {
    const result = guide("ㅢ", 0, "ㅡㅏ");
    expect(result.keys).toEqual(["backspace"]);
    expect(result.lockCurrentIndex).toBe(true);
    expect(result.message).toContain("Backspace until this slot is empty");
  });

  it("keeps demanding backspace while the slot is locked", () => {
    // even though "ㅡ" alone would normally be valid partial progress
    const result = guide("ㅢ", 0, "ㅡ", { locked: [0] });
    expect(result.keys).toEqual(["backspace"]);
    expect(result.message).toContain("Backspace until this slot is empty");
    expect(result.lockCurrentIndex).toBeUndefined();
  });

  it("restarts on a wrong first component without locking", () => {
    const result = guide("ㅢ", 0, "ㅏ");
    expect(result.keys).toEqual(["backspace"]);
    expect(result.lockCurrentIndex).toBeUndefined();
  });
});

describe("compound finals (e.g. ㄺ = ㄹ + ㄱ in 닭)", () => {
  const target = "닭"; // ㄷ ㅏ ㄺ

  it("prompts the first component of the final", () => {
    expect(guide(target, 2, "다")).toEqual({
      keys: ["ㄹ"],
      message: "Type ㄹ then ㄱ to make ㄺ",
    });
  });

  it("prompts the second component after the first", () => {
    expect(guide(target, 2, "달")).toEqual({
      keys: ["ㄱ"],
      message: "Add ㄱ to complete ㄺ",
    });
  });

  it("accepts the composed syllable", () => {
    expect(guide(target, 2, "닭").keys).toEqual([]);
  });

  it("locks on corrupting extra jamo", () => {
    const result = guide(target, 2, "달ㅁ");
    expect(result.keys).toEqual(["backspace"]);
    expect(result.lockCurrentIndex).toBe(true);
  });
});

describe("double consonants as initials (Shift + base)", () => {
  const target = "따"; // ㄸ ㅏ

  it("prompts Shift first when Shift is not held", () => {
    expect(guide(target, 0, "")).toEqual({
      keys: ["shift"],
      message: "Hold Shift, then press ㄷ for ㄸ",
    });
  });

  it("prompts the base key once Shift is held", () => {
    expect(guide(target, 0, "", { shift: true })).toEqual({ keys: ["ㄷ"] });
  });

  it("guides Shift+base when only the plain base was typed", () => {
    expect(guide(target, 0, "ㄷ")).toEqual({
      keys: ["shift", "ㄷ"],
      message: "Hold Shift and press ㄷ for ㄸ",
    });
  });

  it("accepts the double consonant", () => {
    expect(guide(target, 0, "ㄸ").keys).toEqual([]);
  });
});

describe("double consonants in final position (ㅆ/ㄲ)", () => {
  // NOTE: these encode the app's assumption that a final ㅆ is typed
  // base+base (갓 + ㅅ → 갔). Whether a given OS IME composes this way
  // varies — see isFinalConsonantPosition.
  const target = "갔"; // ㄱ ㅏ ㅆ

  it("prompts double-tap instead of Shift in final position", () => {
    expect(guide(target, 2, "가")).toEqual({
      keys: ["ㅅ"],
      message: "Type ㅅ twice to make ㅆ",
    });
  });

  it("prompts the second tap after the first", () => {
    expect(guide(target, 2, "갓")).toEqual({
      keys: ["ㅅ"],
      message: "Type ㅅ again to complete ㅆ",
    });
  });

  it("accepts the composed syllable", () => {
    expect(guide(target, 2, "갔").keys).toEqual([]);
  });

  it("still uses Shift for ㅆ as an initial", () => {
    // 싸: ㅆ at index 0 is an initial, not a final
    expect(guide("싸", 0, "")).toEqual({
      keys: ["shift"],
      message: "Hold Shift, then press ㅅ for ㅆ",
    });
  });
});

describe("shift vowels (ㅒ/ㅖ)", () => {
  it("prompts Shift + base", () => {
    expect(guide("ㅒ", 0, "")).toEqual({
      keys: ["shift"],
      message: "Hold Shift, then press ㅐ for ㅒ",
    });
    expect(guide("ㅒ", 0, "", { shift: true })).toEqual({ keys: ["ㅐ"] });
  });

  it("guides Shift+base when the plain base was typed", () => {
    expect(guide("ㅖ", 0, "ㅔ")).toEqual({
      keys: ["shift", "ㅔ"],
      message: "Hold Shift and press ㅔ for ㅖ",
    });
  });
});

describe("guidance inside composed syllables", () => {
  it("tracks the cursor through a partially composed syllable", () => {
    // target 한, typed 하 (intermediate IME state): next key is ㄴ
    expect(guide("한", 2, "하")).toEqual({
      keys: ["ㄴ"],
      message: "Type ㄴ",
    });
  });

  it("survives IME resyllabification of earlier syllables", () => {
    // target 하나, typed 한 (the ㄴ will migrate when ㅏ is typed)
    expect(guide("하나", 3, "한")).toEqual({
      keys: ["ㅏ"],
      message: "Type ㅏ",
    });
  });
});
