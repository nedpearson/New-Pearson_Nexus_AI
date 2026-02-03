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
      </div>
      <h1 style={{ marginTop: 48 }}></h1>
      <ul>
      </ul>
    </div>
  );
}

