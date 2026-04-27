/**
 * Regeln, welche Zeichen escaped werden sollen.
 */
export interface EscapeRules {
  /** Verdoppelt Anführungszeichen innerhalb von Feldern: " → "" */
  quote?: boolean;
  /** Felder mit Zeilenumbrüchen werden gequotet */
  newline?: boolean;
  /** Felder, die das Trennzeichen enthalten, werden gequotet */
  delimiter?: boolean;
  /** Backslashes werden escaped: \ → \\ */
  backslash?: boolean;
  /** Null-Bytes werden escaped: \0 → \\0 */
  nullByte?: boolean;
}

export interface CSVParserOptions {
  /** Trennzeichen (Standard: ",") */
  delimiter?: string;
  /** Anführungszeichen-Zeichen (Standard: '"') */
  quoteChar?: string;
  /** Escape-Zeichen für Backslash-Escaping (Standard: kein Backslash-Escape) */
  escapeChar?: string;
  /** Erste Zeile als Header interpretieren (Standard: true) */
  hasHeader?: boolean;
  /** Führende/nachfolgende Leerzeichen in Feldern trimmen (Standard: false) */
  trimFields?: boolean;
  /** Leere Zeilen überspringen (Standard: true) */
  skipEmptyLines?: boolean;
  /** Kommentare überspringen (z. B. "#") — leer = deaktiviert */
  commentChar?: string;
}

export interface CSVStringifierOptions {
  /** Trennzeichen (Standard: ",") */
  delimiter?: string;
  /** Anführungszeichen-Zeichen (Standard: '"') */
  quoteChar?: string;
  /** Zeilenende (Standard: "\r\n" per RFC 4180) */
  lineEnding?: "\r\n" | "\n" | "\r";
  /** Escape-Regeln */
  escapeRules?: EscapeRules;
  /** Alle Felder immer quoten, unabhängig vom Inhalt (Standard: false) */
  alwaysQuote?: boolean;
  /** Spaltenreihenfolge (Standard: Reihenfolge der Keys im ersten Objekt) */
  columns?: string[];
  /** Header-Zeile schreiben (Standard: true) */
  writeHeader?: boolean;
  /** Null / undefined als leeres Feld ausgeben (Standard: true) */
  nullAsEmpty?: boolean;
}

export interface ParseResult<T = Record<string, string>> {
  /** Geparste Datensätze als Array von Objekten */
  records: T[];
  /** Header-Zeile (falls hasHeader = true) */
  headers: string[];
  /** Rohe Zeilen als String-Arrays (inkl. Header) */
  rawRows: string[][];
  /** Warnungen (z. B. ungleich viele Felder) */
  warnings: ParseWarning[];
}

export interface ParseWarning {
  row: number;
  message: string;
}
