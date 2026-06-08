'use client';

import { useState } from "react";
import FolderNode from "@/lib/FolderNode";

export default function App() {
  const [data, setData] = useState({
    name: "",
    description: "",
    min_version: "",
    command: "",
    invert_command: false,
    tags: [],
    size: null,
    files: [],
    folders: []
  });

  const generateJson = () => {
    return JSON.stringify(data, null, 2);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow">
          <h1 className="text-3xl font-bold mb-6">
            Folder Template Builder
          </h1>

          <div className="space-y-4">
            <input
              className="w-full border rounded-xl p-3"
              placeholder="Name"
              value={data.name}
              onChange={(e) =>
                setData({ ...data, name: e.target.value })
              }
            />

            <textarea
              className="w-full border rounded-xl p-3"
              placeholder="Beschreibung"
              value={data.description}
              onChange={(e) =>
                setData({
                  ...data,
                  description: e.target.value
                })
              }
            />

            <input
              className="w-full border rounded-xl p-3"
              placeholder="Min Version"
              value={data.min_version}
              onChange={(e) =>
                setData({
                  ...data,
                  min_version: e.target.value
                })
              }
            />
          </div>

          <div className="mt-6">
            <FolderNode
              root
              folder={{
                name: data.name, // 👈 FIX
                folders: data.folders,
                files: data.files
              }}
              onChange={(value: { folders: any; files: any; }) =>
                setData({
                  ...data,
                  folders: value.folders,
                  files: value.files
                })
              }
            />
          </div>
        </div>

        <div className="bg-slate-900 rounded-3xl p-6">
          <pre className="text-green-400 whitespace-pre-wrap">
            {generateJson()}
          </pre>
        </div>
      </div>
    </div>
  );
}
