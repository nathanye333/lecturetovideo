export type VisualScene = {
  sceneNumber: number;
  objective: string;
  narration: string;
  onScreenText: string;
  visualType: "diagram" | "chart" | "animation_metaphor";
  prompt: string;
  negativePrompt: string;
  sourceSnippet: string;
};

export type VisualPlan = {
  scenes: VisualScene[];
};

export function generateVisualPlan(script: string, cleanedTranscript: string): VisualPlan {
  const candidateLines = script
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^\d+\./.test(line))
    .slice(0, 5);

  const transcriptSnippet = cleanedTranscript.slice(0, 220);
  const scenes = candidateLines.map((line, index) => {
    const content = line.replace(/^\d+\.\s*/, "");
    const sceneNumber = index + 1;
    return {
      sceneNumber,
      objective: `Explain concept ${sceneNumber} clearly.`,
      narration: content,
      onScreenText: content.slice(0, 90),
      visualType: index % 2 === 0 ? "diagram" : "animation_metaphor",
      prompt: `Create a clean educational ${index % 2 === 0 ? "diagram" : "animation metaphor"} for: ${content}`,
      negativePrompt: "No clutter, no stock-photo style, no unrelated icons, no dense paragraphs.",
      sourceSnippet: transcriptSnippet,
    } as const;
  });

  return { scenes };
}

export function visualPlanToMarkdown(plan: VisualPlan): string {
  const lines = ["# Visual Instruction Cards", ""];
  for (const scene of plan.scenes) {
    lines.push(`## Scene ${scene.sceneNumber}`);
    lines.push(`- Objective: ${scene.objective}`);
    lines.push(`- Narration: ${scene.narration}`);
    lines.push(`- On-screen text: ${scene.onScreenText}`);
    lines.push(`- Visual type: ${scene.visualType}`);
    lines.push(`- Prompt: ${scene.prompt}`);
    lines.push(`- Negative prompt: ${scene.negativePrompt}`);
    lines.push(`- Source snippet: ${scene.sourceSnippet}`);
    lines.push("");
  }
  return lines.join("\n");
}
