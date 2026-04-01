import type { JobArtifact, JobRecord, ProcessingLogEntry } from "@/server/jobs/types";

export type JobsTable = {
  id: string;
  file_name: string;
  state: JobRecord["state"];
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

export type JobArtifactsTable = {
  id: string;
  job_id: string;
  type: JobArtifact["type"];
  path: string;
  metadata_json: string | null;
  created_at: string;
};

export type ProcessingLogsTable = {
  id: string;
  job_id: string;
  stage: string;
  level: ProcessingLogEntry["level"];
  message: string;
  created_at: string;
};

export type FailureReasonsTable = {
  id: string;
  job_id: string;
  stage: string;
  reason: string;
  created_at: string;
};
