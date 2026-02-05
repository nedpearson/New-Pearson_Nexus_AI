import React from "react";
import { Card, Tile } from "../../pn/components/kit";
import type { ModuleKey } from "../../pn/types";

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
        <div className="pn-small pn-muted">
          Use the “Install on Phone” button (or scan the QR) on the header.
        </div>
      </Card>
    </div>
  );
}

