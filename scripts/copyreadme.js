import fs from "fs/promises";

async function copy() {
    await fs.copyFile('packages/samengine/README.md', 'README.md');
}

await copy();
