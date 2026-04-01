import { promises as fs } from "node:fs";

import { getJob } from "@/server/jobs/store";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const format = new URL(request.url).searchParams.get("format") === "md" ? "md" : "json";
  const job = getJob(id);

  if (!job) {
    return Response.json({ error: "Job not found." }, { status: 404 });
  }

  const target = job.artifacts.find(
    (artifact) =>
      artifact.type === "export_bundle" &&
      (format === "json" ? artifact.path.endsWith(".json") : artifact.path.endsWith(".md")),
  );

  if (!target) {
    return Response.json({ error: "Export bundle not ready." }, { status: 404 });
  }

  const file = await fs.readFile(target.path, "utf-8");
  return new Response(file, {
    headers: {
      "content-type": format === "json" ? "application/json" : "text/markdown",
      "content-disposition": `attachment; filename="job-${id}-bundle.${format}"`,
    },
  });
}
