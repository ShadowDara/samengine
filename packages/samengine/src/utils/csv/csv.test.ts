import { describe, test, expect } from "bun:test";
import { CSVParser } from "./parser.ts";
import { CSVStringifier } from "./stringifier.ts";

describe("CSVParser", () => {
  test("Einfaches CSV parsen", () => {
    const parser = new CSVParser();
    const { records, headers } = parser.parse("Name,Alter\nAlice,30\nBob,25");

    expect(headers).toEqual(["Name", "Alter"]);
    expect(records).toEqual([
      { Name: "Alice", Alter: "30" },
      { Name: "Bob", Alter: "25" },
    ]);
  });

  test("Semikolon als Trennzeichen", () => {
    const parser = new CSVParser({ delimiter: ";" });
    const { records } = parser.parse("Name;Stadt\nAlice;Berlin");

    expect(records[0]).toEqual({ Name: "Alice", Stadt: "Berlin" });
  });

  test("Gequotetes Feld mit Komma", () => {
    const parser = new CSVParser();
    const { records } = parser.parse(`Name,Beschreibung\nAlice,"Liebt Kaffee, Tee"`);

    expect(records[0]["Beschreibung"]).toBe("Liebt Kaffee, Tee");
  });
});

describe("CSVStringifier", () => {
  test("Einfaches Objekt serialisieren", () => {
    const s = new CSVStringifier();
    const csv = s.stringify([{ Name: "Alice", Alter: "30" }]);

    expect(csv).toBe("Name,Alter\r\nAlice,30");
  });

  test("Anführungszeichen werden escaped", () => {
    const s = new CSVStringifier();
    const csv = s.stringify([{ Zitat: `Er sagte "Hallo"` }]);

    expect(csv).toContain(`"Er sagte ""Hallo"""`);
  });

  test("Komma im Feld wird gequotet", () => {
    const s = new CSVStringifier();
    const csv = s.stringify([{ Liste: "Äpfel, Birnen" }]);

    expect(csv).toContain(`"Äpfel, Birnen"`);
  });
});


describe("Round-Trip", () => {
  test("Einfache Daten", () => {
    const data = [
      { Name: "Alice", Stadt: "Berlin" },
      { Name: "Bob", Stadt: "München" },
    ];

    const s = new CSVStringifier();
    const p = new CSVParser();

    const { records } = p.parse(s.stringify(data));

    expect(records).toEqual(data);
  });

  test("Felder mit Sonderzeichen", () => {
    const data = [
      { Info: "Zeile1\nZeile2", Zitat: `Sagt: "Hallo"`, Liste: "a, b, c" },
    ];

    const s = new CSVStringifier();
    const p = new CSVParser();

    const { records } = p.parse(s.stringify(data));

    expect(records).toEqual(data);
  });
});
