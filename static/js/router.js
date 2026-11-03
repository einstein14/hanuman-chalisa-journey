const routes = {};

export function registerRoute(path, handler) {
  routes[path] = handler;
}

export function navigate(hash) {
  window.location.hash = hash;
}

function parseHash() {
  const raw = window.location.hash.replace(/^#/, "") || "/";
  const [path, query] = raw.split("?");
  const params = new URLSearchParams(query || "");
  return { path: path.startsWith("/") ? path : `/${path}`, params };
}

export async function startRouter(onRoute) {
  const run = async () => {
    const { path, params } = parseHash();
    let handler = routes[path];
    if (!handler) {
      const learnMatch = path.match(/^\/learn\/(\d+)$/);
      if (learnMatch) {
        handler = routes["/learn/:id"];
        params.set("id", learnMatch[1]);
      }
      const storyMatch = path.match(/^\/stories\/(\d+)$/);
      if (storyMatch) {
        handler = routes["/stories/:id"];
        params.set("id", storyMatch[1]);
      }
      const meaningMatch = path.match(/^\/meaning\/(\d+)$/);
      if (meaningMatch) {
        handler = routes["/meaning/:id"];
        params.set("id", meaningMatch[1]);
      }
    }
    if (!handler) handler = routes["/"];
    await handler({ path, params, navigate, onRoute });
  };
  window.addEventListener("hashchange", run);
  await run();
}
