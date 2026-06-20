#!/usr/bin/env node
import { build } from "../build/index.js";

const [, , command] = process.argv;

if (command !== "build") {
  console.error("Usage: minisite build");
  process.exit(1);
}

console.log("🏗  MiniSite build...\n");

build(process.cwd())
  .then(() => console.log("\n✅ dist/index.html"))
  .catch((err) => {
    console.error("\n❌", err.message);
    console.error(err);
    console.error(err.stack);
    process.exit(1);
  });
