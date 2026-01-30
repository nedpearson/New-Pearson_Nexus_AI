import fs from "fs";

function exists(p){ try{ fs.accessSync(p); return true; } catch { return false; } }

function writeEnv() {
  const p = ".env.local";
  const lines = [
    "VITE_OFFLINE_MODE=true",
    "VITE_SUPABASE_ENABLED=false",
    "VITE_ANALYTICS_ENABLED=false",
    "VITE_GOOGLE_ENABLED=false",
    "VITE_EMAIL_ENABLED=false",
    "VITE_QUICKBOOKS_ENABLED=false",
    "VITE_OPENAI_ENABLED=false",
    ""
  ];
  fs.writeFileSync(p, lines.join("\n"), "utf8");
  console.log("Wrote", p);
}

function stripChmlnFromIndexHtml() {
  const p = "index.html";
  if (!exists(p)) return;
  const before = fs.readFileSync(p, "utf8");
  let after = before;

  // Remove any <script ...chmln...> blocks or src includes
  after = after.replace(/<script\b[^>]*\bchmln\b[^>]*>[\s\S]*?<\/script>\s*/gi, "");
  after = after.replace(/<script\b[^>]*src=["'][^"']*chmln[^"']*["'][^>]*>\s*<\/script>\s*/gi, "");

  if (after !== before) {
    fs.writeFileSync(p, after, "utf8");
    console.log("Patched", p, "(removed chmln scripts)");
  }
}

function injectChmlnStubIntoMain() {
  const candidates = [
    "src/main.tsx",
    "src/main.ts",
    "src/main.jsx",
    "src/main.js"
  ];

  const marker = "/* PNX_OFFLINE_GUARD_CHMLN */";
  const stubTS =
`${marker}
const w = window as any;
w.chmln = w.chmln ?? { get: () => null, identify: () => {}, track: () => {}, set: () => {}, alias: () => {} };
`;

  const stubJS =
`${marker}
window.chmln = window.chmln || { get: () => null, identify: () => {}, track: () => {}, set: () => {}, alias: () => {} };
`;

  for (const p of candidates) {
    if (!exists(p)) continue;

    const before = fs.readFileSync(p, "utf8");
    if (before.includes(marker)) {
      console.log("Already guarded:", p);
      return;
    }

    const inject = (p.endsWith(".ts") || p.endsWith(".tsx")) ? stubTS : stubJS;
    fs.writeFileSync(p, inject + "\n" + before, "utf8");
    console.log("Injected offline chmln stub into:", p);
    return;
  }

  console.log("No main file found to inject chmln guard (src/main.*).");
}

writeEnv();
stripChmlnFromIndexHtml();
injectChmlnStubIntoMain();
console.log("✅ Offline patch applied (local-only).");
