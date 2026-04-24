import { CSVParser } from "./parser.ts";
import { CSVStringifier } from "./stringifier.ts";

// ─── Hilfsfunktion ───────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`  ✓  ${name}`);
    passed++;
  } catch (e) {
    console.error(`  ✗  ${name}`);
    console.error(`     ${(e as Error).message}`);
    failed++;
  }
}

function expect<T>(actual: T) {
  return {
    toBe(expected: T) {
      if (actual !== expected) {
        throw new Error(`Erwartet: ${JSON.stringify(expected)}\n     Erhalten: ${JSON.stringify(actual)}`);
      }
    },
    toEqual(expected: T) {
      const a = JSON.stringify(actual);
      const b = JSON.stringify(expected);
      if (a !== b) {
        throw new Error(`Erwartet: ${b}\n     Erhalten: ${a}`);
      }
    },
    toContain(expected: string) {
      if (typeof actual !== "string" || !actual.includes(expected)) {
        throw new Error(`"${actual}" enthält nicht "${expected}"`);
      }
    },
    toHaveLength(n: number) {
      const len = (actual as unknown as unknown[]).length;
      if (len !== n) throw new Error(`Länge: erwartet ${n}, erhalten ${len}`);
    },
  };
}

// ─── Parser Tests ─────────────────────────────────────────────────────────────

console.log("\nCSVParser");

