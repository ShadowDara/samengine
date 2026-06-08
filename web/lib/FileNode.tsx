import { FileExistence } from "./types";

interface FileNodeData {
  name: string;
  existence: FileExistence;
}

interface FileNodeProps {
  file: FileNodeData;
  onChange: (file: FileNodeData) => void;
  onDelete: () => void;
}

export default function FileNode({
  file,
  onChange,
  onDelete,
}: FileNodeProps) {
  return (
    <div className="border rounded-xl p-4 bg-slate-50">
      <div className="grid md:grid-cols-2 gap-4">
        <input
          className="border rounded-xl p-3"
          placeholder="Dateiname"
          value={file.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onChange({
              ...file,
              name: e.target.value,
            })
          }
        />

        <select
          className="border rounded-xl p-3"
          value={file.existence}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            onChange({
              ...file,
              existence: e.target.value as FileExistence,
            })
          }
        >
          <option value="required">required</option>
          <option value="optional">optional</option>
          <option value="forbidden">forbidden</option>
        </select>
      </div>

      <button
        onClick={onDelete}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded-xl"
      >
        Entfernen
      </button>
    </div>
  );
}
