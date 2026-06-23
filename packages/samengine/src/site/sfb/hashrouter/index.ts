export interface Route {
  path: string;
  component: () => any;
}

export class HashRouter {
  constructor(private routes: Route[]) {}

  getCurrentComponent() {
    let path = "/";

    if (typeof window !== "undefined") {
      path = window.location.hash.slice(1) || "/";
    }

    const route = this.routes.find((r) => r.path === path);

    return route?.component ?? (() => "<h1>404</h1>");
  }

  clientScript() {
    return `
      window.addEventListener("hashchange", () => {
        location.reload();
      });
    `;
  }
}
