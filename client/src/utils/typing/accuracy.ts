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
