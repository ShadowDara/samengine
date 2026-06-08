globalThis.jsx = function (tag, props, ...children) {
  return { tag, props, children };
};

export function jsx(tag: any, props: any, ...children: any[]) {
  const propChildren = props?.children;

  return {
    tag,
    props: props || {},
    children: children.length
      ? children
      : propChildren
        ? Array.isArray(propChildren)
          ? propChildren
          : [propChildren]
        : []
  };
}

export const jsxs = jsx;
export const Fragment = Symbol("Fragment");

export function setInnerHTML(html: any) {
  return { __html: String(html) };
}

export function render(node: any): string {
  if (node == null || node === false) return "";

  if (node.__html != null) {
    return String(node.__html);
  }

  if (typeof node === "string" || typeof node === "number") {
    return escapeHtml(String(node));
  }

  if (node.tag === Fragment) {
    return (node.children || []).map(render).join("");
  }

  if (typeof node.tag === "function") {
    return render(node.tag(node.props || {}));
  }

  const rawHtml = node.props?.innerHTML;
  const attrs = Object.entries(node.props || {})
    .filter(([k]) => k !== "children" && k !== "innerHTML")
    .map(([k, v]) => ` ${k}="${escapeAttr(v)}"`)
    .join("");

  const children = rawHtml != null
    ? String(rawHtml)
    : (node.children || []).map(render).join("");

  return `<${node.tag}${attrs}>${children}</${node.tag}>`;
}

function escapeHtml(str: string) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttr(str: any) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;");
}
