import { jsx, setInnerHTML, setScript } from "../runtime";
import { parseMarkdown } from "samengine/utils";
import { loadRaw } from "./../file-loader";

const initialMarkdown = `# Hallo

Schreib hier **Markdown**.`;

const source = await loadRaw("./game/helper.ts");

function App() {
  return (
    <div class="app">
      <h1>Live Markdown Editor</h1>
      <textarea id="markdown-input">{initialMarkdown}</textarea>
      <div id="markdown-preview">
        {setInnerHTML(parseMarkdown(initialMarkdown))}
      </div>
      {setScript(source)}
    </div>
  );
}

export default App;
