import React from "react";
import { Card, Tile } from "../../pn/components/kit";
import type { ModuleKey } from "../../pn/types";
import { MobileAppQRCode } from "../../components/MobileAppQRCode";
import { SyncButton } from "../../components/SyncButton";

export function BusinessDashboardModule(props: { go: (k: ModuleKey) => void }) {
  return (
    <div className="pn-col">
      <Card title="Business Overview" subtitle="Quick shortcuts (prototype).">
        <div className="pn-tiles">
          <Tile title="Clients" subtitle="Track contacts + notes" icon="👥" onClick={() => props.go("clients")} />
          <Tile title="Invoices" subtitle="Create + export" icon="🧾" onClick={() => props.go("invoices")} />
          <Tile title="Projects" subtitle="Organize work" icon="📁" onClick={() => props.go("projects")} />
          <Tile title="Reports" subtitle="KPIs + summaries" icon="📊" onClick={() => props.go("reports")} />
        </div>
      </Card>

      <Card title="Tip" subtitle="Install to your phone Home Screen for fastest access.">
        <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          <MobileAppQRCode path="/m" size={92} />
          <div className="pn-small pn-muted" style={{ minWidth: 240 }}>
            <div style={{ fontWeight: 900, color: "rgba(238,242,255,.92)" }}>Scan to open on mobile.</div>
            <div>Add to Home Screen to install for offline use.</div>
            <div style={{ marginTop: 8 }}>
              <SyncButton compact />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

