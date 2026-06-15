import { minify } from "html-minifier-terser";

/**
 * Minifies generated HTML for release builds.
 *
 * The minifier also processes inline CSS and JavaScript, which matters for
 * single-file builds because they can place the whole game shell into one
 * `index.html`.
 */
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
