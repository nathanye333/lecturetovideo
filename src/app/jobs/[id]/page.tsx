import { promises as fs } from "node:fs";
import Link from "next/link";

import { getJob } from "@/server/jobs/store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = {
  params: Promise<{ id: string }>;
};

async function readArtifact(path: string): Promise<string> {
  try {
    return await fs.readFile(path, "utf-8");
  } catch {
    return "";
  }
}

export default async function JobDetailPage({ params }: PageProps) {
  const { id } = await params;
  const job = getJob(id);

  if (!job) {
    return (
      <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
        <p>Job not found.</p>
        <Link href="/jobs">Back to jobs</Link>
      </main>
    );
  }

  const transcriptPath = job.artifacts.find((artifact) => artifact.type === "transcript_clean")?.path;
  const scriptPath = job.artifacts.find((artifact) => artifact.type === "script")?.path;
  const visualsPath = job.artifacts.find((artifact) => artifact.path.endsWith("visual-plan.md"))?.path;

  const transcript = transcriptPath ? await readArtifact(transcriptPath) : "";
  const script = scriptPath ? await readArtifact(scriptPath) : "";
  const visuals = visualsPath ? await readArtifact(visualsPath) : "";

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24, display: "grid", gap: 16 }}>
      <h1>Job {job.id}</h1>
      <p>
        <Link href="/jobs">Back to jobs</Link>
      </p>

      <section>
        <h2>Status</h2>
        <p>Current state: {job.state}</p>
        {job.errorMessage ? <p>Error: {job.errorMessage}</p> : null}
      </section>

      <section>
        <h2>Timeline</h2>
        <ul style={{ paddingLeft: 20 }}>
          {job.logs.map((entry) => (
            <li key={entry.id}>
              [{entry.level}] {entry.createdAt} - {entry.stage}: {entry.message}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Condensed Script</h2>
        <pre style={{ whiteSpace: "pre-wrap" }}>{script || "Not ready yet."}</pre>
      </section>

      <section>
        <h2>Cleaned Transcript</h2>
        <pre style={{ whiteSpace: "pre-wrap" }}>{transcript || "Not ready yet."}</pre>
      </section>

      <section>
        <h2>Visual Instruction Cards</h2>
        <pre style={{ whiteSpace: "pre-wrap" }}>{visuals || "Not ready yet."}</pre>
      </section>

      <section style={{ display: "flex", gap: 12 }}>
        <a href={`/api/jobs/${job.id}/export?format=json`}>Download JSON bundle</a>
        <a href={`/api/jobs/${job.id}/export?format=md`}>Download Markdown bundle</a>
      </section>
    </main>
  );
}
