// Function to compress HTML
export function compressHTML(html: string): string {
    console.log("This is a broken function! Dont use it!");
    return html;
    return html
        .replace(/<!--[\s\S]*?-->/g, "")
        .replace(/>\s+</g, "><")
        .replace(/\n/g, "")
        .trim();
}
