// a Markdown Parser

/**
 * markdown-parser.ts
 * Ein vollständiger Markdown → HTML Parser in TypeScript.
 * Unterstützt: Überschriften, Absätze, Fett/Kursiv/Durchgestrichen,
 * Inline-Code, Code-Blöcke (mit Sprach-Tag), Blockquotes (verschachtelt),
 * geordnete & ungeordnete Listen (verschachtelt), Aufgabenlisten,
 * horizontale Linien, Links, Bilder, Tabellen, Fußnoten, HTML-Entities.
 */

// ---------------------------------------------------------------------------
// Typen
// ---------------------------------------------------------------------------

export interface ParseOptions {
    /** Fügt target="_blank" rel="noopener noreferrer" zu externen Links hinzu */
    externalLinks?: boolean;
    /** Bricht einfache Zeilenumbrüche in <br> um */
    breaks?: boolean;
    /** Gibt typographische Anführungszeichen zurück (Smartquotes) */
    smartypants?: boolean;
    /** Sanitisiert rohes HTML im Quelltext */
    sanitize?: boolean;
}

interface Token {
    type: string;
    raw: string;
    [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Hilfsfunktionen
// ---------------------------------------------------------------------------

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function unescapeHtml(text: string): string {
    return text
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
}

function smartypants(text: string): string {
    return text
        .replace(/---/g, "\u2014")      // Em-Dash
        .replace(/--/g, "\u2013")       // En-Dash
        .replace(/\.{3}/g, "\u2026")    // Ellipsis
        .replace(/"([^"]+)"/g, "\u201C$1\u201D")
        .replace(/'([^']+)'/g, "\u2018$1\u2019");
}

function isExternalUrl(url: string): boolean {
    return /^https?:\/\//i.test(url);
}

// ---------------------------------------------------------------------------
// Inline-Renderer
// ---------------------------------------------------------------------------

