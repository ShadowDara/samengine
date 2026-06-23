import fetch from "node-fetch";
import fs from "fs-extra";
import unzipper from "unzipper";
import path from "path";

export async function downloadAndExtract(url: string, targetDir: string) {
    await fs.ensureDir(targetDir);

    const res = await fetch(url);

    if (!res.ok || !res.body) {
        throw new Error("Failed to download template");
    }

    const body = res.body;

    const zipPath = path.join(targetDir, "template.zip");

    const fileStream = fs.createWriteStream(zipPath);

    await new Promise((resolve, reject) => {
        body.pipe(fileStream);
        body.on("error", reject);
        fileStream.on("finish", resolve);
    });

    await fs
        .createReadStream(zipPath)
        .pipe(unzipper.Extract({ path: targetDir }))
        .promise();

    await fs.remove(zipPath);

    // flatten GitHub folder
    const items = await fs.readdir(targetDir);
    const rootFolder = items.find(f => f.includes("game-template"));

    if (rootFolder) {
        const rootPath = path.join(targetDir, rootFolder);

        const files = await fs.readdir(rootPath);

        for (const file of files) {
            await fs.move(
                path.join(rootPath, file),
                path.join(targetDir, file),
                { overwrite: true }
            );
        }

        await fs.remove(rootPath);
    }
}

export async function flattenGitHubZip(rootDir: string) {
    const items = await fs.readdir(rootDir);

    // finde GitHub wrapper folder
    const wrapper = items.find(name =>
        name.includes("-main") ||
        name.includes("-master") ||
        name.includes("-")
    );

    if (!wrapper) return;

    const wrapperPath = path.join(rootDir, wrapper);

    const inner = await fs.readdir(wrapperPath);

    for (const file of inner) {
        await fs.move(
            path.join(wrapperPath, file),
            path.join(rootDir, file),
            { overwrite: true }
        );
    }

    await fs.remove(wrapperPath);
}

export async function keepOnlySelectedVersion(
    rootDir: string,
    selectedVersion: string,
    selectedStarter: string
) {
    const versions = await fs.readdir(rootDir);

    for (const version of versions) {
        const versionPath = path.join(rootDir, version);

        const stat = await fs.stat(versionPath);
        if (!stat.isDirectory()) continue;

        if (version !== selectedVersion) {
            await fs.remove(versionPath);
            continue;
        }

        // inside selected version → handle starters
        const starters = await fs.readdir(versionPath);

        for (const starter of starters) {
            const starterPath = path.join(versionPath, starter);

            const stat2 = await fs.stat(starterPath);
            if (!stat2.isDirectory()) continue;

            if (starter !== selectedStarter) {
                await fs.remove(starterPath);
            }
        }
    }
}

export async function finalizeProject(
    rootDir: string,
    version: string,
    starter: string
) {
    const starterPath = path.join(rootDir, version, starter);

    const files = await fs.readdir(starterPath);

    for (const file of files) {
        await fs.move(
            path.join(starterPath, file),
            path.join(rootDir, file),
            { overwrite: true }
        );
    }

    // cleanup EVERYTHING else
    await fs.remove(path.join(rootDir, version));
}
