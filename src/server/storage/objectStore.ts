import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import { OBJECT_STORE_ROOT } from "@/server/config/paths";

export async function saveBufferObject(
  originalName: string,
  bytes: Buffer,
): Promise<string> {
  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storageKey = `${Date.now()}-${randomUUID()}-${safeName}`;
  const fullPath = path.join(OBJECT_STORE_ROOT, storageKey);

  await fs.mkdir(OBJECT_STORE_ROOT, { recursive: true });
  await fs.writeFile(fullPath, bytes);
  return fullPath;
}

export async function readObjectAsText(filePath: string): Promise<string> {
  return fs.readFile(filePath, "utf-8");
}