function renderInline(text: string, opts: ParseOptions): string {

    // ---------------------------------------------------------------------
    // Escaped Zeichen sichern (wichtig für Markdown-Sonderzeichen)
    // ---------------------------------------------------------------------
    const ESCAPES: Record<string, string> = {
        "\\\\": "@@ESC-BACKSLASH@@",
        "\\[": "@@ESC-LBRACKET@@",
        "\\]": "@@ESC-RBRACKET@@",
        "\\(": "@@ESC-LPAREN@@",
        "\\)": "@@ESC-RPAREN@@",
        "\\|": "@@ESC-PIPE@@",
        '\\"': "@@ESC-QUOTE@@",
        "\\*": "@@ESC-STAR@@",
        "\\_": "@@ESC-UNDERSCORE@@",
        "\\`": "@@ESC-BACKTICK@@",
        "\\~": "@@ESC-TILDE@@"
    };

    for (const [char, placeholder] of Object.entries(ESCAPES)) {
        const regex = new RegExp(char.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"), "g");
        text = text.replace(regex, placeholder);
    }

    // Roh-HTML bewahren (falls !sanitize)
    const htmlPlaceholders: string[] = [];
    if (!opts.sanitize) {
        text = text.replace(/<[^>]+>/g, (match) => {
            const idx = htmlPlaceholders.push(match) - 1;
            return `@@HTML${idx}@@`;
        });
    }

    // Links  [text](url "title")
    text = text.replace(
        /\[([^\]]+)\]\(([^)]+?)(?:\s+"([^"]*)")?\)/g,
        (_, linkText, url, title) => {
            const t = title ? ` title="${escapeHtml(title)}"` : "";
            const ext =
                opts.externalLinks && isExternalUrl(url)
                    ? ' target="_blank" rel="noopener noreferrer"'
                    : "";
            return `<a href="${url}"${t}${ext}>${linkText}</a>`;
        }
    );
    // Code-Spans (höchste Priorität, vor allem anderen)
    text = text.replace(/`{2}([^`]+)`{2}|`([^`\n]+)`/g, (_, a, b) => {
        return `<code>${escapeHtml(a ?? b)}</code>`;
    });

    // Bilder  ![alt](url "title")
    text = text.replace(
        /!\[([^\]]*)\]\(([^)]+?)(?:\s+"([^"]*)")?\)/g,
        (_, alt, url, title) => {
            const t = title ? ` title="${escapeHtml(title)}"` : "";
            return `<img src="${url}" alt="${escapeHtml(alt)}"${t}>`;
        }
    );

    // Autolinks  <https://…>
    text = text.replace(/<(https?:\/\/[^\s>]+)>/g, (_, url) => {
        const ext = opts.externalLinks
            ? ' target="_blank" rel="noopener noreferrer"'
            : "";
        return `<a href="${url}"${ext}>${url}</a>`;
    });

    // E-Mail-Autolinks  <email@example.com>
    text = text.replace(/<([^@\s>]+@[^@\s>]+\.[^@\s>]+)>/g, (_, email) => {
        return `<a href="mailto:${email}">${email}</a>`;
    });

    // Fett + Kursiv  ***text***  ___text___
    text = text.replace(/(\*{3}|_{3})(.+?)\1/g, "<strong><em>$2</em></strong>");

    // Fett  **text**  __text__
    text = text.replace(/(\*{2}|_{2})(.+?)\1/g, "<strong>$2</strong>");

    // Kursiv  *text*  _text_
    text = text.replace(/(\*|_)(.+?)\1/g, "<em>$2</em>");

    // Durchgestrichen  ~~text~~
    text = text.replace(/~~(.+?)~~/g, "<del>$1</del>");

    // Hochgestellt  ^text^
    text = text.replace(/\^([^^]+)\^/g, "<sup>$1</sup>");

    // Tiefgestellt  ~text~  (nur wenn nicht ~~)
    text = text.replace(/(?<!~)~(?!~)([^~]+)~(?!~)/g, "<sub>$1</sub>");

    // Markiert  ==text==
    text = text.replace(/==(.+?)==/g, "<mark>$1</mark>");

    // Zeilenumbrüche: zwei Leerzeichen + \n → <br>
    text = text.replace(/ {2,}\n/g, "<br>\n");

    // Harte Zeilenumbrüche (wenn breaks: true)
    if (opts.breaks) {
        text = text.replace(/\n/g, "<br>\n");
    }

    // Smartypants
    if (opts.smartypants) {
        text = smartypants(text);
    }

    // HTML-Platzhalter wiederherstellen
    if (!opts.sanitize) {
        text = text.replace(/@@HTML(\d+)@@/g, (_, i) => htmlPlaceholders[+i]);
    }

    text = text.replace(/@@ESC-BACKSLASH@@/g, "\\");
    text = text.replace(/@@ESC-LPAREN@@/g, "(");
    text = text.replace(/@@ESC-RPAREN@@/g, ")");
    text = text.replace(/@@ESC-PIPE@@/g, "|");
    text = text.replace(/@@ESC-QUOTE@@/g, '"');
    text = text.replace(/@@ESC-STAR@@/g, "*");
    text = text.replace(/@@ESC-UNDERSCORE@@/g, "_");
    text = text.replace(/@@ESC-BACKTICK@@/g, "`");
    text = text.replace(/@@ESC-TILDE@@/g, "~");

    text = text.replace(/@@ESC-RBRACKET@@/g, "]");
    text = text.replace(/@@ESC-LBRACKET@@/g, "[");

    return text;
}

// ---------------------------------------------------------------------------
// Block-Parser
// ---------------------------------------------------------------------------

interface ListItem {
    text: string;
    task: boolean;
    checked: boolean;
    children: ListItem[];
}

