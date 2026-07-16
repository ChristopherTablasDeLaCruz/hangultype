import { describe, it, expect } from "vitest";
import { calculateWPM, calculateKeystrokeAccuracy } from "./accuracy";

describe("calculateWPM", () => {
  it("uses the standard 5-chars-per-word formula", () => {
    expect(calculateWPM(100, 1)).toBe(20);
  });

  it("rounds to the nearest integer", () => {
    expect(calculateWPM(101, 1)).toBe(20); // 20.2
    expect(calculateWPM(104, 1)).toBe(21); // 20.8
  });

  it("returns 0 for zero or negative duration", () => {
    expect(calculateWPM(100, 0)).toBe(0);
    expect(calculateWPM(100, -1)).toBe(0);
  });
});

describe("calculateKeystrokeAccuracy", () => {
  it("returns 100 before any keys are pressed", () => {
    expect(calculateKeystrokeAccuracy(0, 0)).toBe(100);
  });

  it("computes the error ratio", () => {
    expect(calculateKeystrokeAccuracy(100, 5)).toBe(95);
  });

  it("clamps at 0 when errors exceed keystrokes", () => {
    expect(calculateKeystrokeAccuracy(10, 20)).toBe(0);
  });

  it("rounds to the nearest integer", () => {
    expect(calculateKeystrokeAccuracy(3, 1)).toBe(67);
  });
});
