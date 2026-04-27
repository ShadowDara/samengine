const fs = require('fs/promises');

async function copy() {
    await fs.copyFile('README.md', '../../README.md');
}

await copy();
