import { getMetricSnapshot } from "@/server/observability/metrics";

export const runtime = "nodejs";

export async function GET() {
  return Response.json({ metrics: getMetricSnapshot() });
}
