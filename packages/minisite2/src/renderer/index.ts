import { VNode, Fragment } from "../jsx-runtime/index.js";

const VOID_ELEMENTS = new Set([
    "area", "base", "br", "col", "embed", "hr", "img", "input",
    "link", "meta", "param", "source", "track", "wbr",
]);

const ATTR_MAP: Record<string, string> = {
    className: "class",
    htmlFor: "for",
};

function renderAttrs(props: Record<string, unknown>): string {
    return Object.entries(props)
        .filter(([key]) => key !== "children")
        .map(([key, val]) => {
            const attr = ATTR_MAP[key] ?? key;
            if (val === true) return attr;
            if (val === false || val == null) return "";
            return `${attr}="${String(val).replace(/"/g, "&quot;")}"`;
        })
        .filter(Boolean)
        .join(" ");
}

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

export function renderToString(node: unknown): string {
    if (node == null || node === false || node === true) return "";
    if (typeof node === "string") return escapeHtml(node);
    if (typeof node === "number") return String(node);
    if (Array.isArray(node)) return node.map(renderToString).join("");

    const vnode = node as VNode;

    // Fragment
    if (vnode.tag === Fragment) {
        return vnode.children.map(renderToString).join("");
    }

    // Component
    if (typeof vnode.tag === "function") {
        const props = { ...vnode.props, children: vnode.children };
        const result = (vnode.tag as Function)(props);
        return renderToString(result);
    }

    // HTML element
    const tag = vnode.tag as string;
    const attrs = renderAttrs(vnode.props);
    const attrStr = attrs ? ` ${attrs}` : "";

    if (VOID_ELEMENTS.has(tag)) {
        return `<${tag}${attrStr}>`;
    }

    const children = vnode.children.map(renderToString).join("");
    return `<${tag}${attrStr}>${children}</${tag}>`;
}
