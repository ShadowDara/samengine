// Generate the HTML File

export interface buildconfig {
    htmlhead: string;
    title: string;
    version: string;
    show_fullscreen_button: boolean;
    entryname: string;
    outdir: string;
}

export function new_buildconfig(): buildconfig {
    return {
        htmlhead: "",
        title: "My new Game",
        version: "0.0.0",
        show_fullscreen_button: true,
        entryname: "main",
        outdir: "dist",
    }
}

// Function to get the Version
export function version(): string {
    return "1.5.3";
}
