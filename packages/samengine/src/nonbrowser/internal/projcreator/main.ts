import inquirer from "inquirer";
import path from "path";
import fs from "fs-extra";
import { downloadAndExtract, flattenGitHubZip } from "./downloadZip.js";

const USERNAME = "Shadowdara";
const REPO = "samengine-project-templates";

export async function run() {
    const answers = await inquirer.prompt([
        {
            name: "projectName",
            message: "Project name?",
            default: "my-game"
        }
    ]);

    const targetDir = path.join(process.cwd(), answers.projectName);

    console.log("📦 Downloading template repo...");

    await downloadAndExtract(
        `https://codeload.github.com/${USERNAME}/${REPO}/zip/refs/heads/main`,
        targetDir
    );

    await flattenGitHubZip(targetDir);

    // -------------------------
    // 1. VERSIONEN LADEN
    // -------------------------
    const versions = (await fs.readdir(targetDir))
        .filter(v => fs.statSync(path.join(targetDir, v)).isDirectory());

    const { version } = await inquirer.prompt([
        {
            name: "version",
            message: "Choose version",
            type: "select",
            choices: versions
        }
    ]);

    const versionPath = path.join(targetDir, version);

    // -------------------------
    // 2. STARTER LADEN
    // -------------------------
    const starters = (await fs.readdir(versionPath))
        .filter(s => fs.statSync(path.join(versionPath, s)).isDirectory());

    const { starter } = await inquirer.prompt([
        {
            name: "starter",
            message: "Choose starter",
            type: "select",
            choices: starters
        }
    ]);

    // -------------------------
    // 3. CLEANUP (KEEP ONLY SELECTED)
    // -------------------------
    for (const v of await fs.readdir(targetDir)) {
        const vPath = path.join(targetDir, v);

        if (!(await fs.stat(vPath)).isDirectory()) continue;

        if (v !== version) {
            await fs.remove(vPath);
            continue;
        }

        // remove other starters inside selected version
        for (const s of await fs.readdir(vPath)) {
            const sPath = path.join(vPath, s);

            if (!(await fs.stat(sPath)).isDirectory()) continue;

            if (s !== starter) {
                await fs.remove(sPath);
            }
        }
    }

    // -------------------------
    // 4. MOVE STARTER TO ROOT
    // -------------------------
    const starterPath = path.join(targetDir, version, starter);

    const files = await fs.readdir(starterPath);

    for (const file of files) {
        await fs.move(
            path.join(starterPath, file),
            path.join(targetDir, file),
            { overwrite: true }
        );
    }

    // -------------------------
    // 5. FINAL CLEANUP
    // -------------------------
    await fs.remove(path.join(targetDir, version));

    console.log("✅ Done!");
    console.log(`👉 cd ${answers.projectName} && npm install`);
}
