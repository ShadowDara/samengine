const routes = {
  "/": "<div><h2>Home</h2><p>Startseite</p></div>",
  "/about": "<div><h2>About</h2><p>Über uns</p></div>",
};

function renderRoute() {
  const path = location.hash.slice(1) || "/";
  document.getElementById("router-view").innerHTML =
    routes[path] || "<h1>404</h1>";
}

window.addEventListener("hashchange", renderRoute);
renderRoute();