function parseListItems(lines: string[], baseIndent: number): ListItem[] {
    const items: ListItem[] = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];
        const indentMatch = line.match(/^(\s*)/);
        const indent = indentMatch ? indentMatch[1].length : 0;

        if (indent < baseIndent) break;
        if (indent > baseIndent) { i++; continue; }

        const bulletMatch = line.match(/^\s*(?:[-*+]|\d+\.)\s+(.*)/);
        if (!bulletMatch) { i++; continue; }

        let itemText = bulletMatch[1];
        let task = false;
        let checked = false;

        // Aufgabenliste
        const taskMatch = itemText.match(/^\[([ xX])\]\s+(.*)/);
        if (taskMatch) {
            task = true;
            checked = taskMatch[1].toLowerCase() === "x";
            itemText = taskMatch[2];
        }

        // Untergeordnete Zeilen sammeln
        const childLines: string[] = [];
        i++;
        while (i < lines.length) {
            const nextIndent = (lines[i].match(/^(\s*)/) ?? ["", ""])[1].length;
            if (nextIndent <= baseIndent && lines[i].match(/^\s*(?:[-*+]|\d+\.)\s/)) break;
            childLines.push(lines[i]);
            i++;
        }

        const children =
            childLines.length > 0
                ? parseListItems(childLines, baseIndent + 2)
                : [];

        items.push({ text: itemText, task, checked, children });
    }

    return items;
}

function renderListItems(
    items: ListItem[],
    ordered: boolean,
    opts: ParseOptions
): string {
    return items
        .map((item) => {
            const checkbox =
                item.task
                    ? `<input type="checkbox"${item.checked ? " checked" : ""} disabled> `
                    : "";

            const childList =
                item.children.length > 0
                    ? renderList(item.children, ordered, opts)
                    : "";

            return `<li>${checkbox}${renderInline(item.text, opts)}${childList}</li>`;
        })
        .join("\n");
}

function renderList(
    items: ListItem[],
    ordered: boolean,
    opts: ParseOptions
): string {
    const tag = ordered ? "ol" : "ul";
    return `<${tag}>\n${renderListItems(items, ordered, opts)}\n</${tag}>`;
}

// ---------------------------------------------------------------------------
// Tabellen
// ---------------------------------------------------------------------------

function parseTable(block: string, opts: ParseOptions): string {
    const rows = block.trim().split("\n");
    if (rows.length < 2) return `<p>${renderInline(block, opts)}</p>`;

    const headerCells = rows[0]
        .split(/(?<!\\)\|/)
        .filter((_, i, a) => !(i === 0 && _ === "") && !(i === a.length - 1 && _ === ""))
        .map((c) =>
            c
                .trim()
            // .replace(/\\\|/g, "|")
            // .replace(/\\\[/g, "[")
            // .replace(/\\\]/g, "]")
        );

    const alignRow = rows[1].split(/(?<!\\)\|/).filter((c) => /[-:]/.test(c));
    const aligns = alignRow.map((c) => {
        c = c.trim();
        if (c.startsWith(":") && c.endsWith(":")) return "center";
        if (c.endsWith(":")) return "right";
        if (c.startsWith(":")) return "left";
        return "";
    });

    const thead = `<thead>\n<tr>\n${headerCells
        .map((c, i) => {
            const align = aligns[i] ? ` style="text-align:${aligns[i]}"` : "";
            return `<th${align}>${renderInline(c, opts)}</th>`;
        })
        .join("\n")}\n</tr>\n</thead>`;

    const bodyRows = rows.slice(2).map((row) => {
        const cells = row
            .split(/(?<!\\)\|/)
            .filter((_, i, a) => !(i === 0 && _ === "") && !(i === a.length - 1 && _ === ""))
            .map((c) =>
                c
                    .trim()
                // .replace(/\\\|/g, "|")
                // .replace(/\\\[/g, "[")
                // .replace(/\\\]/g, "]")
            );
        return `<tr>\n${cells
            .map((c, i) => {
                const align = aligns[i] ? ` style="text-align:${aligns[i]}"` : "";
                return `<td${align}>${renderInline(c, opts)}</td>`;
            })
            .join("\n")}\n</tr>`;
    });

    const tbody = `<tbody>\n${bodyRows.join("\n")}\n</tbody>`;
    return `<table>\n${thead}\n${tbody}\n</table>`;
}

// ---------------------------------------------------------------------------
// Blockquotes (verschachtelt)
// ---------------------------------------------------------------------------

