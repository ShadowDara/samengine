import type { CSVParserOptions, ParseResult, ParseWarning } from "./types";

const DEFAULT_OPTIONS: Required<CSVParserOptions> = {
  delimiter: ",",
  quoteChar: '"',
  escapeChar: "",
  hasHeader: true,
  trimFields: false,
  skipEmptyLines: true,
  commentChar: "",
};

/**
 * RFC 4180-konformer CSV-Parser mit erweitertem Escaping.
 *
 * Unterstützt:
 *  - Gequotete Felder mit eingebetteten Zeilenumbrüchen, Trennzeichen und Anführungszeichen
 *  - Doppelt-Anführungszeichen-Escaping: "" → "
 *  - Optionales Backslash-Escaping: \" → "
 *  - Konfigurierbare Trennzeichen, Anführungszeichen, Kommentar-Zeilen
 *  - Warnung bei ungleicher Feldanzahl
 */
export class CSVParser {
  private readonly opts: Required<CSVParserOptions>;

  constructor(options: CSVParserOptions = {}) {
    this.opts = { ...DEFAULT_OPTIONS, ...options };

    if (this.opts.delimiter.length !== 1) {
      throw new Error("delimiter muss genau ein Zeichen lang sein.");
    }
    if (this.opts.quoteChar.length !== 1) {
      throw new Error("quoteChar muss genau ein Zeichen lang sein.");
    }
    if (this.opts.escapeChar && this.opts.escapeChar.length !== 1) {
      throw new Error("escapeChar muss genau ein Zeichen lang sein.");
    }
  }

  /**
   * Parst einen CSV-String und gibt strukturierte Daten zurück.
   */
  parse<T = Record<string, string>>(text: string): ParseResult<T> {
    const rawRows = this.tokenize(text);
    const warnings: ParseWarning[] = [];

    if (rawRows.length === 0) {
      return { records: [], headers: [], rawRows: [], warnings };
    }

    let headers: string[] = [];
    let dataRows: string[][];

    if (this.opts.hasHeader) {
      headers = rawRows[0].map((h) =>
        this.opts.trimFields ? h.trim() : h
      );
      dataRows = rawRows.slice(1);
    } else {
      // Numerische Header generieren: "0", "1", "2", ...
      const width = rawRows[0].length;
      headers = Array.from({ length: width }, (_, i) => String(i));
      dataRows = rawRows;
    }

    const records: T[] = [];

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];

      if (row.length !== headers.length) {
        warnings.push({
          row: i + (this.opts.hasHeader ? 2 : 1),
          message: `Zeile hat ${row.length} Felder, erwartet ${headers.length}.`,
        });
      }

      const record = {} as Record<string, string>;
      for (let j = 0; j < headers.length; j++) {
        let value = row[j] ?? "";
        if (this.opts.trimFields) value = value.trim();
        record[headers[j]] = value;
      }

      records.push(record as T);
    }

    return { records, headers, rawRows, warnings };
  }

  /**
   * Parst einen CSV-String und gibt ausschließlich die Records zurück.
   * Kurzform für einfache Anwendungsfälle.
   */
  parseRecords<T = Record<string, string>>(text: string): T[] {
    return this.parse<T>(text).records;
  }

  // ─────────────────────────────────────────────
  // Privater Tokenizer (Zustandsmaschine)
  // ─────────────────────────────────────────────

  private tokenize(text: string): string[][] {
    const { delimiter, quoteChar, escapeChar, skipEmptyLines, commentChar } =
      this.opts;

    const rows: string[][] = [];
    let row: string[] = [];
    let field = "";
    let inQuotes = false;
    let i = 0;
    const len = text.length;

    const pushRow = () => {
      const isEmpty = row.length === 1 && row[0] === "" && field === "";
      if (skipEmptyLines && isEmpty) return;
      if (commentChar && row.length === 0 && field.startsWith(commentChar)) return;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    };

    while (i < len) {
      const ch = text[i];
      const next = i + 1 < len ? text[i + 1] : "";

      if (inQuotes) {
        // Backslash-Escape innerhalb von Quotes
        if (escapeChar && ch === escapeChar && next === quoteChar) {
          field += quoteChar;
          i += 2;
          continue;
        }
        // Doppeltes Anführungszeichen → ein literales Anführungszeichen
        if (ch === quoteChar && next === quoteChar) {
          field += quoteChar;
          i += 2;
          continue;
        }
        // Schließendes Anführungszeichen
        if (ch === quoteChar) {
          inQuotes = false;
          i++;
          continue;
        }
        field += ch;
        i++;
        continue;
      }

      // Außerhalb von Quotes:

      // Kommentarzeile (nur am Zeilenanfang)
      if (commentChar && ch === commentChar && row.length === 0 && field === "") {
        // Rest der Zeile überspringen
        while (i < len && text[i] !== "\n" && text[i] !== "\r") i++;
        continue;
      }

      // Öffnendes Anführungszeichen
      if (ch === quoteChar) {
        inQuotes = true;
        i++;
        continue;
      }

      // Backslash-Escape außerhalb von Quotes (optionales Feature)
      if (escapeChar && ch === escapeChar) {
        if (next === "n") { field += "\n"; i += 2; continue; }
        if (next === "r") { field += "\r"; i += 2; continue; }
        if (next === "t") { field += "\t"; i += 2; continue; }
        if (next === "0") { field += "\0"; i += 2; continue; }
        if (next === escapeChar) { field += escapeChar; i += 2; continue; }
        if (next === delimiter) { field += delimiter; i += 2; continue; }
        // Unbekannte Escape-Sequenz: Backslash literal übernehmen
        field += ch;
        i++;
        continue;
      }

      // Trennzeichen
      if (ch === delimiter) {
        row.push(field);
        field = "";
        i++;
        continue;
      }

      // Zeilenumbruch \r\n
      if (ch === "\r" && next === "\n") {
        pushRow();
        i += 2;
        continue;
      }

      // Zeilenumbruch \r oder \n
      if (ch === "\n" || ch === "\r") {
        pushRow();
        i++;
        continue;
      }

      field += ch;
      i++;
    }

    // Letzte Zeile (kein abschließendes Newline)
    if (row.length > 0 || field !== "") {
      row.push(field);
      const isEmpty = row.length === 1 && row[0] === "";
      if (!(skipEmptyLines && isEmpty)) {
        rows.push(row);
      }
    }

    return rows;
  }
}
