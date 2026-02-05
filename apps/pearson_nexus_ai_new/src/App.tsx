import React from "react";

export default function App() {
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
        PATCH ACTIVE — PearsonNexusAI (White Page Fix)
      </div>

      <h1 style={{ marginTop: 48 }}>PearsonNexusAI is rendering.</h1>
      <p>If you see this, your blank page issue is resolved. Next we re-apply the playful UI safely.</p>
      <ul>
        <li>URL should be http://127.0.0.1:5173/</li>
        <li>Dev server must be started from this exact folder.</li>
      </ul>
    </div>
  );
}