test("Einfaches CSV parsen", () => {
  const parser = new CSVParser();
  const { records, headers } = parser.parse("Name,Alter\nAlice,30\nBob,25");
  expect(headers).toEqual(["Name", "Alter"]);
  expect(records).toEqual([{ Name: "Alice", Alter: "30" }, { Name: "Bob", Alter: "25" }]);
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

test("Doppeltes Anführungszeichen: \"\" → \"", () => {
  const parser = new CSVParser();
  const { records } = parser.parse(`Name,Zitat\nBob,"Er sagte ""Hallo"""`);
  expect(records[0]["Zitat"]).toBe(`Er sagte "Hallo"`);
});

test("Gequotetes Feld mit Zeilenumbruch", () => {
  const parser = new CSVParser();
  const { records } = parser.parse(`Name,Adresse\nAlice,"Musterstr. 1\nBerlin"`);
  expect(records[0]["Adresse"]).toBe("Musterstr. 1\nBerlin");
});

test("CRLF Zeilenenden", () => {
  const parser = new CSVParser();
  const { records } = parser.parse("Name,Wert\r\nAlice,42\r\nBob,99");
  expect(records).toHaveLength(2);
  expect(records[1]["Wert"]).toBe("99");
});

test("Leere Felder", () => {
  const parser = new CSVParser();
  const { records } = parser.parse("A,B,C\n1,,3");
  expect(records[0]["B"]).toBe("");
});

test("trimFields entfernt Leerzeichen", () => {
  const parser = new CSVParser({ trimFields: true });
  const { records } = parser.parse("Name , Wert\n Alice , 42 ");
  expect(records[0]["Name"]).toBe("Alice");
  expect(records[0]["Wert"]).toBe("42");
});

test("hasHeader=false erzeugt numerische Keys", () => {
  const parser = new CSVParser({ hasHeader: false });
  const { records } = parser.parse("Alice,30\nBob,25");
  expect(records[0]["0"]).toBe("Alice");
  expect(records[0]["1"]).toBe("30");
});

test("Kommentarzeilen werden übersprungen", () => {
  const parser = new CSVParser({ commentChar: "#" });
  const { records } = parser.parse("Name,Wert\n# Dies ist ein Kommentar\nAlice,42");
  expect(records).toHaveLength(1);
  expect(records[0]["Name"]).toBe("Alice");
});

test("Warnung bei ungleicher Feldanzahl", () => {
  const parser = new CSVParser();
  const { warnings } = parser.parse("A,B,C\n1,2");
  expect(warnings).toHaveLength(1);
  expect(warnings[0].message).toContain("Zeile hat 2 Felder");
});

test("Backslash-Escape: \\\" → \"", () => {
  const parser = new CSVParser({ escapeChar: "\\" });
  const { records } = parser.parse(`Name,Wert\nAlice,\"hello\"`);
  expect(records[0]["Wert"]).toBe("hello");
});

test("Leeres CSV gibt leeres Ergebnis", () => {
  const parser = new CSVParser();
  const { records } = parser.parse("");
  expect(records).toHaveLength(0);
});

// ─── Stringifier Tests ────────────────────────────────────────────────────────

console.log("\nCSVStringifier");

test("Einfaches Objekt serialisieren", () => {
  const s = new CSVStringifier();
  const csv = s.stringify([{ Name: "Alice", Alter: "30" }]);
  expect(csv).toBe("Name,Alter\r\nAlice,30");
});

test("Anführungszeichen werden escaped: \" → \"\"", () => {
  const s = new CSVStringifier();
  const csv = s.stringify([{ Zitat: `Er sagte "Hallo"` }]);
  expect(csv).toContain(`"Er sagte ""Hallo"""`);
});

test("Komma im Feld wird gequotet", () => {
  const s = new CSVStringifier();
  const csv = s.stringify([{ Liste: "Äpfel, Birnen" }]);
  expect(csv).toContain(`"Äpfel, Birnen"`);
});

test("Zeilenumbruch im Feld wird gequotet", () => {
  const s = new CSVStringifier();
  const csv = s.stringify([{ Adresse: "Zeile1\nZeile2" }]);
  expect(csv).toContain(`"Zeile1\nZeile2"`);
});

test("alwaysQuote quotet alle Felder", () => {
  const s = new CSVStringifier({ alwaysQuote: true });
  const csv = s.stringify([{ Name: "Alice" }]);
  expect(csv).toContain(`"Name"`);
  expect(csv).toContain(`"Alice"`);
});

test("Backslash-Escaping: \\ → \\\\", () => {
  const s = new CSVStringifier({ escapeRules: { backslash: true } });
  const result = s.escapeField("C:\\Users\\Alice");
  expect(result).toBe(`"C:\\\\Users\\\\Alice"`);
});

test("Null-Byte-Escaping", () => {
  const s = new CSVStringifier({ escapeRules: { nullByte: true } });
  const result = s.escapeField("vor\0nach");
  expect(result).toBe(`"vor\\0nach"`);
});

test("Null-Werte werden als leere Felder ausgegeben", () => {
  const s = new CSVStringifier({ nullAsEmpty: true });
  const csv = s.stringify([{ A: null as unknown as string, B: "ok" }]);
  expect(csv).toContain(",ok");
});

test("columns bestimmt Spaltenreihenfolge", () => {
  const s = new CSVStringifier({ columns: ["B", "A"] });
  const csv = s.stringify([{ A: "1", B: "2" }]);
  expect(csv).toBe("B,A\r\nB,A\r\n2,1".split("\r\n")[1]);
  // Ersten Header-Teil prüfen
  const rows = csv.split("\r\n");
  expect(rows[0]).toBe("B,A");
  expect(rows[1]).toBe("2,1");
});

test("writeHeader=false unterdrückt Header", () => {
  const s = new CSVStringifier({ writeHeader: false });
  const csv = s.stringify([{ Name: "Alice" }]);
  expect(csv).toBe("Alice");
});

test("lineEnding=\\n gibt Unix-Zeilenenden aus", () => {
  const s = new CSVStringifier({ lineEnding: "\n" });
  const csv = s.stringify([{ A: "1" }, { A: "2" }]);
  expect(csv).toBe("A\n1\n2");
});

test("stream() gibt Zeilen als Generator aus", () => {
  const s = new CSVStringifier({ writeHeader: true, lineEnding: "\n" });
  const gen = s.stream([{ Name: "Alice" }, { Name: "Bob" }], ["Name"]);
  const lines = [...gen];
  expect(lines).toHaveLength(3);
  expect(lines[0]).toBe("Name\n");
  expect(lines[1]).toBe("Alice\n");
});

// ─── Round-Trip Tests ─────────────────────────────────────────────────────────

console.log("\nRound-Trip (stringify → parse)");

test("Einfache Daten", () => {
  const data = [{ Name: "Alice", Stadt: "Berlin" }, { Name: "Bob", Stadt: "München" }];
  const s = new CSVStringifier();
  const p = new CSVParser();
  const { records } = p.parse(s.stringify(data));
  expect(records).toEqual(data);
});

test("Felder mit Komma, Anführungszeichen und Zeilenumbruch", () => {
  const data = [
    { Info: `Zeile1\nZeile2`, Zitat: `Sagt: "Hallo"`, Liste: "a, b, c" },
  ];
  const s = new CSVStringifier();
  const p = new CSVParser();
  const { records } = p.parse(s.stringify(data));
  expect(records).toEqual(data);
});

test("Leere Felder überleben den Round-Trip", () => {
  const data = [{ A: "", B: "x", C: "" }];
  const s = new CSVStringifier();
  const p = new CSVParser();
  const { records } = p.parse(s.stringify(data));
  expect(records).toEqual(data);
});

// ─── Ergebnis ─────────────────────────────────────────────────────────────────

console.log(`\n${passed + failed} Tests: ${passed} bestanden, ${failed} fehlgeschlagen.\n`);
if (failed > 0) process.exit(1);
