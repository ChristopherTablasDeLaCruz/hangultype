// src/utils/typing/textSplitting.ts

// Break down text into bite-sized chunks
export function splitTextIntoLines(
  text: string,
  maxLength: number = 80
): string[] {
  // Korean characters and foundation lessons need special handling
  // No point splitting "ㄱ ㄴ ㄷ ㄹ" into tiny pieces
  if (!text.includes(" ")) {
    const chars = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    for (const char of chars) {
      // Don't cram too many characters on one line - hurts readability
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

  // Real sentences should break naturally, not mid-thought
  const sentences = text.split(/([.!?]\s*)/);
  const lines: string[] = [];
  let currentLine = "";

  for (let i = 0; i < sentences.length; i += 2) {
    const sentence = sentences[i] || "";
    const punctuation = sentences[i + 1] || "";
    const fullSentence = sentence + punctuation;

    // Keep complete thoughts together when possible
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

  // Sometimes sentences are just too damn long - time for plan B
  const finalLines: string[] = [];
  for (const line of lines) {
    if (line.length <= maxLength) {
      finalLines.push(line);
    } else {
      // Break at word boundaries to keep things readable
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

  // Clean up any empty lines that snuck through
  return finalLines.filter((line) => line.length > 0);
}
