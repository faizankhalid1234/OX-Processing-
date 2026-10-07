// Backend API base (no trailing slash).
// Local: http://localhost:3000
// Vercel backend: https://your-ox-backend.vercel.app
window.API_BASE =
  window.API_BASE ||
  (window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000"
    : "https://ox-backend.vercel.app");

function apiUrl(path) {
  const base = String(window.API_BASE || "").replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

window.apiUrl = apiUrl;
