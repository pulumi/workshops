import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRootValue = process.env.WORKSHOP_ROOT ?? path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../../",
);

export function projectRoot(): string {
  return projectRootValue;
}

export function dataPath(name: string): string {
  return path.join(projectRootValue, "data", name);
}

export function distFrontendPath(name: string): string {
  return path.join(projectRootValue, "dist", "frontend", name);
}

export async function ensureDataDir(): Promise<void> {
  await mkdir(path.join(projectRootValue, "data"), { recursive: true });
}

export async function readJsonFile<T>(filePath: string): Promise<T> {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

export async function writeJsonFile(filePath: string, value: unknown): Promise<void> {
  const tempPath = `${filePath}.tmp`;
  const content = JSON.stringify(value, null, 2);
  await writeFile(tempPath, `${content}\n`, "utf8");
  await writeFile(filePath, `${content}\n`, "utf8");
}

