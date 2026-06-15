"use client";

import { useState } from "react";
import { parseMarkdownToDocument } from "samengine/utils";

export default function MarkdownEditor() {
    const [content, setContent] = useState(`# Hallo Welt

Schreibe hier dein Markdown...
`);

const defaultCss = `
:root {
  --md-font: system-ui, sans-serif;
  --md-mono: "Fira Code", "Cascadia Code", Consolas, monospace;
  --md-max-width: 800px;
  --md-line-height: 1.7;
  --md-color: #ededed;
  --md-bg: #0a0a0a;
  --md-code-bg: #f4f4f8;
  --md-border: #d1d5db;
  --md-accent: #3b5bdb;
  --md-blockquote: #6b7280;
}
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; background: var(--md-bg); color: var(--md-color); }
.md-body {
  font-family: var(--md-font);
  line-height: var(--md-line-height);
  max-width: var(--md-max-width);
  margin: 2rem auto;
  padding: 0 1.5rem;
}
h1,h2,h3,h4,h5,h6 {
  margin: 1.6em 0 0.4em;
  line-height: 1.25;
  font-weight: 700;
}
h1 { font-size: 2rem; border-bottom: 2px solid var(--md-border); padding-bottom: 0.3em; }
h2 { font-size: 1.5rem; border-bottom: 1px solid var(--md-border); padding-bottom: 0.2em; }
p { margin: 0.8em 0; }
a { color: var(--md-accent); }
code {
  font-family: var(--md-mono);
  font-size: 0.875em;
  background: var(--md-code-bg);
  padding: 0.15em 0.35em;
  border-radius: 4px;
}
pre { background: var(--md-code-bg); border-radius: 6px; padding: 1em; overflow-x: auto; }
pre code { background: none; padding: 0; font-size: 0.9em; }
blockquote {
  margin: 1em 0;
  padding: 0.5em 1em;
  border-left: 4px solid var(--md-accent);
  color: var(--md-blockquote);
}
table { border-collapse: collapse; width: 100%; margin: 1em 0; }
th, td { border: 1px solid var(--md-border); padding: 0.5em 0.8em; }
th { background: var(--md-code-bg); font-weight: 600; }
tr:nth-child(even) td { background: #fafafa; }
ul, ol { padding-left: 1.5em; margin: 0.8em 0; }
li { margin: 0.25em 0; }
hr { border: none; border-top: 2px solid var(--md-border); margin: 2em 0; }
img { max-width: 100%; height: auto; border-radius: 4px; }
mark { background: #fef08a; padding: 0.1em 0.2em; border-radius: 2px; }
input[type="checkbox"] { margin-right: 0.4em; }
.footnotes { font-size: 0.875em; color: var(--md-blockquote); }
`;

    const insertText = (before: string, after = "") => {
        const textarea = document.getElementById(
            "markdown-editor"
        ) as HTMLTextAreaElement;

        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        const selected = content.slice(start, end);

        const newValue =
            content.slice(0, start) +
            before +
            selected +
            after +
            content.slice(end);

        setContent(newValue);

        requestAnimationFrame(() => {
            textarea.focus();
            textarea.setSelectionRange(
                start + before.length,
                end + before.length
            );
        });
    };

    return (
        <div className="flex h-[90vh] flex-col overflow-hidden mt-2 rounded-2xl border border-zinc-800 bg-zinc-950">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-2 border-b border-zinc-800 p-3">
                <ToolbarButton
                    label="B"
                    onClick={() => insertText("**", "**")}
                />
                <ToolbarButton
                    label="I"
                    onClick={() => insertText("*", "*")}
                />
                <ToolbarButton
                    label="H1"
                    onClick={() => insertText("# ")}
                />
                <ToolbarButton
                    label="H2"
                    onClick={() => insertText("## ")}
                />
                <ToolbarButton
                    label="Link"
                    onClick={() => insertText("[", "](url)")}
                />
                <ToolbarButton
                    label="Code"
                    onClick={() => insertText("`", "`")}
                />
                <ToolbarButton
                    label="Quote"
                    onClick={() => insertText("> ")}
                />
                <ToolbarButton
                    label="Liste"
                    onClick={() => insertText("- ")}
                />
            </div>

            {/* Editor + Preview */}
            <div className="grid flex-1 md:grid-cols-2">
                <textarea
                    id="markdown-editor"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="
            h-full
            resize-none
            border-b
            border-zinc-800
            bg-zinc-950
            p-5
            font-mono
            text-sm
            text-zinc-100
            outline-none
            md:border-b-0
            md:border-r
          "
                    placeholder="Markdown eingeben..."
                />

                <div className="overflow-auto p-5">
                        <iframe
                            title="Preview"
                            className="h-full w-full"
                            srcDoc={parseMarkdownToDocument(content, { css: defaultCss })}
                        />
                </div>
            </div>
        </div>
    );
}

function ToolbarButton({
    label,
    onClick,
}: {
    label: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="
        rounded-lg
        border
        border-zinc-700
        bg-zinc-900
        px-3
        py-1.5
        text-sm
        text-zinc-200
        transition
        hover:bg-zinc-800
      "
        >
            {label}
        </button>
    );
}
