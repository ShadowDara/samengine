// Function to compress HTML
function compressHTML(html: string): string {
    return html
        .replace(/<!--[\s\S]*?-->/g, "")
        .replace(/>\s+</g, "><")
        .replace(/\n/g, "")
        .trim();
}
