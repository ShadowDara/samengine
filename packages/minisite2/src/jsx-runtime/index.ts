export interface VNode {
  tag: string | Function;
  props: Record<string, any>;
  children: any[];
}

export const Fragment = "Fragment";

export function h(
  tag: string | Function,
  props: Record<string, unknown> | null,
  ...children: unknown[]
): VNode {
  return {
    tag,
    props: props ?? {},
    children: children.flat(),
  };
}

// For tsconfig jsx: "react"
export const createElement = h;
