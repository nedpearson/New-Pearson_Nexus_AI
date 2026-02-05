import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { AppRoot } from "./AppRoot";

const el = document.getElementById("root");
if (!el) throw new Error("Missing #root element in index.html");

createRoot(el).render(
  <React.StrictMode>
    <AppRoot />
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
