import type { TranscriptSegment } from "@/server/asr/transcribe";

export type StitchedTranscript = {
  rawText: string;
  withTimestamps: string;
};

export function stitchTranscript(segments: TranscriptSegment[]): StitchedTranscript {
  const ordered = [...segments].sort((a, b) => a.startSec - b.startSec);
  const rawText = ordered.map((segment) => segment.text).join(" ");
  const withTimestamps = ordered
    .map((segment) => {
      const stamp = `${segment.startSec.toString().padStart(4, "0")}-${segment.endSec
        .toString()
        .padStart(4, "0")}`;
      return `[${stamp}] ${segment.text}`;
    })
    .join("\n");

  return { rawText, withTimestamps };
}