function parseBlockquote(content: string, opts: ParseOptions): string {
    // Entferne führendes >
    const inner = content
        .split("\n")
        .map((l) => l.replace(/^>\s?/, ""))
        .join("\n");
    return `<blockquote>\n${parseBlocks(inner, opts)}\n</blockquote>`;
}

// ---------------------------------------------------------------------------
// Code-Blöcke
// ---------------------------------------------------------------------------

function renderCodeBlock(lang: string, code: string): string {
    const langAttr = lang ? ` class="language-${escapeHtml(lang)}"` : "";
    return `<pre><code${langAttr}>${escapeHtml(code)}</code></pre>`;
}

// ---------------------------------------------------------------------------
// Fußnoten
// ---------------------------------------------------------------------------

interface FootnoteMap {
    [key: string]: string;
}

function collectFootnotes(text: string): { text: string; notes: FootnoteMap } {
    const notes: FootnoteMap = {};
    const cleaned = text.replace(
        /^\[(\^[^\]]+)\]:\s+(.+)$/gm,
        (_, key, val) => {
            notes[key] = val;
            return "";
        }
    );
    return { text: cleaned, notes };
}

function renderFootnoteRefs(
    text: string,
    notes: FootnoteMap,
    opts: ParseOptions
): string {
    return text.replace(/\[(\^[^\]]+)\]/g, (_, key) => {
        if (!notes[key]) return _;
        const id = key.slice(1);
        return `<sup><a href="#fn-${id}" id="fnref-${id}">${id}</a></sup>`;
    });
}

function renderFootnoteList(notes: FootnoteMap, opts: ParseOptions): string {
    const entries = Object.entries(notes);
    if (entries.length === 0) return "";
    const items = entries
        .map(([key, val]) => {
            const id = key.slice(1);
            return `<li id="fn-${id}">${renderInline(val, opts)} <a href="#fnref-${id}">↩</a></li>`;
        })
        .join("\n");
    return `<hr>\n<ol class="footnotes">\n${items}\n</ol>`;
}

// ---------------------------------------------------------------------------
// Block-Parser (Kern)
// ---------------------------------------------------------------------------

