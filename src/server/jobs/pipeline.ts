import { promises as fs } from "node:fs";

import { stitchTranscript } from "@/server/asr/stitchTranscript";
import { transcribeChunk } from "@/server/asr/transcribe";
import { buildBundle } from "@/server/export/buildBundle";
import { cleanTranscript } from "@/server/llm/cleanTranscript";
import {
  generateVisualPlan,
  visualPlanToMarkdown,
} from "@/server/llm/generateVisualPlan";
import { generateScript } from "@/server/llm/generateScript";
import { chunkAudio } from "@/server/media/chunkAudio";
import { extractAudio } from "@/server/media/extractAudio";
import { addArtifact, addLog, getJob, setJobState } from "@/server/jobs/store";
import { recordStageLatency } from "@/server/observability/metrics";

async function runStage(stage: string, fn: () => Promise<void>): Promise<void> {
  const start = Date.now();
  await fn();
  recordStageLatency(stage, Date.now() - start);
}

function requireVideoPath(jobId: string): string {
  const job = getJob(jobId);
  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }
  const video = job.artifacts.find((artifact) => artifact.type === "video");
  if (!video) {
    throw new Error("Video artifact missing");
  }
  return video.path;
}

export async function runPipeline(jobId: string): Promise<void> {
  try {
    const videoPath = requireVideoPath(jobId);

    await runStage("extract_audio", async () => {
      addLog(jobId, "extract_audio", "Extracting audio from uploaded video.");
      const audioPath = await extractAudio(jobId, videoPath);
      addArtifact(jobId, "audio", audioPath);
      setJobState(jobId, "audio_ready");
    });

    const audioPath = getJob(jobId)?.artifacts.find((artifact) => artifact.type === "audio")?.path;
    if (!audioPath) {
      throw new Error("Audio extraction failed to produce output.");
    }

    let cleaned = "";
    let script = "";
    let visualPlanMarkdown = "";
    let visualPlanJson = "";
    let exportBundlePath = "";

    await runStage("transcript", async () => {
      addLog(jobId, "transcript", "Chunking audio and running transcription.");
      const chunks = await chunkAudio(jobId, audioPath);
      for (const chunk of chunks) {
        addArtifact(jobId, "audio_chunk", chunk.path, { index: chunk.index });
      }

      const segmentGroups = await Promise.all(chunks.map((chunk) => transcribeChunk(chunk)));
      const stitched = stitchTranscript(segmentGroups.flat());
      const transcriptRawPath = audioPath.replace("audio.wav", "transcript-raw.txt");
      await fs.writeFile(transcriptRawPath, stitched.withTimestamps, "utf-8");
      addArtifact(jobId, "transcript_raw", transcriptRawPath);

      cleaned = cleanTranscript(stitched.rawText);
      const transcriptCleanPath = audioPath.replace("audio.wav", "transcript-clean.txt");
      await fs.writeFile(transcriptCleanPath, cleaned, "utf-8");
      addArtifact(jobId, "transcript_clean", transcriptCleanPath);
      setJobState(jobId, "transcript_ready");
    });

    await runStage("script", async () => {
      addLog(jobId, "script", "Generating condensed instructional script.");
      script = generateScript(cleaned);
      const scriptPath = audioPath.replace("audio.wav", "script.txt");
      await fs.writeFile(scriptPath, script, "utf-8");
      addArtifact(jobId, "script", scriptPath);
      setJobState(jobId, "script_ready");
    });

    await runStage("visual_plan", async () => {
      addLog(jobId, "visual_plan", "Generating visual instruction cards.");
      const visualPlan = generateVisualPlan(script, cleaned);
      visualPlanMarkdown = visualPlanToMarkdown(visualPlan);
      visualPlanJson = JSON.stringify(visualPlan, null, 2);
      const markdownPath = audioPath.replace("audio.wav", "visual-plan.md");
      const jsonPath = audioPath.replace("audio.wav", "visual-plan.json");
      await fs.writeFile(markdownPath, visualPlanMarkdown, "utf-8");
      await fs.writeFile(jsonPath, visualPlanJson, "utf-8");
      addArtifact(jobId, "visual_plan", markdownPath);
      addArtifact(jobId, "visual_plan", jsonPath);
      setJobState(jobId, "visuals_ready");

      const bundle = await buildBundle({
        jobId,
        cleanedTranscript: cleaned,
        script,
        visualPlan,
      });
      exportBundlePath = bundle.jsonPath;
      addArtifact(jobId, "export_bundle", bundle.markdownPath);
      addArtifact(jobId, "export_bundle", bundle.jsonPath);
    });

    void visualPlanMarkdown;
    void visualPlanJson;
    void exportBundlePath;

    addLog(jobId, "complete", "Pipeline completed successfully.");
    setJobState(jobId, "complete");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown pipeline failure";
    addLog(jobId, "error", message, "error");
    setJobState(jobId, "failed", message);
  }
}
