import { VNode, Fragment } from "../jsx-runtime/index.js";

const VOID = new Set(["img","input","br","hr","meta","link"]);

let eventId = 0;

export type RouteOutput = {
  html: string;
  events: Array<{
    id: number;
    type: string;
    handler: string;
  }>;
};

const events = new Map<number, Record<string, Function>>();

const ATTR_MAP: Record<string, string> = {
    className: "class",
    htmlFor: "for",
};

function renderAttrs(props: Record<string, unknown>): string {
    const attrs: string[] = [];

    for (const [key, val] of Object.entries(props)) {

        if (key === "children") continue;

        if (key.startsWith("on") && typeof val === "function") {
            const id = ++eventId;

            events.set(id, {
                [key.slice(2).toLowerCase()]: val,
            });

            attrs.push(`data-ms-event="${id}"`);
            continue;
        }

        const attr = ATTR_MAP[key] ?? key;

        if (val === true) {
            attrs.push(attr);
            continue;
        }

        if (val === false || val == null) {
            continue;
        }

        attrs.push(
            `${attr}="${String(val).replace(/"/g, "&quot;")}"`
        );
    }

    return attrs.join(" ");
}

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

export function getEvents() {
    return events;
}

export function renderToString(node: any, events: RouteOutput["events"] = []): string {
  if (node == null || node === false) return "";
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(n => renderToString(n, events)).join("");

  const vnode = node as VNode;

  if (typeof vnode.tag === "function") {
    return renderToString(vnode.tag(vnode.props), events);
  }

  if (vnode.tag === Fragment) {
    return renderToString(vnode.children, events);
  }

  const tag = vnode.tag as string;

  const props = vnode.props ?? {};
  const attrs: string[] = [];

  const myId = ++eventId;

  // EVENT SYSTEM
  if (props["data-ms"]) {
    const [type, handler] = String(props["data-ms"]).split(":");

    events.push({
      id: myId,
      type,
      handler,
    });

    attrs.push(`data-ms-id="${myId}"`);
  }

  for (const [k, v] of Object.entries(props)) {
    if (k === "children" || k === "data-ms") continue;

    if (typeof v === "function") continue;

    const attr = k === "className" ? "class" : k;

    if (v === true) {
      attrs.push(attr);
      continue;
    }

    if (v != null && v !== false) {
      attrs.push(`${attr}="${String(v)}"`);
    }
  }

  const attrStr = attrs.length ? " " + attrs.join(" ") : "";

  const children = renderToString(vnode.children, events);

  if (VOID.has(tag)) {
    return `<${tag}${attrStr}>`;
  }

  return `<${tag}${attrStr}>${children}</${tag}>`;
}
