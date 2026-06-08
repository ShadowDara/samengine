import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import esbuild from "esbuild";
import { render } from "./runtime";

async function build() {
  fs.mkdirSync("dist", { recursive: true });

  await esbuild.build({
    entryPoints: ["game/main.tsx"],
    bundle: true,
    outfile: "dist/app.js",
    format: "iife",
    platform: "browser",
    jsx: "transform",
    jsxFactory: "jsx",
    jsxFragment: "Fragment",
  });

  const ssrFile = path.resolve("dist/ssr.mjs");
  await esbuild.build({
    entryPoints: ["game/main.tsx"],
    bundle: true,
    outfile: ssrFile,
    format: "esm",
    platform: "node",
    jsx: "transform",
    jsxFactory: "jsx",
    jsxFragment: "Fragment",
  });

  const { default: App } = await import(pathToFileURL(ssrFile).href);
  const app = App();
  const js = fs.readFileSync("dist/app.js", "utf-8");

  const html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Mini SSG</title>
  <style>
    body { font-family: system-ui; padding: 20px; }
    .app { border: 1px solid #ddd; padding: 12px; }
    button { margin-top: 10px; padding: 8px 12px; }
  </style>
</head>
<body>
  ${render(app)}
</body>
</html>
`;

// <script>
  // ${js}
  // </script>

  fs.writeFileSync("dist/index.html", html);
  // fs.rmSync("dist/app.js", { force: true });
  // fs.rmSync(ssrFile, { force: true });

  console.log("built dist/index.html");
}

build();
