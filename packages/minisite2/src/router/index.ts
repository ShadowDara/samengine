export const ROUTER_SCRIPT = `
(function () {
    function render() {
        var path = location.hash.slice(1) || "/";
        var html = window.ROUTES[path] || window.ROUTES["/404"] || "<h1>404</h1>";
        document.getElementById("app").innerHTML = html;
    }
    window.addEventListener("hashchange", render);
    render();
})();
`.trim();
