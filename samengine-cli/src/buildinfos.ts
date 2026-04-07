#!/usr/bin/env node

// buildinfos.ts
// TypeScript version of your Python Buildinfos script

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "fs";
import { join } from "path";
import os from "os";
import chalk from 'chalk';
import { mkdir } from "fs/promises";

const CONFIG_FILE = ".webgameengine/buildinfos.json";

// Sample config
const sampleConfig = {
    Buildinfos: {
        Destination: "",
        Filename: "builtinfos.json",
        Version: "0.0.0",
        Name: "Buildinfos",
        Description: "A simple TS script to generate build infos",
        ProgramWebsite: "",
        Author: "Me",
        AuthorWebsite: "",
        License: "",
        Buildfolder: "build/"
    }
};

// Types

type Config = typeof sampleConfig;

// Load config
function loadConfig(): Config {
    if (!existsSync(CONFIG_FILE)) {
        throw new Error("Config file not found. Run with 'setup' first.");
    }

    try {
        const data = JSON.parse(readFileSync(CONFIG_FILE, "utf-8"));
        return data;
    } catch (err) {
        throw new Error("Invalid JSON config");
    }
}

// Folder size
function getFolderSize(path: string): number {
    let total = 0;

    const items = readdirSync(path);

    for (const item of items) {
        const full = join(path, item);
        const stats = statSync(full);

        if (stats.isDirectory()) {
            total += getFolderSize(full);
        } else {
            total += stats.size;
        }
    }

    return total;
}

// Human readable size
function formatSize(bytes: number): string {
    const units = ["B", "KB", "MB", "GB", "TB"];
    let i = 0;

    while (bytes >= 1024 && i < units.length - 1) {
        bytes /= 1024;
        i++;
    }

    return `${bytes.toFixed(2)} ${units[i]}`;
}

// Create build info
function createBuildInfo(config: Config) {
    const c = config.Buildinfos;

    const outputPath = join(c.Destination || ".", c.Filename);

    const buildInfo = {
        name: c.Name,
        description: c.Description,
        website: c.ProgramWebsite,
        author: c.Author,
        authorwebsite: c.AuthorWebsite,
        license: c.License,
        version: c.Version,
        build_time: new Date().toISOString(),
        node_version: process.version,
        user: os.userInfo().username,
        platform: os.platform(),
        buildsize: formatSize(getFolderSize(c.Buildfolder || "."))
    };

    writeFileSync(outputPath, JSON.stringify(buildInfo, null, 4), "utf-8");

    console.log("Build info created:", outputPath);
}

// Setup
async function setup() {
    await mkdir(".webgameengine", { recursive: true });

    writeFileSync(CONFIG_FILE, JSON.stringify(sampleConfig, null, 4), "utf-8");
    console.log("Created new config file");
}

// Help
function help() {
    console.log(`
${chalk.green("Buildinfos CLI by webgameengine")}

Commands:
    setup   Create config file
    help    Show this help
    (none)  Generate buildinfos
`);
}

// Main
function main() {
    const args = process.argv.slice(2);

    try {
        if (args[0] === "setup") {
            setup();
            return;
        }

        if (args[0] === "help") {
            help();
            return;
        }

        console.log("Creating Buildinfos...");

        try {
            const config = loadConfig();
            createBuildInfo(config);
        } catch (err: any) {
            console.error("Error:", err.message);
        }

    } catch (err: any) {
        console.error("Error:", err.message);
        process.exit(1);
    }
}

// Start the Cli Tool
main();
