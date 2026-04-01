import { listJobs } from "@/server/jobs/store";

export const runtime = "nodejs";

export async function GET() {
  const jobs = listJobs();
  return Response.json({ jobs });
}
