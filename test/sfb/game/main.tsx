import { jsx, setInnerHTML, setScript } from "../runtime";
import { parseMarkdown } from "samengine/utils";

const initialMarkdown = `# Hallo

Schreib hier **Markdown**.`;

const liveMarkdownScript = `
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
    .replace(/^# (.*)$/gm, "<h1>$1</h1>")
    .replace(/^## (.*)$/gm, "<h2>$1</h2>")
    .replace(/\\*\\*(.*?)\\*\\*/g, "<strong>$1</strong>")
    .replace(/\\n{2,}/g, "</p><p>")
    .replace(/\\n/g, "<br>");
}

function updatePreview() {
  preview.innerHTML = "<p>" + parseMarkdownLive(input.value) + "</p>";
}

input.addEventListener("input", updatePreview);
`;

function App() {
  return (
    <div class="app">
      <h1>Live Markdown Editor</h1>
      <textarea id="markdown-input">{initialMarkdown}</textarea>
      <div id="markdown-preview">
        {setInnerHTML(parseMarkdown(initialMarkdown))}
      </div>
      {setScript(liveMarkdownScript)}
    </div>
  );
}

export default App;
