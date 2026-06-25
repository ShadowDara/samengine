import * as path from "path";
import * as fs from "fs";
import { execSync } from "child_process";
import { ROUTER_SCRIPT } from "../router/index.js";
import { pathToFileURL } from "url";
import { renderToString } from "minisite/renderer";
import { minify } from "html-minifier-terser";
import { transform } from "lightningcss";
import { build as esbuild } from "esbuild";
import { readFile } from "fs/promises";

const inlineCssPlugin = {
  name: "inline-css",
  setup(build: any) {
    build.onResolve({ filter: /\.css$/ }, (args: any) => ({
      path: path.resolve(args.resolveDir, args.path),
      namespace: "css-inline",
    }));

    build.onLoad({ filter: /.*/, namespace: "css-inline" }, async (args: any) => {
      const css = await readFile(args.path, "utf8");

      return {
        loader: "text",
        contents: compressCss(css, args.path),
      };
    });
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function compressCss(css: string, file: string): string {
  const result = transform({
    code: Buffer.from(css),
    filename: file.replace(/\.(tsx|ts|jsx|js)$/, ".css"),
    minify: true,
  });

  return result.code.toString();
}

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

function loadCss(file: string): string {
  const cssPath = file.replace(/\.(tsx|ts|jsx|js)$/, ".css");
  if (fs.existsSync(cssPath)) {
    return fs.readFileSync(cssPath, "utf-8");
  }
  return "";
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

  for (const file of pageFiles) {
    const rel = path.relative(cwd, file);

    const outfile = path.join(
      tmpDir,
      rel.replace(/\.(tsx|ts|jsx|js)$/, ".js"),
    );

    await esbuild({
      entryPoints: [file],
      outfile,

      bundle: true,
      platform: "node",
      format: "esm",
      target: "esnext",

      jsx: "automatic",
      jsxImportSource: "minisite",

      packages: "external",

      sourcemap: false,
      minify: false,
      write: true,

      plugins: [inlineCssPlugin],
    });
  }

  // 3. Execute each page and render to HTML
  type Route = {
    html: string;
    events: any[];
  };

  const routes: Record<string, Route> = {};

  for (const file of pageFiles) {
    const route = fileToRoute(file, pagesDir);

    // Relative path inside tmpDir
    const rel = path.relative(cwd, file);
    const compiled = path.join(
      tmpDir,
      rel.replace(/\.(tsx|ts|jsx|js)$/, ".js")
    );

    // Dynamic import (Node ESM)
    const mod = await import(pathToFileURL(compiled).href);
    const Page = mod.default;

    if (typeof Page !== "function") {
      console.warn(`  ⚠ Skipping ${rel} – no default export`);
      continue;
    }

    console.log("Loading:", compiled);
    console.log("URL:", pathToFileURL(compiled).href);

    const events: any[] = [];
    const html = renderToString(Page({}), events);

    routes[route] = {
      html,
      events,
    };

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

  const compressedOutput = await minify(
    output,
    {
      collapseWhitespace: true,
      removeComments: true,
      removeAttributeQuotes: true,
      minifyCSS: true,
      minifyJS: true,
    }
  );

  fs.writeFileSync(path.join(distDir, "index.html"), compressedOutput, "utf-8");

  // 5. Cleanup
  // fs.rmSync(tmpDir, { recursive: true, force: true });
}
