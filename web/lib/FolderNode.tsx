import FileNode from "./FileNode";
import { FileTemplate, FolderTemplate } from "./types";

export default function FolderNode({
  folder,
  onChange,
  root = false
}) {
  const updateFolder = (key, value) => {
    onChange({
      ...folder,
      [key]: value
    });
  };

  const addFolder = () => {
    updateFolder("folders", [
      ...(folder.folders || []),
      {
        name: "",
        files: [],
        folders: []
      }
    ]);
  };

  const addFile = () => {
    updateFolder("files", [
      ...(folder.files || []),
      {
        name: "",
        existence: "required"
      }
    ]);
  };

  return (
    <div className="space-y-4">
      {!root && (
        <input
          className="w-full border rounded-xl p-3"
          placeholder="Ordnername"
          value={folder.name || ""}
          onChange={(e) =>
            updateFolder("name", e.target.value)
          }
        />
      )}

      <div className="space-y-2">
        {(folder.files || []).map(
          (file: FileTemplate, index) => (
            <FileNode
              key={index}
              file={file}
              onChange={(newFile: FileTemplate) => {
                const files = [...folder.files];
                files[index] = newFile;

                updateFolder(
                  "files",
                  files
                );
              }}
              onDelete={() => {
                updateFolder(
                  "files",
                  folder.files.filter(
                    (_, i) =>
                      i !== index
                  )
                );
              }}
            />
          )
        )}
      </div>

      <div className="space-y-4">
        {(folder.folders || []).map(
          (subFolder: FolderTemplate, index) => (
            <FolderNode
              key={index}
              folder={subFolder}
              onChange={(
                updatedFolder: FolderTemplate
              ) => {
                const folders = [
                  ...folder.folders
                ];

                folders[index] =
                  updatedFolder;

                updateFolder(
                  "folders",
                  folders
                );
              }}
            />
          )
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={addFile}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl"
        >
          + Datei
        </button>

        <button
          onClick={addFolder}
          className="bg-emerald-600 text-white px-4 py-2 rounded-xl"
        >
          + Ordner
        </button>
      </div>
    </div>
  );
}
