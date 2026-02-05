import React from "react";
import { AppData } from "../data/model";
import { Tile, Card, Button, Pill } from "../components/kit";

export function DashboardModule(props: { data: AppData; go: (k: any) => void; userTier: "Free"|"Plus"|"Pro" }) {
  const dueBills = props.data.bills.filter(b => b.status === "due" || b.status === "late").length;
  const needsApproval = props.data.library.filter(i => !i.approvedCategory).length;

  return (
    <div className="pn-col">
      <div className="pn-card pn-p">
        <div className="pn-row">
          <div>
            <div className="pn-h1">Today</div>
            <div className="pn-small pn-muted">Simple snapshot. Big buttons. No clutter.</div>
          </div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <Pill>Desktop + Mobile</Pill>
            <Pill>Capture + Approval</Pill>
            <Pill>Learning</Pill>
          </div>
        </div>

        <div className="pn-kpiGrid" style={{ marginTop: 12 }}>
          <div className="pn-kpi">
            <div className="pn-small pn-muted">Bills needing attention</div>
            <div className="pn-kpiNum">{dueBills}</div>
          </div>
          <div className="pn-kpi">
            <div className="pn-small pn-muted">Items waiting approval</div>
            <div className="pn-kpiNum">{needsApproval}</div>
          </div>
        </div>

        <div className="pn-tiles" style={{ marginTop: 12 }}>
          <Tile title="Quick Capture" subtitle="Voice, video, notes" icon="📸" onClick={() => props.go("documents")} badge="1 tap" />
          <Tile title="Pay Bills" subtitle="Links included" icon="💳" onClick={() => props.go("finances")} badge={props.userTier==="Free"?"🔒 Plus":"Ready"} />
          <Tile title="Legal Notes" subtitle="Divorce/Custody" icon="⚖️" onClick={() => props.go("legal")} badge={props.userTier==="Free"?"🔒 Plus":"Ready"} />
          <Tile title="Customize" subtitle="Drag/drop tabs" icon="🛠️" onClick={() => props.go("admin")} badge={props.userTier!=="Pro"?"🔒 Pro":"Pro"} />
        </div>
      </div>

      <Card title="Recent captures" subtitle="Most recent items in your library." right={<Pill>{props.data.library.length} total</Pill>}>
        <div className="pn-list">
          {props.data.library.slice(0, 4).map(i => (
            <div key={i.id} className="pn-item">
              <div className="pn-row">
                <div>
                  <div style={{ fontWeight: 850 }}>{i.title}</div>
                  <div className="pn-small pn-muted">{new Date(i.createdAt).toLocaleString()} • {i.kind}</div>
                </div>
                <span className="pn-badge">{i.approvedCategory ? `✅ ${i.approvedCategory}` : "⏳ needs approval"}</span>
              </div>
              {i.text && <div style={{ marginTop: 8, color: "rgba(238,242,255,.78)" }}>{i.text}</div>}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 10 }}>
          <Button variant="primary" onClick={() => props.go("documents")}>Open Capture</Button>
        </div>
      </Card>
    </div>
  );
}
