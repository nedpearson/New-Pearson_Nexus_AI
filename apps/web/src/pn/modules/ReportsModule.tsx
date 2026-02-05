import React, { useMemo, useState } from "react";
import type { AppData } from "../data/model";
import { Card, Button, Pill } from "../components/kit";

export function ReportsModule(props: { data: AppData }) {
  const [tab, setTab] = useState<"summary"|"exports"|"insights">("summary");

  const stats = useMemo(() => {
    const totalCaptures = props.data.library.length;
    const needsApproval = props.data.library.filter(i => !i.approvedCategory).length;
    const totalBills = props.data.bills.length;
    const openLegalThreads = props.data.legal.threads.length;
    return { totalCaptures, needsApproval, totalBills, openLegalThreads };
  }, [props.data.library, props.data.bills, props.data.legal.threads]);

  return (
    <div className="pn-col">
      <div className="pn-layout" style={{ gridTemplateColumns: "repeat(4, minmax(0,1fr))" }}>
        <Card title="Captures" subtitle="Total items saved.">
          <div className="pn-kpiNum">{stats.totalCaptures}</div>
          <div className="pn-small pn-muted">Library items</div>
        </Card>
        <Card title="Needs approval" subtitle="Unapproved category suggestions.">
          <div className="pn-kpiNum">{stats.needsApproval}</div>
          <div className="pn-small pn-muted">Awaiting approval</div>
        </Card>
        <Card title="Bills" subtitle="Saved bill entries.">
          <div className="pn-kpiNum">{stats.totalBills}</div>
          <div className="pn-small pn-muted">Bills tracked</div>
        </Card>
        <Card title="Legal" subtitle="Threads tracked.">
          <div className="pn-kpiNum">{stats.openLegalThreads}</div>
          <div className="pn-small pn-muted">Legal threads</div>
        </Card>
      </div>

      <Card title="Reports" subtitle="Simple summaries and exports (prototype)." right={<Pill>{tab}</Pill>}>
        <div style={{ display:"flex", gap:8, marginBottom: 10, flexWrap:"wrap" }}>
          <Button onClick={() => setTab("summary")} variant={tab === "summary" ? "primary" : "ghost"}>Summary</Button>
          <Button onClick={() => setTab("insights")} variant={tab === "insights" ? "primary" : "ghost"}>Insights</Button>
          <Button onClick={() => setTab("exports")} variant={tab === "exports" ? "primary" : "ghost"}>Exports</Button>
        </div>

        {tab === "summary" && (
          <div className="pn-list">
            <div className="pn-item">
              <div style={{ fontWeight: 900 }}>Weekly snapshot</div>
              <div className="pn-small pn-muted">A simple overview of captures, money, and legal activity.</div>
            </div>
            <div className="pn-item">
              <div style={{ fontWeight: 900 }}>Monthly snapshot</div>
              <div className="pn-small pn-muted">Month-to-date totals and what changed.</div>
            </div>
          </div>
        )}

        {tab === "insights" && (
          <div className="pn-list">
            <div className="pn-item">
              <div style={{ fontWeight: 900 }}>Top categories</div>
              <div className="pn-small pn-muted">Which categories you use most (from Capture).</div>
            </div>
            <div className="pn-item">
              <div style={{ fontWeight: 900 }}>Approvals trend</div>
              <div className="pn-small pn-muted">How often the model needs approval, over time.</div>
            </div>
          </div>
        )}

        {tab === "exports" && (
          <div className="pn-list">
            <div className="pn-item">
              <div style={{ fontWeight: 900 }}>Export (JSON)</div>
              <div className="pn-small pn-muted">A portable backup of your local data (prototype).</div>
              <div style={{ marginTop: 10 }}>
                <Button
                  variant="primary"
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(props.data, null, 2)], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "pearson-nexus-ai-export.json";
                    a.click();
                    setTimeout(() => URL.revokeObjectURL(url), 500);
                  }}
                >
                  Download export
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

