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
