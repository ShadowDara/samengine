import { h } from "minisite/jsx-runtime";

interface LinkProps {
  to: string;
  children?: unknown;
}

export function Link({ to, children }: LinkProps) {
  return <a href={`#${to}`}>{children}</a>;
}
