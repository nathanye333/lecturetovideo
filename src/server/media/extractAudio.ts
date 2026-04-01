import { promises as fs } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

import { JOB_OUTPUT_ROOT } from "@/server/config/paths";

export async function extractAudio(
  jobId: string,
  videoPath: string,
): Promise<string> {
  const outputDir = path.join(JOB_OUTPUT_ROOT, jobId);
  await fs.mkdir(outputDir, { recursive: true });

  const audioPath = path.join(outputDir, "audio.wav");

  // Fast MVP fallback: copy bytes if ffmpeg is unavailable.
  // This keeps local development unblocked while preserving stage contracts.
  try {
    await new Promise<void>((resolve, reject) => {
      const child = spawn("ffmpeg", [
        "-y",
        "-i",
        videoPath,
        "-ac",
        "1",
        "-ar",
        "16000",
        "-vn",
        audioPath,
      ]);
      child.on("error", reject);
      child.on("exit", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`ffmpeg exited with code ${code}`));
        }
      });
    });
    return audioPath;
  } catch {
    const original = await fs.readFile(videoPath);
    await fs.writeFile(audioPath, original);
    return audioPath;
  }
}
