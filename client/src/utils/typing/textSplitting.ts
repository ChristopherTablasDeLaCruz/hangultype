export function splitTextIntoLines(
  text: string,
  maxLength: number = 40,
): string[] {
  if (text.includes(" ")) {
    const chars = text.split(" ");
    const isShortTokenDrill = chars.every(char => char.length <= 3);

    if (isShortTokenDrill) {
      const lines: string[] = [];
      let currentLine = "";

      for (const char of chars) {
        if (
          currentLine.length + char.length + 1 > maxLength &&
          currentLine.length > 0
        ) {
          lines.push(currentLine.trim());
          currentLine = char;
        } else {
          currentLine += (currentLine ? " " : "") + char;
        }
      }

      if (currentLine.trim()) lines.push(currentLine.trim());
      return lines.filter((line) => line.length > 0);
    }
  }

  if (!text.includes(" ")) {
    return [text];
  }

  const sentences = text.split(/([.!?]\s*)/);
  const lines: string[] = [];
  let currentLine = "";

  for (let i = 0; i < sentences.length; i += 2) {
    const sentence = sentences[i] || "";
    const punctuation = sentences[i + 1] || "";
    const fullSentence = sentence + punctuation;

    if (
      currentLine.length + fullSentence.length > maxLength &&
      currentLine.length > 0
    ) {
      lines.push(currentLine.trim());
      currentLine = fullSentence;
    } else {
      currentLine += fullSentence;
    }
  }

  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }

  const finalLines: string[] = [];
  for (const line of lines) {
    if (line.length <= maxLength) {
      finalLines.push(line);
    } else {
      const words = line.split(" ");
      let chunk = "";

      for (const word of words) {
        if (chunk.length + word.length + 1 > maxLength && chunk.length > 0) {
          finalLines.push(chunk.trim());
          chunk = word;
        } else {
          chunk += (chunk ? " " : "") + word;
        }
      }

      if (chunk.trim()) finalLines.push(chunk.trim());
    }
  }

  return finalLines.filter((line) => line.length > 0);
}
