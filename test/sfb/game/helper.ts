const input = document.querySelector("#markdown-input");
const preview = document.querySelector("#markdown-preview");

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function parseMarkdownLive(markdown) {
  return escapeHtml(markdown)
    .replace(/^## (.*)$/gm, "<h2>$1</h2>")
    .replace(/^# (.*)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n{2,}/g, "</p><p>")
    .replace(/\n/g, "<br>");
}

function updatePreview() {
  preview.innerHTML = "<p>" + parseMarkdownLive(input.value) + "</p>";
}

input.addEventListener("input", updatePreview);
