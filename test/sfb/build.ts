import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import esbuild from "esbuild";
import { render } from "./runtime";

async function build() {
  fs.mkdirSync("dist", { recursive: true });

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

  const html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Mini SSG</title>
  <style>
    body { font-family: system-ui; padding: 20px; }
    .app { border: 1px solid #ddd; padding: 12px; }
    textarea { box-sizing: border-box; min-height: 160px; width: 100%; }
    #markdown-preview { border-top: 1px solid #ddd; margin-top: 16px; padding-top: 16px; }
    button { margin-top: 10px; padding: 8px 12px; }
  </style>
</head>
<body>
  ${render(app)}
</body>
</html>
`;

  fs.writeFileSync("dist/index.html", html);
  fs.rmSync("dist/app.js", { force: true });
  fs.rmSync(ssrFile, { force: true });

  console.log("built dist/index.html");
}

build();
