"use client";

import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("Idle");
  const [jobId, setJobId] = useState<string | null>(null);

  async function uploadLecture() {
    if (!file) {
      setStatus("Pick a lecture video first.");
      return;
    }

    setStatus("Uploading...");
    const body = new FormData();
    body.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body,
    });

    if (!response.ok) {
      setStatus("Upload failed.");
      return;
    }

    const payload: { jobId: string } = await response.json();
    setJobId(payload.jobId);
    setStatus("Uploaded. Background pipeline started.");
  }

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: 24, display: "grid", gap: 16 }}>
      <h1>Lecture-to-Visuals MVP</h1>
      <p>
        Upload a lecture recording to generate a cleaned transcript, condensed script, and
        scene-by-scene visual instructions.
      </p>

      <input
        type="file"
        accept="video/*"
        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
      />
      <button type="button" onClick={uploadLecture} style={{ width: 220, padding: 10 }}>
        Upload and Process
      </button>

      <p>Status: {status}</p>
      {jobId ? (
        <p>
          Job created: <code>{jobId}</code>.{" "}
          <Link href={`/jobs/${jobId}`}>Open job details</Link>
        </p>
      ) : null}

      <p>
        <Link href="/jobs">View all jobs</Link>
      </p>
    </main>
  );
}
