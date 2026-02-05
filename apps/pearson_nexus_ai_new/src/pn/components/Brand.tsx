import React from "react";

export function Brand() {
  return (
    <div className="pn-brand">
      <div className="pn-logo">
        <img src="/logo.png" alt="PearsonNexusAI" />
      </div>
      <div style={{ lineHeight: 1.1 }}>
        <div style={{ fontWeight: 900, letterSpacing: ".2px" }}>PearsonNexusAI</div>
        <div className="pn-small pn-muted">Simple. Fun. Organized.</div>
      </div>
    </div>
  );
}
