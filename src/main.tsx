import React from "react";
import { createRoot } from "react-dom/client";

(function () {
  const pre = document.createElement("div");
  pre.id = "pnx-probe-banner";
  pre.style.cssText =
    "position:fixed;inset:0;display:flex;align-items:center;justify-content:center;" +
    "background:#001bff;color:#fff;font:800 28px/1.2 system-ui,Segoe UI,Arial;z-index:999999";
  pre.textContent = "PNX PROBE: JS LOADED ✅  (React mounting...)";
  document.body.appendChild(pre);
})();

const rootEl = document.getElementById("root");
if (!rootEl) {
  const d = document.createElement("div");
  d.style.cssText =
    "position:fixed;inset:0;background:#000;color:#fff;padding:16px;font:14px/1.4 monospace;z-index:999999";
  d.textContent = "PNX PROBE ERROR: #root not found in index.html";
  document.body.appendChild(d);
  throw new Error("PNX PROBE: #root not found");
}

createRoot(rootEl).render(
  <div style={{ padding: 24, fontFamily: "system-ui, Segoe UI, Arial", color: "#111" }}>
    <h1 style={{ margin: 0 }}>PNX PROBE: React mounted ✅</h1>
    <p style={{ marginTop: 12 }}>
      If you can see this, the bundle is running. The real app is rendering a full-screen blue UI or
      failing silently inside app code.
    </p>
  </div>
);
