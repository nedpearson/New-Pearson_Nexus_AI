import React from "react";
import { createRoot } from "react-dom/client";

(() => {
  const bannerId = "pnx-probe-banner";
  const boxId = "pnx-probe-error";

  const esc = (s: any) =>
    String(s ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" } as any)[c]);

  function banner(msg: string) {
    let el = document.getElementById(bannerId) as HTMLDivElement | null;
    if (!el) {
      el = document.createElement("div");
      el.id = bannerId;
      el.style.cssText =
        "position:fixed;inset:0;display:flex;align-items:center;justify-content:center;" +
        "background:#001bff;color:#fff;font:800 28px/1.2 system-ui,Segoe UI,Arial;z-index:999999";
      document.body.appendChild(el);
    }
    el.textContent = msg;
  }

  function showErr(title: string, detail: any) {
    let el = document.getElementById(boxId) as HTMLDivElement | null;
    if (!el) {
      el = document.createElement("div");
      el.id = boxId;
      el.style.cssText =
        "position:fixed;inset:0;z-index:1000000;background:rgba(0,0,0,.88);color:#fff;" +
        "padding:18px;font:14px/1.35 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;overflow:auto";
      document.body.appendChild(el);
    }
    const text = typeof detail === "string" ? detail : (detail?.stack || detail?.message || JSON.stringify(detail));
    el.innerHTML =
      '<div style="font-size:16px;font-weight:800;margin-bottom:10px">PNX PROBE: React mount FAILED</div>' +
      '<div style="opacity:.85;margin-bottom:10px">' + esc(title) + "</div>" +
      '<pre style="white-space:pre-wrap;margin:0;opacity:.95">' + esc(text) + "</pre>" +
      '<div style="margin-top:14px;opacity:.8">Copy this error and paste it back to ChatGPT.</div>';
  }

  window.addEventListener("error", (e: any) => showErr("window.error", e?.error || e?.message || e));
  window.addEventListener("unhandledrejection", (e: any) => showErr("unhandledrejection", e?.reason || e));

  banner("PNX PROBE: JS LOADED ✅  (React mounting...)");

  try {
    const rootEl = document.getElementById("root");
    if (!rootEl) throw new Error("PNX PROBE: #root not found in index.html");

    const root = createRoot(rootEl);

    root.render(
      <div style={{ padding: 24, fontFamily: "system-ui, Segoe UI, Arial", color: "#111", background: "#fff", minHeight: "100vh" }}>
        <h1 style={{ margin: 0 }}>PNX PROBE: React mounted ✅</h1>
        <p style={{ marginTop: 12 }}>
          If you see this, React can mount. Your real app’s blue screen is coming from app code/state/routing.
        </p>
      </div>
    );

    // If render succeeded, update banner
    banner("PNX PROBE: React mounted ✅");
    // Optional: remove banner after a moment
    setTimeout(() => {
      const b = document.getElementById(bannerId);
      if (b) b.remove();
    }, 800);
  } catch (err: any) {
    showErr("try/catch around createRoot.render()", err);
  }
})();
