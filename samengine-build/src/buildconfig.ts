// Generate the HTML File

export interface buildconfig {
    htmlhead: string;
    title: string;
    version: string;
    show_fullscreen_button: boolean;
    entryname: string;
    outdir: string;
    markdown_notes: Paragraph[];
    gameauthor: string;
}

export interface Paragraph {
    title: string;
    content: string;
    style: Style;
}

export interface Style {
    color: string;
    bg_color: string;
}

export function new_buildconfig(): buildconfig {
    return {
        htmlhead: "",
        title: "My new Game",
        version: "Your Game Version",
        show_fullscreen_button: true,
        entryname: "main",
        outdir: "dist",
        markdown_notes: [],
        gameauthor: "DEV",

    }
}
