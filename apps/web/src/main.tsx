import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { CrashOverlay, ErrorBoundary, installGlobalCrashHandlers } from "./CrashOverlay";

const el = document.getElementById("root");
if (!el) throw new Error("Missing #root element in index.html");

createRoot(el).render(
  <React.StrictMode>
    <__PNX_AppRoot />
  </React.StrictMode>
);

// PWA: register service worker (enables install prompt on supported browsers)
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // ignore registration failures
    });
  });
}
// --- PNX_APPROOT_OVERLAY_V1 ---
type __PNXCrashInfo = { title: string; detail: string };

function __PNX_AppRoot() {
  const [crash, setCrash] = React.useState<__PNXCrashInfo | null>(null);

  React.useEffect(() => {
    installGlobalCrashHandlers((c) => setCrash(c));
  }, []);

  return (
    <>
      <ErrorBoundary onCrash={(c) => setCrash(c)}>
        <App />
      </ErrorBoundary>
      <CrashOverlay crash={crash} onClose={() => setCrash(null)} />
    </>
  );
}

