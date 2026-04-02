import Bun from "bun";

// === Release-Flag aus CLI-Args prüfen ===
const isRelease = process.argv.includes("--release");

// Dev-Flag für Code (z.B. import.meta.env.DEV) setzen
const isDev = !isRelease;

// Build konfigurieren
await Bun.build({
  entrypoints: ["./game/main.ts"],
  outdir: "./dist",
  target: "browser",
  minify: isRelease,             // true für Release, false für Dev
  sourcemap: isRelease ? false : "linked", // Dev: linked sourcemaps
  define: {
    "import.meta.env.DEV": JSON.stringify(isDev), // für Runtime-Code
  },
});

console.log(`Build fertig! Modus: ${isRelease ? "Release" : "Dev"}`);

// === Dev Server nur starten, wenn Dev === true ===
if (isDev) {
  const server = Bun.serve({
    port: 3000,
    fetch(req) {
      let url = new URL(req.url);
      let path = url.pathname === "/" ? "/index.html" : url.pathname;
      try {
        const file = Bun.file(`.${path}`);
        return new Response(file, {
          headers: {
            "Content-Type": getContentType(path),
          },
        });
      } catch {
        return new Response("Not Found", { status: 404 });
      }
    },
  });

  console.log("Dev Server läuft auf [http://localhost:3000]");
}

// === Helper: Content-Type setzen ===
function getContentType(path: string) {
  if (path.endsWith(".js")) return "application/javascript";
  if (path.endsWith(".ts")) return "application/typescript";
  if (path.endsWith(".html")) return "text/html";
  if (path.endsWith(".css")) return "text/css";
  if (path.endsWith(".png")) return "image/png";
  return "text/plain";
}
