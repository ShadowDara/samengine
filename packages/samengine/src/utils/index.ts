// Utils Package

// Math Utilities
export { clamp, lerp, map, scale } from "./math.js";

// Markdown Parser
export type { ParseOptions as MarkdownParseOptions } from "./markdown.js";
export {
    parse as parseMarkdown,
    parseToDocument as parseMarkdownToDocument,
    exportcss as exportMarkdownCSS
} from "./markdown.js";

// JSON5 Parser
export type {
    JSONValue
} from "./jsonc-parser.js";
export {
    parseJSONC
} from "./jsonc-parser.js";

// Tiny Hash function
export function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0; // 32bit int
  }
  return h;
}

