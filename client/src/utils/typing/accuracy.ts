export interface AccuracyStats {
  accuracy: number;
  correctWords: number;
  totalWords: number;
}

export function calculateWPM(charCount: number, timeInMinutes: number): number {
  if (timeInMinutes <= 0) return 0;
  const wpm = charCount / 5 / timeInMinutes;
  return Math.round(wpm);
}

export function calculateKeystrokeAccuracy(
  totalKeys: number,
  errorCount: number,
): number {
  if (totalKeys === 0) return 100;
  const accuracy = ((totalKeys - errorCount) / totalKeys) * 100;
  return Math.max(0, Math.round(accuracy));
}

export function calculateAccuracy(
  typed: string,
  target: string,
): AccuracyStats {
  const typedWords = typed
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);
  const targetWords = target
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);

  if (targetWords.length === 0)
    return { accuracy: 100, correctWords: 0, totalWords: 0 };

  const correctWords = typedWords.filter(
    (word, i) => word === targetWords[i],
  ).length;

  const accuracy = Math.round((correctWords / targetWords.length) * 100);

  return {
    accuracy,
    correctWords,
    totalWords: targetWords.length,
  };
}
