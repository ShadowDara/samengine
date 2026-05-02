// Arguments for the CLI Tool

// ================= ARG PARSING =================
export interface CLIArgs {
    release: boolean;
    singlefile: boolean;
    newProject: string | null;
    empty: boolean;
}

// Function to parse the Args for the CLI Tools
export function parseArgs(): CLIArgs {
    const args = process.argv.slice(2);
    const options: CLIArgs = { release: false, singlefile: false, newProject: null, empty: false };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        switch (arg) {
            case "--single-file":
                options.singlefile = true;
                break;
            case "--release":
            case "-r":
                options.release = true;
                break;
            case "--new":
            case "-n":
                options.newProject = args[++i];
                break;
            case "--new-empty":
                options.newProject = args[++i];
                options.empty = true;
                break;
            case "-h":
            case "--help":
                console.log("CLI Tools for samengine\nUsage:\n  -r, --release\n  -n <project>\n  --new-empty\n --single-file   to generate the Export into one file");
                process.exit(0);
            default:
                console.warn(`⚠️ Unknown Argument: ${arg}`);
        }
    }
    return options;
}
