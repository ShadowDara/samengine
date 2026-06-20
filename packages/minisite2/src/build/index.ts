import * as path from "path";
import * as fs from "fs";
import { execSync } from "child_process";
import { ROUTER_SCRIPT } from "../router/index.js";
import { pathToFileURL } from "url";
import { renderToString } from "minisite/renderer";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function walk(dir: string, base = dir): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    return fs.statSync(full).isDirectory() ? walk(full, base) : [full];
  });
}

function fileToRoute(file: string, pagesDir: string): string {
  const rel = path.relative(pagesDir, file);
  const noExt = rel.replace(/\.(tsx|ts|jsx|js)$/, "");
  const parts = noExt.split(path.sep);

  // index → parent route
  if (parts[parts.length - 1] === "index") parts.pop();

  const route = "/" + parts.join("/");
  return route === "" ? "/" : route;
}

// ---------------------------------------------------------------------------
// Main build function
// ---------------------------------------------------------------------------

export async function build(cwd: string) {
  const pagesDir = path.join(cwd, "pages");
  const distDir = path.join(cwd, "dist");
  const tmpDir = path.join(cwd, ".minisite-tmp");

  if (!fs.existsSync(pagesDir)) {
    throw new Error(`pages/ directory not found in ${cwd}`);
  }

  // 1. Find all page files
  const pageFiles = walk(pagesDir).filter((f) => /\.(tsx|ts|jsx|js)$/.test(f));

  if (pageFiles.length === 0) {
    throw new Error("No pages found in pages/");
  }

  // 2. Compile TSX → JS into tmpDir
  fs.mkdirSync(tmpDir, { recursive: true });

  const tsconfig = path.join(cwd, "tsconfig.json");
  execSync(
    `npx tsc --project "${tsconfig}" --outDir "${tmpDir}" --noEmit false`,
    { stdio: "inherit", cwd },
  );

  // 3. Execute each page and render to HTML
  const routes: Record<string, string> = {};

  for (const file of pageFiles) {
    const route = fileToRoute(file, pagesDir);

    // Relative path inside tmpDir
    const rel = path.relative(cwd, file);
    const compiled = path.join(tmpDir, rel.replace(/\.(tsx|ts)$/, ".js"));

    // Dynamic import (Node ESM)
    const mod = await import(pathToFileURL(compiled).href);
    const Page = mod.default;

    if (typeof Page !== "function") {
      console.warn(`  ⚠ Skipping ${rel} – no default export`);
      continue;
    }

    // const rendererPath = path.join(tmpDir, "../renderer/index.js");

    // const { renderToString } = await import(pathToFileURL(rendererPath).href);

    console.log("Loading:", compiled);
    console.log("URL:", pathToFileURL(compiled).href);

    const html = renderToString(Page({}));
    routes[route] = html;
    console.log(`  ✓ ${route}`);
  }

  // 4. Write dist/index.html
  fs.mkdirSync(distDir, { recursive: true });

  const routesJson = JSON.stringify(routes, null, 2);

  const output = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>MiniSite</title>
</head>
<body>
<div id="app"></div>
<script>window.ROUTES = ${routesJson};</script>
<script>${ROUTER_SCRIPT}</script>
</body>
</html>`;

  fs.writeFileSync(path.join(distDir, "index.html"), output, "utf-8");

  // 5. Cleanup
  // fs.rmSync(tmpDir, { recursive: true, force: true });
}
