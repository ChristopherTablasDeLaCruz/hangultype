// src/utils/typing/accuracy.ts

export interface AccuracyStats {
  accuracy: number;
  correctWords: number;
  totalWords: number;
}

// Word-level accuracy
export function calculateAccuracy(
  typed: string,
  target: string
): AccuracyStats {
  const typedWords = typed
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);
  const targetWords = target
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);

  // Edge case - nothing to compare against
  if (targetWords.length === 0)
    return { accuracy: 100, correctWords: 0, totalWords: 0 };

  // Only count words that match exactly in the right position
  const correctWords = typedWords.filter(
    (word, i) => word === targetWords[i]
  ).length;

  const accuracy = Math.round((correctWords / targetWords.length) * 100);

  return {
    accuracy,
    correctWords,
    totalWords: targetWords.length,
  };
}
