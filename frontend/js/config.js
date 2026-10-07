function apiUrl(path) {
  const base = String(window.API_BASE || "").replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

window.apiUrl = apiUrl;
