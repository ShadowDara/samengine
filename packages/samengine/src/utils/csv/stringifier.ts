import type { CSVStringifierOptions, EscapeRules } from "./types";

const DEFAULT_ESCAPE_RULES: Required<EscapeRules> = {
    quote: true,
    newline: true,
    delimiter: true,
    backslash: false,
    nullByte: false,
};

const DEFAULT_OPTIONS: Required<CSVStringifierOptions> = {
    delimiter: ",",
    quoteChar: '"',
    lineEnding: "\r\n",
    escapeRules: DEFAULT_ESCAPE_RULES,
    alwaysQuote: false,
    columns: [],
    writeHeader: true,
    nullAsEmpty: true,
};

/**
 * Serialisiert JavaScript-Objekte zu einem validen CSV-String.
 *
 * Unterstützt:
 *  - RFC 4180 Doppelquote-Escaping: " → ""
 *  - Optionales Backslash-Escaping: \ → \\
 *  - Optionales Null-Byte-Escaping: \0 → \\0
 *  - Automatisches Quoting bei Sonderzeichen
 *  - Konfigurierbare Spaltenreihenfolge
 *  - Wahlweise immer quoten (alwaysQuote)
 */
export class CSVStringifier {
    private readonly opts: Required<CSVStringifierOptions>;
    private readonly escapeRules: Required<EscapeRules>;

    constructor(options: CSVStringifierOptions = {}) {
        this.opts = {
            ...DEFAULT_OPTIONS,
            ...options,
            escapeRules: {
                ...DEFAULT_ESCAPE_RULES,
                ...(options.escapeRules ?? {}),
            },
        };
        this.escapeRules = this.opts.escapeRules as Required<EscapeRules>;

        if (this.opts.delimiter.length !== 1) {
            throw new Error("delimiter muss genau ein Zeichen lang sein.");
        }
        if (this.opts.quoteChar.length !== 1) {
            throw new Error("quoteChar muss genau ein Zeichen lang sein.");
        }
    }

    /**
     * Serialisiert ein Array von Objekten zu einem CSV-String.
     */
    stringify(records: Record<string, unknown>[]): string {
        if (records.length === 0) return "";

        const columns =
            this.opts.columns.length > 0
                ? this.opts.columns
                : Object.keys(records[0]);

        const lines: string[] = [];

        if (this.opts.writeHeader) {
            lines.push(columns.map((h) => this.escapeField(h)).join(this.opts.delimiter));
        }

        for (const record of records) {
            const row = columns.map((col) => {
                const value = record[col];
                if ((value === null || value === undefined) && this.opts.nullAsEmpty) {
                    return "";
                }
                return this.escapeField(String(value ?? ""));
            });
            lines.push(row.join(this.opts.delimiter));
        }

        return lines.join(this.opts.lineEnding);
    }

    /**
     * Serialisiert ein einzelnes Feld mit korrektem Escaping.
     * Öffentlich, damit einzelne Werte unabhängig escaped werden können.
     */
    escapeField(raw: string): string {
        const { delimiter, quoteChar, alwaysQuote } = this.opts;
        const rules = this.escapeRules;
        let value = raw;
        let needsQuoting = alwaysQuote;

        // 1. Backslash escapen (muss vor allen anderen stehen)
        if (rules.backslash && value.includes("\\")) {
            value = value.replace(/\\/g, "\\\\");
            needsQuoting = true;
        }

        // 2. Null-Byte escapen
        if (rules.nullByte && value.includes("\0")) {
            value = value.replace(/\0/g, "\\0");
            needsQuoting = true;
        }

        // 3. Anführungszeichen escapen (RFC 4180: "" Verdopplung)
        if (rules.quote && value.includes(quoteChar)) {
            // Needs ES2021
            // value = value.replaceAll(quoteChar, quoteChar + quoteChar);
            
            value = value.split(quoteChar).join(quoteChar + quoteChar)
            needsQuoting = true;
        }

        // 4. Zeilenumbrüche → brauchen Quoting
        if (rules.newline && (value.includes("\n") || value.includes("\r"))) {
            needsQuoting = true;
        }

        // 5. Trennzeichen im Wert → braucht Quoting
        if (rules.delimiter && value.includes(delimiter)) {
            needsQuoting = true;
        }

        if (needsQuoting) {
            return `${quoteChar}${value}${quoteChar}`;
        }

        return value;
    }

    /**
     * Streamt Records zeilenweise als Generator (speicherschonend für große Dateien).
     */
    *stream(records: Iterable<Record<string, unknown>>, columns: string[]): Generator<string> {
        const { delimiter, lineEnding, writeHeader } = this.opts;

        if (writeHeader) {
            yield columns.map((h) => this.escapeField(h)).join(delimiter) + lineEnding;
        }

        for (const record of records) {
            const row = columns.map((col) => {
                const value = record[col];
                if ((value === null || value === undefined) && this.opts.nullAsEmpty) {
                    return "";
                }
                return this.escapeField(String(value ?? ""));
            });
            yield row.join(delimiter) + lineEnding;
        }
    }
}
