import { promises as fs } from "node:fs";

import type { AudioChunk } from "@/server/media/chunkAudio";

export type TranscriptSegment = {
  startSec: number;
  endSec: number;
  text: string;
  sourceChunk: number;
};

export async function transcribeChunk(chunk: AudioChunk): Promise<TranscriptSegment[]> {
  const stats = await fs.stat(chunk.path);
  const approxSeconds = Math.max(30, Math.round(stats.size / 32000));

  const text = [
    "This is an MVP transcript placeholder.",
    "Swap this implementation with a managed ASR API call in production.",
    `Chunk ${chunk.index} estimated duration: ${approxSeconds} seconds.`,
  ].join(" ");

  return [
    {
      startSec: chunk.index * approxSeconds,
      endSec: (chunk.index + 1) * approxSeconds,
      text,
      sourceChunk: chunk.index,
    },
  ];
}
