"use client";

import { site } from "@/lib/data";
import { useEffect, useState } from "react";
import { StorageLib } from "samengine/storage";

const STORAGE_KEY = "copy-panel-entries";

type Entry = {
  id: string;
  title: string;
  content: string;
};

export default function Home() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);

  const exportEntries = () => {
    const json = StorageLib.exportToJson(true);

    const blob = new Blob([json], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "copy-panel-backup.json";
    a.click();

    URL.revokeObjectURL(url);
  };

  const importEntries = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const json = await file.text();

    try {
      StorageLib.importFromJson(json, true);

      const saved = StorageLib.get<Entry[]>(STORAGE_KEY);

      if (saved) {
        setEntries(saved);
      }

      alert("Import successful");
    } catch {
      alert("Invalid JSON file");
    }

    e.target.value = "";
  };

  useEffect(() => {
    const saved = StorageLib.get<Entry[]>(STORAGE_KEY);
    StorageLib.set("website", site)

    if (saved) {
      setEntries(saved);
    }
  }, []);

  const saveEntries = (newEntries: Entry[]) => {
    setEntries(newEntries);
    StorageLib.set(STORAGE_KEY, newEntries);
  };

  const addEntry = () => {
    if (!title.trim() || !content.trim()) return;

    const entry: Entry = {
      id: crypto.randomUUID(),
      title: title.trim(),
      content: content.trim(),
    };

    saveEntries([entry, ...entries]);

    setTitle("");
    setContent("");
  };

  const removeEntry = (id: string) => {
    saveEntries(entries.filter((e) => e.id !== id));
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-4xl font-bold">
          📋 CopyPanel
        </h1>

        <div className="mb-8 rounded-xl border border-slate-800 bg-slate-900 p-4">
          <div className="flex flex-col gap-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3"
            />

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Copy Text..."
              rows={2}
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3"
            />

            <button
              onClick={addEntry}
              className="rounded-lg bg-blue-600 py-3 font-semibold hover:bg-blue-500"
            >
              Add
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="rounded-xl border border-slate-800 bg-slate-900 p-4"
            >
              <h2 className="mb-3 text-lg font-semibold">
                {entry.title}
              </h2>

              <p className="mb-4 whitespace-pre-wrap break-words text-slate-300">
                {entry.content}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    copyToClipboard(entry.content)
                  }
                  className="flex-1 rounded-lg bg-green-600 py-2 hover:bg-green-500"
                >
                  📋 Copy
                </button>

                <button
                  onClick={() =>
                    removeEntry(entry.id)
                  }
                  className="rounded-lg bg-red-600 px-4 hover:bg-red-500"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={exportEntries}
            className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold hover:bg-indigo-500"
          >
            Export
          </button>

          <label className="cursor-pointer rounded-lg bg-orange-600 px-6 py-3 font-semibold hover:bg-orange-500">
            Import
            <input
              type="file"
              accept=".json"
              onChange={importEntries}
              className="hidden"
            />
          </label>
        </div>

      </div>
    </main>
  );
}
