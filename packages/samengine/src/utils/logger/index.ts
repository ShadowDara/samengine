// Logger

/**
 * Function to get the Date for the Logger
 * @returns String for the current Date
 */
export function getDate(): string {
    const now = new Date();
    const time =
        `[${now.getHours().toString().padStart(2, "0")}:` +
        `${now.getMinutes().toString().padStart(2, "0")}:` +
        `${now.getSeconds().toString().padStart(2, "0")}.` +
        `${now.getMilliseconds().toString().padStart(3, "0")}]`;

    return time;
}

/**
 * Logger Class for samengine
 */
export class Logger {
    constructor() { }

    log(input: string): void {
        console.log(`${getDate()} ${input}`);
    }

    warn(input: string): void {
        console.warn(`${getDate()} ${input}`);
    }

    error(input: string): void {
        console.error(`${getDate()} ${input}`);
    }
}

/**
 * Logger Class with the same functions but they are doing nothing
 * to remove the console logs in the export
 */
export class ExportLogger {
    constructor() { }

    log(input: string): void {
        // Empty
    }

    warn(input: string): void {
        // Empty
    }

    error(input: string): void {
        // Empty
    }
}
