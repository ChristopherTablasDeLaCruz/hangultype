import { describe, it, expect } from "vitest";
import { splitTextIntoLines } from "./textSplitting";

describe("splitTextIntoLines", () => {
  it("returns text without spaces as a single line", () => {
    expect(splitTextIntoLines("안녕하세요")).toEqual(["안녕하세요"]);
  });

  it("wraps short-token drills (single jamo separated by spaces)", () => {
    expect(splitTextIntoLines("ㅏ ㅏ ㅏ ㅏ ㅏ", 5)).toEqual([
      "ㅏ ㅏ ㅏ",
      "ㅏ ㅏ",
    ]);
  });

  it("never exceeds maxLength on drill lines", () => {
    const drill = Array(50).fill("ㅗ").join(" ");
    const lines = splitTextIntoLines(drill, 35);
    expect(lines.length).toBeGreaterThan(1);
    for (const line of lines) {
      expect(line.length).toBeLessThanOrEqual(35);
    }
    // no tokens lost
    expect(lines.join(" ")).toBe(drill);
  });

  it("splits sentence text at sentence boundaries", () => {
    expect(splitTextIntoLines("가나다. 라마바. 사아자.", 8)).toEqual([
      "가나다.",
      "라마바.",
      "사아자.",
    ]);
  });

  it("keeps sentences together when they fit on one line", () => {
    expect(splitTextIntoLines("가나. 다라.", 40)).toEqual(["가나. 다라."]);
  });

  it("breaks an over-long sentence at word boundaries", () => {
    const text = "하나 둘 셋 넷 다섯 여섯 일곱 여덟";
    const lines = splitTextIntoLines(text, 10);
    for (const line of lines) {
      expect(line.length).toBeLessThanOrEqual(10);
    }
    expect(lines.join(" ")).toBe(text);
  });

  it("returns no empty lines", () => {
    expect(splitTextIntoLines("가나다.  ", 40)).not.toContain("");
  });
});
