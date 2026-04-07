import { minify } from "html-minifier-terser";

// Function to compress HTML
export async function compressHTML(html: string): Promise<string> {
    return await minify(html, {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeEmptyAttributes: true,
        minifyCSS: true,
        minifyJS: true,
    });
}
