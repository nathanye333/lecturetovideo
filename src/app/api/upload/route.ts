import { createJob } from "@/server/jobs/store";
import { enqueueJob } from "@/server/jobs/queue";
import { saveBufferObject } from "@/server/storage/objectStore";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return Response.json({ error: "No file uploaded." }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const videoPath = await saveBufferObject(file.name, bytes);
  const job = createJob(file.name, videoPath);
  enqueueJob(job.id);

  return Response.json({ jobId: job.id, state: job.state });
}
