import { jsx, setInnerHTML } from "../runtime";
import { parseMarkdown } from "samengine/utils";

function App() {
  return (
    <div class="app">
      <h1>Hello TSX</h1>
      <p>Ohne React, nur dein eigener Compiler</p>
      <button onclick="alert('läuft!')">
        Klick mich
      </button>
      {setInnerHTML(parseMarkdown("# Hallo"))}
    </div>
  )
  ;
}

export default App;
