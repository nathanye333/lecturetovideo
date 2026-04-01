import { randomUUID } from "node:crypto";

import type {
  ArtifactType,
  JobArtifact,
  JobRecord,
  JobState,
  ProcessingLogLevel,
} from "@/server/jobs/types";

const jobs = new Map<string, JobRecord>();

function nowIso(): string {
  return new Date().toISOString();
}

export function createJob(fileName: string, videoPath: string): JobRecord {
  const jobId = randomUUID();
  const createdAt = nowIso();
  const videoArtifact: JobArtifact = {
    id: randomUUID(),
    jobId,
    type: "video",
    path: videoPath,
    createdAt,
  };

  const record: JobRecord = {
    id: jobId,
    fileName,
    createdAt,
    updatedAt: createdAt,
    state: "uploaded",
    errorMessage: null,
    artifacts: [videoArtifact],
    logs: [
      {
        id: randomUUID(),
        jobId,
        stage: "upload",
        level: "info",
        message: "Video uploaded and job created.",
        createdAt,
      },
    ],
  };

  jobs.set(jobId, record);
  return record;
}

export function listJobs(): JobRecord[] {
  return [...jobs.values()].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function getJob(jobId: string): JobRecord | null {
  return jobs.get(jobId) ?? null;
}

export function setJobState(
  jobId: string,
  state: JobState,
  errorMessage: string | null = null,
): void {
  const current = jobs.get(jobId);
  if (!current) {
    return;
  }
  current.state = state;
  current.errorMessage = errorMessage;
  current.updatedAt = nowIso();
}

export function addArtifact(
  jobId: string,
  type: ArtifactType,
  path: string,
  metadata?: Record<string, string | number | boolean | null>,
): void {
  const current = jobs.get(jobId);
  if (!current) {
    return;
  }
  current.artifacts.push({
    id: randomUUID(),
    jobId,
    type,
    path,
    createdAt: nowIso(),
    metadata,
  });
  current.updatedAt = nowIso();
}

export function addLog(
  jobId: string,
  stage: string,
  message: string,
  level: ProcessingLogLevel = "info",
): void {
  const current = jobs.get(jobId);
  if (!current) {
    return;
  }
  current.logs.push({
    id: randomUUID(),
    jobId,
    stage,
    message,
    level,
    createdAt: nowIso(),
  });
  current.updatedAt = nowIso();
}
