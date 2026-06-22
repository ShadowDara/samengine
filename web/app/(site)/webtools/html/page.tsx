"use client";

import { useEffect, useState } from "react";

import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-css";
import "prismjs/components/prism-javascript";

import Editor from "@monaco-editor/react";

export default function HtmlPreviewPage() {
  const [html, setHtml] = useState(`<!DOCTYPE html>
<html>
<head>
  <title>Preview</title>
</head>
<body>
  <h1>Hello World</h1>
  <p>HTML hier einfügen...</p>
</body>
</html>`);

  const [previewOnly, setPreviewOnly] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F9") {
        e.preventDefault();
        setPreviewOnly((v) => !v);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (previewOnly) {
    return (
      <iframe
        title="HTML Preview"
        srcDoc={html}
        className="fixed inset-0 w-screen h-screen border-0 bg-white z-50"
        sandbox="allow-scripts allow-forms allow-modals"
      />
    );
  }

  return (
    <div className="h-[calc(100vh-60px)] flex flex-col bg-zinc-950">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900">
        <h1 className="text-sm font-semibold text-zinc-200">
          HTML Live Preview
        </h1>

        <button
          onClick={() => setPreviewOnly(true)}
          className="px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm transition"
        >
          Preview Fullscreen (F9)
        </button>
      </div>

      {/* Editor */}
      <div className="relative h-1/3 border-b border-zinc-800">
        <Editor
          height="100%"
          defaultLanguage="html"
          value={html}
          onChange={(value) => setHtml(value || "")}
          theme="vs-dark"
        />
      </div>

      {/* Preview */}
      <div className="flex-1 bg-white">
        <iframe
          title="HTML Preview"
          srcDoc={html}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-forms allow-modals"
        />
      </div>
    </div>
  );
}
