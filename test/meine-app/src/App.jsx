import { useEffect, useState } from "react";
import Samengine from "samengine-build-react/samengine";
import { GetSingleFileHTML } from "samengine-build/html";
import { new_buildconfig } from "samengine-build";
import gameCode from "./game.ts?raw";

function App() {
  const [html, setHtml] = useState("");

  useEffect(() => {
    async function run() {
      const content = GetSingleFileHTML(
        new_buildconfig(),
        gameCode,
        "1.0.0"
      );

      setHtml(content);
    }

    run();
  }, []);

  return <Samengine html={html} />;
}

export default App;
