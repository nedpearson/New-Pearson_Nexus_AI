import React from "react";

// --- PNX_SAFE_MODE_V1 ---

// --- PNX_RENDER_TELEMETRY_V1 ---
  try {
    const m: any = (performance as any).memory;
    if(!m) return null;
    return Math.round((m.usedJSHeapSize / 1024 / 1024) * 10) / 10;
  } catch { return null; }
}
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



  const __pnxRender = (window as any).__PNX_RENDER_CT = (((window as any).__PNX_RENDER_CT) || 0) + 1;
  if(__pnxRender % 50 === 0){ console.log('PNX renders=', __pnxRender, 'heapMB=', __pnxMemMB()); }
  if(__PNX_SAFE){ return <__PNX_SafeModeScreen />; }
return (
    <div style={{ padding: 24 }}>
      <div style={{
        position: "fixed",
        top: 12,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 99999,
        padding: "10px 14px",
        borderRadius: 16,
        background: "rgba(0,0,0,0.75)",
        border: "1px solid rgba(255,255,255,0.25)",
        color: "#fff",
        fontWeight: 900
      }}>
      </div>
      <h1 style={{ marginTop: 48 }}></h1>
      <ul>
      </ul>
    </div>
  );
}




