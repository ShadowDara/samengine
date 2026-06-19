import { readFile } from "node:fs/promises";

export async function loadFile(path: string): Promise<string> {
  // Bun
  if (typeof Bun !== "undefined") {
    return await Bun.file(path).text();
  }

  // Node
  return await readFile(path, "utf8");
}

export async function loadRaw(path: string): Promise<string> {
  return loadFile(path);
}
