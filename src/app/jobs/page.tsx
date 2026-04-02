import Link from "next/link";

import { listJobs } from "@/server/jobs/store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function JobsPage() {
  const jobs = listJobs();

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24, display: "grid", gap: 14 }}>
      <h1>Processing Jobs</h1>
      <p>
        <Link href="/">Back to upload</Link>
      </p>

      {jobs.length === 0 ? (
        <p>No jobs yet. Upload a lecture to begin.</p>
      ) : (
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", borderBottom: "1px solid #555", padding: 8 }}>
                Job ID
              </th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #555", padding: 8 }}>
                File
              </th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #555", padding: 8 }}>
                State
              </th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #555", padding: 8 }}>
                Updated
              </th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td style={{ borderBottom: "1px solid #333", padding: 8 }}>
                  <Link href={`/jobs/${job.id}`}>{job.id}</Link>
                </td>
                <td style={{ borderBottom: "1px solid #333", padding: 8 }}>{job.fileName}</td>
                <td style={{ borderBottom: "1px solid #333", padding: 8 }}>{job.state}</td>
                <td style={{ borderBottom: "1px solid #333", padding: 8 }}>{job.updatedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
