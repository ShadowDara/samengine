// Generate the HTML File

export interface buildconfig {
    htmlhead: string;
    title: string;
    show_fullscreen_button: boolean;
    entryname: string;
    outdir: string;
}

export function new_buildconfig(): buildconfig {
    return {
        htmlhead: "",
        title: "My new Game",
        show_fullscreen_button: true,
        entryname: "./game/main.ts",
        outdir: "dist",
    }
}
