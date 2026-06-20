export interface VNode {
  tag: string | symbol | Function;
  props: Record<string, unknown>;
  children: unknown[];
}

export function Fragment(props: any) {
  return props.children;
}

export function h(
  tag: string | symbol | Function,
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
