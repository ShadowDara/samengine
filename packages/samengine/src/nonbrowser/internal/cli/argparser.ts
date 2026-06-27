// ================= ARG PARSING =================
/** Parsed command-line options for the `samengine-build` executable. */
export interface CLIArgs {
    /** True when the user passed `--release` or `-r`. */
    release: boolean;

    /** Reserved for a CLI-level single-file flag. The config currently controls this. */
    singlefile: boolean;

    /** Project name passed to `--new` or `--new-empty`; otherwise `null`. */
    newProject: boolean;

    /** Show a Help Message */
    help: boolean;
}

/**
 * Parses CLI arguments from `process.argv`.
 *
 * Unknown arguments are reported as warnings instead of crashing the process, so
 * the CLI stays forgiving while still making mistakes visible.
 */
export function parseArgs(): CLIArgs {
    const args = process.argv.slice(2);
    const options: CLIArgs = { release: false, singlefile: false, newProject: false, help: false };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        switch (arg) {
            case "--release":
            case "-r":
                options.release = true;
                break;
            case "create":
            case "new":
            case "--new":
            case "-n":
            case "--new-empty":
                options.newProject = true;
                break;
            case "help":
            case "h":
            case "-h":
            case "--help":
                options.help = true;
                break;
            default:
                console.warn(`⚠️ Unknown Argument: ${arg}`);
                break;
        }
    }
    return options;
}
