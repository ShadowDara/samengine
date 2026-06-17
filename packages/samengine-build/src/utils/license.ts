import { newMarkdownStyle, Paragraph } from "../buildconfig";

export interface licenseconfig {}

export function licenseMaker(c: licenseconfig): Paragraph {
    let p = { title: "License", content: "", style: newMarkdownStyle() }

    p.content = `
# Open Source Notices for $$Game Name
    `;

    return p;
}
