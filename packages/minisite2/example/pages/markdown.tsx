import { h, Fragment } from "minisite/jsx-runtime";
import { Header } from "../components/Header.js";

// import { parseMarkdown } from "samenine/utils";

// (window as any).parseMarkdown = parseMarkdown;

export default function MarkdownPage() {
  return (
    <>
      <Header />

      <main className="container">
        <h1>Markdown Live</h1>

        <textarea
          id="md-input"
          placeholder="Schreibe Markdown..."
        ></textarea>

        <div id="md-preview"></div>
      </main>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            const input = document.getElementById("md-input");
            const preview = document.getElementById("md-preview");

            function render() {
              // HIER rufst du deinen Markdown Parser auf
              preview.innerHTML = window.parseMarkdown
                ? window.parseMarkdown(input.value)
                : input.value;
            }

            input.addEventListener("input", render);
            render();
          `,
        }}
      />
    </>
  );
}
