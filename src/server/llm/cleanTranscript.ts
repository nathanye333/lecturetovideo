export function cleanTranscript(rawText: string): string {
  return rawText
    .replace(/\s+/g, " ")
    .replace(/\b(um+|uh+|you know|like)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}
