"use client";

import { description, site } from "@/lib/data";
import { useEffect, useState } from "react";
import { StorageLib } from "samengine/storage";

const STORAGE_KEY = "color";

type ColorItem = {
    id: number;
    name: string;
    color: string;
};

export default function Home() {
    const [name, setName] = useState<string>("");
    const [color, setColor] = useState<string>("#3b82f6");
    const [colors, setColors] = useState<ColorItem[]>([]);
    const [copied, setCopied] = useState<string>("");

    const isValidHex = (value: string): boolean => {
        return /^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(value);
    };

    const exportColors = () => {
        const json = StorageLib.exportToJson(true);

        const blob = new Blob([json], {
            type: "application/json",
        });

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "colors-backup.json";
        a.click();

        URL.revokeObjectURL(url);
    };

    const importColors = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];

        if (!file) return;

        const json = await file.text();

        try {
            StorageLib.importFromJson(json, true);

            const saved =
                StorageLib.get<ColorItem[]>(STORAGE_KEY);

            if (saved) {
                setColors(saved);
            }

            alert("Import erfolgreich");
        } catch {
            alert("Ungültige JSON-Datei");
        }

        e.target.value = "";
    };

    useEffect(() => {
        const savedColors = localStorage.getItem(STORAGE_KEY);
        StorageLib.set("website", site)
        StorageLib.set("description", description)

        if (savedColors) {
            setColors(JSON.parse(savedColors) as ColorItem[]);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(colors));
    }, [colors]);

    const addColor = (): void => {
        if (!name.trim()) return;

        if (!isValidHex(color)) {
            alert("Bitte eine gültige HEX-Farbe eingeben.");
            return;
        }

        const newColor: ColorItem = {
            id: Date.now(),
            name,
            color: color.toUpperCase(),
        };

        setColors((prev) => [newColor, ...prev]);

        setName("");
        setColor("#3B82F6");
    };

    const deleteColor = (id: number): void => {
        setColors((prev) => prev.filter((item) => item.id !== id));
    };

    const copyColor = async (hex: string): Promise<void> => {
        await navigator.clipboard.writeText(hex);

        setCopied(hex);

        setTimeout(() => {
            setCopied("");
        }, 1500);
    };

    return (
        <main className="min-h-screen bg-zinc-950 text-white p-8">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-4xl font-bold mb-8">
                    🎨 UI Color Manager
                </h1>

                <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 mb-8">
                    <div className="grid md:grid-cols-4 gap-4">
                        <input
                            type="text"
                            placeholder="Color Name"
                            value={name}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                            ) => setName(e.target.value)}
                            className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 outline-none focus:border-blue-500"
                        />

                        <input
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="w-full h-12 rounded-lg cursor-pointer"
                        />

                        <input
                            type="text"
                            placeholder="#3B82F6"
                            value={color}
                            onChange={(e) => {
                                const value = e.target.value.toUpperCase();

                                setColor(value);
                            }}
                            className={`bg-zinc-800 border rounded-lg px-4 py-3 outline-none font-mono ${color.length > 0 && !isValidHex(color)
                                ? "border-red-500"
                                : "border-zinc-700"
                                }`}
                        />

                        <button
                            onClick={addColor}
                            className="bg-blue-600 hover:bg-blue-700 transition rounded-lg font-semibold"
                        >
                            add Color
                        </button>
                    </div>

                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={exportColors}
                            className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700"
                        >
                            Export JSON
                        </button>

                        <label className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 cursor-pointer">
                            Import JSON
                            <input
                                type="file"
                                accept=".json"
                                onChange={importColors}
                                className="hidden"
                            />
                        </label>
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                        <div
                            className="w-12 h-12 rounded-lg border border-zinc-700"
                            style={{ backgroundColor: color }}
                        />

                        <span className="font-mono text-lg">
                            {color.toUpperCase()}
                        </span>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {colors.map((item: ColorItem) => (
                        <div
                            key={item.id}
                            className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800"
                        >
                            <div
                                className="h-36"
                                style={{
                                    backgroundColor: item.color,
                                }}
                            />

                            <div className="p-5">
                                <h2 className="font-bold text-xl mb-2">
                                    {item.name}
                                </h2>

                                <button
                                    onClick={() => copyColor(item.color)}
                                    className="w-full bg-zinc-800 hover:bg-zinc-700 rounded-lg p-3 font-mono transition"
                                >
                                    {copied === item.color
                                        ? "✅ Kopiert"
                                        : item.color.toUpperCase()}
                                </button>

                                <button
                                    onClick={() => deleteColor(item.id)}
                                    className="w-full mt-3 bg-red-600 hover:bg-red-700 rounded-lg p-3 transition"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {colors.length === 0 && (
                    <div className="text-center text-zinc-500 mt-16">
                        Saved no Colors
                    </div>
                )}
            </div>
        </main>
    );
}