function parseBlocks(markdown: string, opts: ParseOptions): string {
    const output: string[] = [];
    let remaining = markdown;

    while (remaining.length > 0) {
        let matched = false;

        // -----------------------------------------------------------------------
        // Leerzeilen überspringen
        if (/^\n+/.test(remaining)) {
            remaining = remaining.replace(/^\n+/, "");
            continue;
        }

        // -----------------------------------------------------------------------
        // Code-Block-Platzhalter (bereits in parse() extrahiert)
        {
            const m = remaining.match(/^@@CODEBLOCK\d+@@/);
            if (m) {
                output.push(m[0]); // wird später in parse() ersetzt
                remaining = remaining.slice(m[0].length);
                matched = true;
            }
        }
        if (matched) continue;

        // -----------------------------------------------------------------------
        // Fenced Code Block  ```lang\n...\n```  (Fallback)
        {
            const m = remaining.match(/^(`{3,}|~{3,})([^\n]*)\n([\s\S]*?)\n?\1[ \t]*(?:\n|$)/);
            if (m) {
                const lang = m[2].trim();
                const code = m[3];
                output.push(renderCodeBlock(lang, code));
                remaining = remaining.slice(m[0].length);
                matched = true;
            }
        }
        if (matched) continue;

        // -----------------------------------------------------------------------
        // Eingerückter Code Block (4 Leerzeichen oder 1 Tab)
        {
            const lines: string[] = [];
            let rest = remaining;
            let anyCode = false;
            while (true) {
                const m = rest.match(/^(?: {4}|\t)(.*)(?:\n|$)/);
                if (!m) break;
                lines.push(m[1]);
                rest = rest.slice(m[0].length);
                anyCode = true;
            }
            if (anyCode) {
                output.push(renderCodeBlock("", lines.join("\n")));
                remaining = rest;
                matched = true;
            }
        }
        if (matched) continue;

        // -----------------------------------------------------------------------
        // Blockquote
        {
            const lines: string[] = [];
            let rest = remaining;
            while (true) {
                const m = rest.match(/^>(.*)(?:\n|$)/);
                if (!m) break;
                lines.push(">" + m[1]);
                rest = rest.slice(m[0].length);
            }
            if (lines.length > 0) {
                output.push(parseBlockquote(lines.join("\n"), opts));
                remaining = rest;
                matched = true;
            }
        }
        if (matched) continue;

        // -----------------------------------------------------------------------
        // Überschriften  # bis ######
        {
            const m = remaining.match(/^(#{1,6})\s+(.+?)(?:\s+#+)?\s*(?:\n|$)/);
            if (m) {
                const level = m[1].length;
                const text = m[2].trim();
                const id = text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
                output.push(`<h${level} id="${id}">${renderInline(text, opts)}</h${level}>`);
                remaining = remaining.slice(m[0].length);
                matched = true;
            }
        }
        if (matched) continue;

        // -----------------------------------------------------------------------
        // Setext-Überschriften
        {
            const m = remaining.match(/^(.+)\n(=+|-+)\s*(?:\n|$)/);
            if (m) {
                const level = m[2][0] === "=" ? 1 : 2;
                const text = m[1].trim();
                const id = text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
                output.push(`<h${level} id="${id}">${renderInline(text, opts)}</h${level}>`);
                remaining = remaining.slice(m[0].length);
                matched = true;
            }
        }
        if (matched) continue;

        // -----------------------------------------------------------------------
        // Horizontale Linie  --- / *** / ___
        {
            const m = remaining.match(/^(?:[-*_] *){3,}\s*(?:\n|$)/);
            if (m) {
                output.push("<hr>");
                remaining = remaining.slice(m[0].length);
                matched = true;
            }
        }
        if (matched) continue;

        // -----------------------------------------------------------------------
        // Tabelle  (enthält | in der ersten Zeile und --- in der zweiten)
        {
            const m = remaining.match(/^(\|?.+\|.+\n\|?[-| :]+\|[-| :]+\n(?:\|?.+\|.+\n?)*)/);
            if (m) {
                output.push(parseTable(m[1], opts));
                remaining = remaining.slice(m[0].length);
                matched = true;
            }
        }
        if (matched) continue;

        // -----------------------------------------------------------------------
        // Ungeordnete Liste
        {
            const lines: string[] = [];
            let rest = remaining;
            while (true) {
                const m = rest.match(/^( *[-*+] .*)(?:\n|$)/);
                if (!m) {
                    // Eingerückte Fortsetzungszeilen
                    const cont = rest.match(/^( {2,}.+)(?:\n|$)/);
                    if (cont && lines.length > 0) {
                        lines.push(cont[1]);
                        rest = rest.slice(cont[0].length);
                        continue;
                    }
                    break;
                }
                lines.push(m[1]);
                rest = rest.slice(m[0].length);
            }
            if (lines.length > 0) {
                const items = parseListItems(lines, 0);
                output.push(renderList(items, false, opts));
                remaining = rest;
                matched = true;
            }
        }
        if (matched) continue;

        // -----------------------------------------------------------------------
        // Geordnete Liste
        {
            const lines: string[] = [];
            let rest = remaining;
            let startNum = 1;
            while (true) {
                const m = rest.match(/^( *\d+\. .*)(?:\n|$)/);
                if (!m) {
                    const cont = rest.match(/^( {3,}.+)(?:\n|$)/);
                    if (cont && lines.length > 0) {
                        lines.push(cont[1]);
                        rest = rest.slice(cont[0].length);
                        continue;
                    }
                    break;
                }
                if (lines.length === 0) {
                    const sn = m[1].match(/^(\d+)\./);
                    if (sn) startNum = parseInt(sn[1], 10);
                }
                lines.push(m[1]);
                rest = rest.slice(m[0].length);
            }
            if (lines.length > 0) {
                const items = parseListItems(lines, 0);
                const tag = `ol${startNum !== 1 ? ` start="${startNum}"` : ""}`;
                output.push(
                    `<${tag}>\n${renderListItems(items, true, opts)}\n</ol>`
                );
                remaining = rest;
                matched = true;
            }
        }
        if (matched) continue;

        // -----------------------------------------------------------------------
        // Rohes HTML-Block (falls !sanitize)
        if (!opts.sanitize) {
            const m = remaining.match(/^(<(?:div|section|article|aside|header|footer|nav|main|p|blockquote|pre|table|ul|ol|dl|form|figure|details|summary)[^>]*>[\s\S]*?<\/\w+>)\s*(?:\n|$)/i);
            if (m) {
                output.push(m[1]);
                remaining = remaining.slice(m[0].length);
                matched = true;
            }
        }
        if (matched) continue;

        // -----------------------------------------------------------------------
        // Absatz  (alles bis zur nächsten Leerzeile)
        {
            const m = remaining.match(/^([\s\S]+?)(?:\n\n|$)/);
            if (m) {
                const text = m[1].trim();
                if (text) {
                    output.push(`<p>${renderInline(text, opts)}</p>`);
                }
                remaining = remaining.slice(m[0].length);
                matched = true;
            }
        }
        if (matched) continue;

        // Fallback: Zeichen konsumieren
        remaining = remaining.slice(1);
    }

    return output.join("\n");
}

// ---------------------------------------------------------------------------
// Standard-CSS
// ---------------------------------------------------------------------------

const defaultCss = `
:root {
  --md-font: system-ui, sans-serif;
  --md-mono: "Fira Code", "Cascadia Code", Consolas, monospace;
  --md-max-width: 800px;
  --md-line-height: 1.7;
  --md-color: #1a1a2e;
  --md-bg: #ffffff;
  --md-code-bg: #f4f4f8;
  --md-border: #d1d5db;
  --md-accent: #3b5bdb;
  --md-blockquote: #6b7280;
}
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; background: var(--md-bg); color: var(--md-color); }
.md-body {
  font-family: var(--md-font);
  line-height: var(--md-line-height);
  max-width: var(--md-max-width);
  margin: 2rem auto;
  padding: 0 1.5rem;
}
h1,h2,h3,h4,h5,h6 {
  margin: 1.6em 0 0.4em;
  line-height: 1.25;
  font-weight: 700;
}
h1 { font-size: 2rem; border-bottom: 2px solid var(--md-border); padding-bottom: 0.3em; }
h2 { font-size: 1.5rem; border-bottom: 1px solid var(--md-border); padding-bottom: 0.2em; }
p { margin: 0.8em 0; }
a { color: var(--md-accent); }
code {
  font-family: var(--md-mono);
  font-size: 0.875em;
  background: var(--md-code-bg);
  padding: 0.15em 0.35em;
  border-radius: 4px;
}
pre { background: var(--md-code-bg); border-radius: 6px; padding: 1em; overflow-x: auto; }
pre code { background: none; padding: 0; font-size: 0.9em; }
blockquote {
  margin: 1em 0;
  padding: 0.5em 1em;
  border-left: 4px solid var(--md-accent);
  color: var(--md-blockquote);
}
table { border-collapse: collapse; width: 100%; margin: 1em 0; }
th, td { border: 1px solid var(--md-border); padding: 0.5em 0.8em; }
th { background: var(--md-code-bg); font-weight: 600; }
tr:nth-child(even) td { background: #fafafa; }
ul, ol { padding-left: 1.5em; margin: 0.8em 0; }
li { margin: 0.25em 0; }
hr { border: none; border-top: 2px solid var(--md-border); margin: 2em 0; }
img { max-width: 100%; height: auto; border-radius: 4px; }
mark { background: #fef08a; padding: 0.1em 0.2em; border-radius: 2px; }
input[type="checkbox"] { margin-right: 0.4em; }
.footnotes { font-size: 0.875em; color: var(--md-blockquote); }
`;

// ---------------------------------------------------------------------------
// Öffentliche API
// ---------------------------------------------------------------------------

/**
 * Konvertiert Markdown-Text in HTML.
 *
 * @param markdown  Eingabe-Markdown
 * @param options   Optionale Parser-Einstellungen
 * @returns         Gerendertes HTML
 *
 * @example
 * ```ts
 * import { parse } from "./markdown-parser";
 * const html = parse("# Hallo Welt\n\nDas ist **Markdown**.");
 * ```
 */
export function parse(markdown: string, options: ParseOptions = {}): string {
    const opts: ParseOptions = {
        externalLinks: true,
        breaks: false,
        smartypants: false,
        sanitize: false,
        ...options,
    };

    // Zeilenenden normalisieren
    let text = markdown.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    // -------------------------------------------------------------------------
    // Fenced Code Blocks VOR allem anderen extrahieren und als Platzhalter
    // sichern – so kann kein anderer Parser (Inline-Code, Absatz, …) den
    // Inhalt anfassen.
    // -------------------------------------------------------------------------
    const codeBlockPlaceholders: string[] = [];
    text = text.replace(
        /^(`{3,}|~{3,})([^\n]*)\n([\s\S]*?)\n?\1[ \t]*(?:\n|$)/gm,
        (_, fence, lang, code) => {
            const idx = codeBlockPlaceholders.push(renderCodeBlock(lang.trim(), code)) - 1;
            return `@@CODEBLOCK${idx}@@\n`;
        }
    );

    // Fußnoten-Definitionen einsammeln
    const { text: cleaned, notes } = collectFootnotes(text);
    text = cleaned;

    // Fußnoten-Referenzen im Text ersetzen
    text = renderFootnoteRefs(text, notes, opts);

    // Block-Parsing
    let html = parseBlocks(text, opts);

    // Platzhalter durch gerenderte Code-Blöcke ersetzen
    html = html.replace(/@@CODEBLOCK(\d+)@@/g, (_, i) => codeBlockPlaceholders[+i]);

    // Fußnoten-Liste anhängen
    html += renderFootnoteList(notes, opts);

    return html;
}

/**
 * Gibt ein vollständiges HTML-Dokument zurück (optional mit eigenem CSS).
 */
export function parseToDocument(
    markdown: string,
    options: ParseOptions & { title?: string; css?: string, header?: string, } = {}
): string {
    const { title = "Dokument", header = "", css = defaultCss, ...parseOpts } = options;
    const body = parse(markdown, parseOpts);
    return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>${css}</style>
${header}
</head>
<body>
<article class="md-body">
${body}
</article>
</body>
</html>`;
}

// Function to export the CSS
export function exportcss(): string {
    return defaultCss;
}

// ---------------------------------------------------------------------------
// CLI  (wird ausgeführt wenn die Datei direkt aufgerufen wird)
// ---------------------------------------------------------------------------

// if (typeof process !== "undefined" && process.argv[1]?.endsWith("markdown-parser.ts")) {
//   const args = process.argv.slice(2);
//   if (args.length === 0) {
//     // Demo
//     const demo = `
// # Markdown Parser Demo

// Ein vollständiger **Markdown → HTML** Parser in *TypeScript*.

// ## Features

// - Überschriften (H1-H6)
// - **Fett**, *Kursiv*, ~~Durchgestrichen~~, \`Inline-Code\`
// - ==Markiert==, ^Hochgestellt^, ~Tiefgestellt~
// - [Links](https://example.com "Beispiel") und ![Bilder](https://via.placeholder.com/100 "Platzhalter")
// - Aufgabenlisten:
//   - [x] Inline-Parser
//   - [x] Block-Parser
//   - [ ] CLI-Tool

// ## Code

// \`\`\`typescript
// const html = parse("# Hallo");
// console.log(html);
// \`\`\`

// ## Tabelle

// | Spalte | Typ    | Pflicht |
// |:-------|:------:|--------:|
// | text   | string | ja      |
// | id     | number | nein    |

// > Blockquotes werden auch unterstützt.
// > > Sogar verschachtelt!

// ---

// Fußnoten[^1] funktionieren ebenfalls.

// [^1]: Das ist eine Fußnote.
// `.trim();

//     console.log(parseToDocument(demo, { title: "Demo", smartypants: true }));
//   }
// }
