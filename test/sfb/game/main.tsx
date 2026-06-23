import { loadRaw } from "../file-loader";
import { jsx, setScript } from "../runtime";

function App() {
  let source = await loadRaw("./helper");

  return (
    <div class="app">
      <nav>
        <a href="#/">Home</a>
        <a href="#/about">About</a>
      </nav>

      <div id="router-view"></div>

      {setScript(source)}
    </div>
  );
}

export default App;
