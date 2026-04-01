export function generateScript(cleanedTranscript: string): string {
  const sentences = cleanedTranscript
    .split(/[.?!]/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  const core = sentences.slice(0, 6);
  if (core.length === 0) {
    return "No transcript content was available to summarize.";
  }

  const intro = "Instructional Script\n\n";
  const bullets = core.map((sentence, index) => `${index + 1}. ${sentence}.`).join("\n");
  const outro =
    "\n\nConclusion: Revisit the key definitions, then apply the concept to one practical example.";

  return `${intro}${bullets}${outro}`;
}
