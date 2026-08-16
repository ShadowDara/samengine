// settings.test.ts
import { describe, it, expect, beforeEach } from "bun:test";
import {
    setGameSettings,
    getGameSettings,
    setGameSetting,
    getGameSetting,
    clearGameSettings,
    onGameSettingsChange,
} from "./settings";

describe("Settings Runtime", () => {
    beforeEach(() => {
        clearGameSettings();
    });

    it("returns the fallback when a setting was never set", () => {
        expect(getGameSetting("cards", "8")).toBe("8");
    });

    it("stores and reads a single setting", () => {
        setGameSetting("cards", "16");
        expect(getGameSetting("cards", "8")).toBe("16");
    });

    it("setGameSetting does not clear other settings", () => {
        setGameSettings({ cards: "8", sound: "on" });
        setGameSetting("cards", "32");

        expect(getGameSetting("cards")).toBe("32");
        expect(getGameSetting("sound")).toBe("on");
    });

    it("setGameSettings replaces the whole settings object", () => {
        setGameSettings({ cards: "8", sound: "on" });
        setGameSettings({ cards: "4" });

        expect(getGameSetting("cards")).toBe("4");
        expect(getGameSetting("sound", "off")).toBe("off");
    });

    it("getGameSettings returns a copy, not a live reference", () => {
        setGameSettings({ cards: "8" });

        const snapshot = getGameSettings();
        snapshot.cards = "mutated";

        expect(getGameSetting("cards")).toBe("8");
    });

    it("clearGameSettings removes every setting", () => {
        setGameSettings({ cards: "8" });
        clearGameSettings();

        expect(getGameSetting("cards", "fallback")).toBe("fallback");
    });

    it("notifies listeners on every mutation and supports unsubscribe", () => {
        const seen: unknown[] = [];
        const unsubscribe = onGameSettingsChange((settings) => {
            seen.push(settings.cards);
        });

        setGameSetting("cards", "16");
        setGameSettings({ cards: "32" });

        unsubscribe();

        setGameSetting("cards", "64");

        expect(seen).toEqual(["16", "32"]);
        expect(getGameSetting("cards")).toBe("64");
    });
});
