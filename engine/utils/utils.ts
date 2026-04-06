// Function to compress HTML
export function compressHTML(html: string): string {
    return html
        .replace(/<!--[\s\S]*?-->/g, "")
        .replace(/>\s+</g, "><")
        .replace(/\n/g, "")
        .trim();
}
