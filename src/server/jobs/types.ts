export const JOB_STATES = [
  "uploaded",
  "audio_ready",
  "transcript_ready",
  "script_ready",
  "visuals_ready",
  "complete",
  "failed",
] as const;

export type JobState = (typeof JOB_STATES)[number];

export type ArtifactType =
  | "video"
  | "audio"
  | "audio_chunk"
  | "transcript_raw"
  | "transcript_clean"
  | "script"
  | "visual_plan"
  | "export_bundle";

export type JobArtifact = {
  id: string;
  jobId: string;
  type: ArtifactType;
  path: string;
  createdAt: string;
  metadata?: Record<string, string | number | boolean | null>;
};

export type ProcessingLogLevel = "info" | "warn" | "error";

export type ProcessingLogEntry = {
  id: string;
  jobId: string;
  stage: string;
  message: string;
  level: ProcessingLogLevel;
  createdAt: string;
};

export type JobRecord = {
  id: string;
  fileName: string;
  createdAt: string;
  updatedAt: string;
  state: JobState;
  errorMessage: string | null;
  artifacts: JobArtifact[];
  logs: ProcessingLogEntry[];
};

export type PipelineResult = {
  cleanedTranscript: string;
  script: string;
  visualPlanMarkdown: string;
  visualPlanJson: string;
  exportBundlePath: string;
};
