// ================= ARG PARSING =================
/** Parsed command-line options for the `samengine-build` executable. */
export interface CLIArgs {
    /** True when the user passed `--release` or `-r`. */
    release: boolean;

    /** Reserved for a CLI-level single-file flag. The config currently controls this. */
    singlefile: boolean;

    /** Project name passed to `--new` or `--new-empty`; otherwise `null`. */
    newProject: string | null;

    /** True when `--new-empty` should create an empty starter instead of the example game. */
    empty: boolean;
}

/**
 * Parses CLI arguments from `process.argv`.
 *
 * Unknown arguments are reported as warnings instead of crashing the process, so
 * the CLI stays forgiving while still making mistakes visible.
 */
export function parseArgs(): CLIArgs {
    const args = process.argv.slice(2);
    const options: CLIArgs = { release: false, singlefile: false, newProject: null, empty: false };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        switch (arg) {
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
