export const ROUTER_SCRIPT = `
(function () {

  const handlers = {
    copyTextarea(e) {
      const output = document.getElementById("output");
      output.textContent = e.target.value;
    }
  };

  function render() {
    const path = location.hash.slice(1) || "/";
    const route = window.ROUTES[path] || window.ROUTES["/404"];

    const app = document.getElementById("app");

    app.innerHTML = route.html;

    // bind events (correct version)
    route.events.forEach(ev => {
      const el = app.querySelector(\`[data-ms-id="\${ev.id}"]\`);

      if (!el) return;

      const handler = handlers[ev.handler];
      if (!handler) return;

      el.addEventListener(ev.type, handler);
    });
  }

  window.addEventListener("hashchange", render);
  render();

})();
`.trim();
