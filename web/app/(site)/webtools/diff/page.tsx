"use client";

import { useState } from "react";
import ReactDiffViewer from "react-diff-viewer-continued";

export default function Home() {
  const [leftText, setLeftText] = useState("");
  const [rightText, setRightText] = useState("");

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-bold mb-6">
          Git Diff Viewer
        </h1>

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => {
              setLeftText("");
              setRightText("");
            }}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700"
          >
            Clean
          </button>

          <button
            onClick={() => {
              navigator.clipboard.writeText(leftText);
            }}
            className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700"
          >
            Copy Left
          </button>

          <button
            onClick={() => {
              navigator.clipboard.writeText(rightText);
            }}
            className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700"
          >
            Copy Right
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div>
            <label className="block mb-2 text-sm text-zinc-400">
              Old Text
            </label>

            <textarea
              value={leftText}
              onChange={(e) => setLeftText(e.target.value)}
              className="w-full h-80 rounded-lg bg-zinc-900 border border-zinc-800 p-4 font-mono"
              placeholder="Paste Text here..."
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-zinc-400">
              New Text
            </label>

            <textarea
              value={rightText}
              onChange={(e) => setRightText(e.target.value)}
              className="w-full h-80 rounded-lg bg-zinc-900 border border-zinc-800 p-4 font-mono"
              placeholder="Paste Text here..."
            />
          </div>
        </div>

        <div className="rounded-xl overflow-hidden border border-zinc-800">
          <ReactDiffViewer
            oldValue={leftText}
            newValue={rightText}
            splitView={true}
            showDiffOnly={false}
            useDarkTheme={true}
          />
        </div>
      </div>
    </main>
  );
}
