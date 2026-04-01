import { promises as fs } from "node:fs";
import path from "node:path";

import { JOB_OUTPUT_ROOT } from "@/server/config/paths";

export type AudioChunk = {
  index: number;
  path: string;
};

export async function chunkAudio(jobId: string, audioPath: string): Promise<AudioChunk[]> {
  const chunkDir = path.join(JOB_OUTPUT_ROOT, jobId, "chunks");
  await fs.mkdir(chunkDir, { recursive: true });

  // MVP strategy: single chunk keeps implementation fast.
  const chunkPath = path.join(chunkDir, "chunk-000.wav");
  const bytes = await fs.readFile(audioPath);
  await fs.writeFile(chunkPath, bytes);

  return [{ index: 0, path: chunkPath }];
}
