/**
 * Lets this package's own `tsc` build type-check `index.ts`'s re-exports of
 * `.svelte` files. This has no effect on consumer projects - real Svelte
 * apps already get `*.svelte` module typing from their own SvelteKit/Vite
 * tooling. This file only unblocks compiling *this* package.
 */
declare module "*.svelte" {
    import type { Component } from "svelte";

    const component: Component<Record<string, any>>;
    export default component;
}
