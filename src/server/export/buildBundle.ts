import { promises as fs } from "node:fs";
import path from "node:path";

import { JOB_OUTPUT_ROOT } from "@/server/config/paths";
import type { VisualPlan } from "@/server/llm/generateVisualPlan";

export async function buildBundle(args: {
  jobId: string;
  cleanedTranscript: string;
  script: string;
  visualPlan: VisualPlan;
}): Promise<{ markdownPath: string; jsonPath: string }> {
  const outDir = path.join(JOB_OUTPUT_ROOT, args.jobId, "export");
  await fs.mkdir(outDir, { recursive: true });

  const markdown = [
    "# Lecture-to-Visuals Export",
    "",
    "## Condensed Script",
    "",
    args.script,
    "",
    "## Cleaned Transcript",
    "",
    args.cleanedTranscript,
    "",
    "## Visual Instructions",
    "",
    ...args.visualPlan.scenes.map((scene) =>
      [
        `### Scene ${scene.sceneNumber}`,
        `- Objective: ${scene.objective}`,
        `- Narration: ${scene.narration}`,
        `- On-screen text: ${scene.onScreenText}`,
        `- Visual type: ${scene.visualType}`,
        `- Prompt: ${scene.prompt}`,
        `- Negative prompt: ${scene.negativePrompt}`,
        `- Source snippet: ${scene.sourceSnippet}`,
        "",
      ].join("\n"),
    ),
  ].join("\n");

  const markdownPath = path.join(outDir, "bundle.md");
  const jsonPath = path.join(outDir, "bundle.json");
  await fs.writeFile(markdownPath, markdown, "utf-8");
  await fs.writeFile(
    jsonPath,
    JSON.stringify(
      {
        jobId: args.jobId,
        cleanedTranscript: args.cleanedTranscript,
        script: args.script,
        visualPlan: args.visualPlan,
      },
      null,
      2,
    ),
    "utf-8",
  );

  return { markdownPath, jsonPath };
}
