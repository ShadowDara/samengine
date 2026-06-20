export {};

declare global {
  namespace JSX {
    type Element = any;

    interface ElementChildrenAttribute {
      children: {};
    }

    interface IntrinsicElements {
      [tagName: string]: any;
    }
  }
}
