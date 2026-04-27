// Key Value Save
export type SaveData = Record<string, any>;

// Please rename the SaveKey
export let SAVE_KEY = "my_game_save";

export function saveGame(data: SaveData): void {
    try {
        const json = JSON.stringify(data);
        localStorage.setItem(SAVE_KEY, json);
        console.log("Game saved!");
    } catch (err) {
        console.error("Save failed:", err);
    }
}

export function loadGame(): SaveData | null {
    try {
        const json = localStorage.getItem(SAVE_KEY);
        if (!json) return null;
        return JSON.parse(json);
    } catch (err) {
        console.error("Load failed:", err);
        return null;
    }
}

export function clearSave(): void {
    localStorage.removeItem(SAVE_KEY);
    console.log("Save cleared!");
}

export function exportSave(): void {
    try {
        const json = localStorage.getItem(SAVE_KEY);
        if (!json) {
            console.warn("No save data found.");
            return;
        }

        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "savegame.json";
        a.click();

        URL.revokeObjectURL(url);

        console.log("Save exported!");
    } catch (err) {
        console.error("Export failed:", err);
    }
}
