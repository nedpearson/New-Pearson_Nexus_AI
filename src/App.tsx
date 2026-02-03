import React from "react";
import { AppShell } from "./pn/AppShell";
import "./pn/pn.css";

// --- PNX_SAFE_MODE_V1 ---
const __PNX_SAFE =
  (typeof window !== "undefined") &&
  (new URLSearchParams(window.location.search).get("safe") === "1");

function __PNX_SafeModeScreen() {
  return (
    <div style={{ padding: 18, fontFamily: "ui-sans-serif, system-ui", lineHeight: 1.4 }}>
      <h2 style={{ margin: 0 }}>PNX SAFE MODE ✅</h2>
      <p style={{ marginTop: 10 }}>
        Safe mode is ON (<code>?safe=1</code>). Heavy boot/data code is disabled to prevent the browser OOM crash.
      </p>
      <p style={{ marginTop: 10 }}>
        Next step: we re-enable modules one-by-one to find the loop.
      </p>
    </div>
  );
}
export default function App() {
  if (__PNX_SAFE) return <__PNX_SafeModeScreen />;
  return <AppShell />;
}


