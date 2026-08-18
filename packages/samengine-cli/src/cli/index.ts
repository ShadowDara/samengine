#!/usr/bin/env node

import { parseMarkdownToDocument } from "@shadowdara/dlib";
import fs from "fs/promises";
import path from "path";

import { main as buildinfos } from "./buildinfos.js";
import { main as minisite, newProj } from "./minisite.js";

async function convertMarkdown() {
  // const args = process.argv.slice(2); // alles nach node + script
  // falls du wirklich "nach dem 2. Argument" meinst:
  const args = process.argv.slice(3);

  for (const arg of args) {
    const content = await fs.readFile(arg, "utf-8");
    const html = parseMarkdownToDocument(content);
    const filePath = path.join(arg + ".html");
    await fs.writeFile(filePath, html, "utf-8");
  }
}

function help() {
  console.log(`samengine-cli

This package provides a cli tool for samengine:
- markdown
- buildinfos
- minisite

and some usable functions:
- a markdown parser
- a csv parser
- a jsonc parser
`);
}

// Main funciton
async function main() {
  if (process.argv.length < 3) {
    help();
    process.exit(1);
  }

  if (process.argv[2] == "markdown") {
    await convertMarkdown();
  }

  if (process.argv[2] == "buildinfos") {
    buildinfos();
  }

  if (process.argv[2] == "minisite") {
    // New minisite proj
    if (process.argv.length >= 4 && process.argv[3] == "new") {
      newProj();
    }

    minisite();
  }
}

await main();
