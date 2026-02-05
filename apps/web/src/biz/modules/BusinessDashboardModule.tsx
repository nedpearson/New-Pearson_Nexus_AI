import React from "react";
import { Card, Tile } from "../../pn/components/kit";
import type { ModuleKey } from "../../pn/types";
import { SyncButton } from "../../components/SyncButton";
import type { AppData } from "../../pn/data/model";
import { DashboardV2 } from "../../features/dashboard/DashboardV2";

export function BusinessDashboardModule(props: {
  go: (k: ModuleKey) => void;
  data: AppData;
  userTier: "Free" | "Plus" | "Pro";
  isAdmin: boolean;
  dashboardV2Enabled: boolean;
}) {
  if (props.dashboardV2Enabled) {
    return (
      <DashboardV2
        view="business"
        data={props.data}
        go={props.go}
        userTier={props.userTier}
        isAdmin={props.isAdmin}
      />
    );
  }

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
          <div style={{ fontWeight: 900, color: "rgba(238,242,255,.92)" }}>Sync queued captures</div>
          <div style={{ marginTop: 8 }}>
            <SyncButton compact />
          </div>
        </div>
      </Card>
    </div>
  );
}

