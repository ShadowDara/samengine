"use client";

import { useState } from "react";

export default function HtmlPreviewPage() {
  const [html, setHtml] = useState(`<!DOCTYPE html>
<html>
<head>
  <title>Preview</title>
</head>
<style>
* {
background-color: white; }
</style>
<body>
  <h1>Hello World</h1>
  <p>HTML hier einfügen...</p>
</body>
</html>`);

  return (
    <div className="h-[calc(100vh-60px)] flex flex-col">
      {/* Editor */}
      <div className="h-1/3 border-b">
        <textarea
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          className="w-full h-full p-4 font-mono text-sm resize-none outline-none"
          placeholder="HTML hier einfügen..."
        />
      </div>

      {/* Preview */}
      <div className="flex-1">
        <iframe
          title="HTML Preview"
          srcDoc={html}
          className="w-full h-full border-0 text-white" 
          sandbox="allow-scripts allow-forms allow-modals"
        />
      </div>
    </div>
  );
}
