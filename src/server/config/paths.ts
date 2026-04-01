import path from "node:path";

export const DATA_ROOT = path.join(process.cwd(), ".data");
export const OBJECT_STORE_ROOT = path.join(DATA_ROOT, "object-store");
export const JOB_OUTPUT_ROOT = path.join(DATA_ROOT, "job-output");
