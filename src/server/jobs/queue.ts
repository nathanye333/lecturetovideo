import { addLog } from "@/server/jobs/store";
import { runPipeline } from "@/server/jobs/pipeline";
import { logger } from "@/server/observability/logger";

const activeJobs = new Set<string>();

export function enqueueJob(jobId: string): void {
  if (activeJobs.has(jobId)) {
    return;
  }
  activeJobs.add(jobId);

  setTimeout(async () => {
    try {
      addLog(jobId, "queue", "Job picked up by worker.");
      await runPipeline(jobId);
    } catch (error) {
      logger.error("Unhandled queue error", {
        jobId,
        error: error instanceof Error ? error.message : "unknown",
      });
    } finally {
      activeJobs.delete(jobId);
    }
  }, 0);
}
