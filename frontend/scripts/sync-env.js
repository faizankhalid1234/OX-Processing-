const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const envPath = path.join(root, ".env");
const outPath = path.join(root, "js", "env.js");

function readEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const map = {};
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const i = trimmed.indexOf("=");
    if (i === -1) {
      continue;
    }

    const key = trimmed.slice(0, i).trim();
    const value = trimmed
      .slice(i + 1)
      .trim()
      .replace(/^['"]|['"]$/g, "");
    map[key] = value;
  }

  return map;
}

const env = readEnv(envPath);
const apiBase = String(env.API_BASE || "").replace(/\/$/, "");

fs.writeFileSync(
  outPath,
  `window.API_BASE = ${JSON.stringify(apiBase)};\n`,
  "utf8"
);

console.log("Wrote js/env.js from .env");
