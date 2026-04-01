import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import path from "node:path";
import test from "node:test";

import { runPipeline } from "@/server/jobs/pipeline";
import { createJob, getJob } from "@/server/jobs/store";
import { saveBufferObject } from "@/server/storage/objectStore";

test("pipeline generates transcript, script, visuals, and export bundle", async () => {
  const fakeVideo = Buffer.from("fake lecture bytes");
  const stored = await saveBufferObject("lecture.mp4", fakeVideo);
  const job = createJob("lecture.mp4", stored);

  await runPipeline(job.id);
  const updated = getJob(job.id);
  assert.ok(updated, "job should exist");
  assert.equal(updated.state, "complete");

  const transcript = updated.artifacts.find((artifact) => artifact.type === "transcript_clean");
  const script = updated.artifacts.find((artifact) => artifact.type === "script");
  const bundle = updated.artifacts.find(
    (artifact) => artifact.type === "export_bundle" && artifact.path.endsWith(".json"),
  );

  assert.ok(transcript?.path, "transcript artifact should exist");
  assert.ok(script?.path, "script artifact should exist");
  assert.ok(bundle?.path, "bundle artifact should exist");

  const bundleJson = await fs.readFile(bundle.path, "utf-8");
  const parsed = JSON.parse(bundleJson) as { jobId: string };
  assert.equal(parsed.jobId, job.id);

  const outputDir = path.dirname(bundle.path);
  const files = await fs.readdir(outputDir);
  assert.ok(files.includes("bundle.md"));
});
