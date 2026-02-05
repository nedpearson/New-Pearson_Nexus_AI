import React, { useMemo, useState } from "react";
import { AppData } from "../data/model";
import { Card, Button, Pill } from "../components/kit";

function money(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

export function FinancesModule(props: { data: AppData }) {
  const [tab, setTab] = useState<"bills"|"expenses">("bills");

  const totals = useMemo(() => {
    const billsDue = props.data.bills.filter(b => b.status === "due" || b.status === "late");
    const month = new Date().toISOString().slice(0,7);
    const monthExp = props.data.expenses.filter(e => e.date.startsWith(month)).reduce((a,e)=>a+e.amount,0);
    return { billsDue, monthExp };
  }, [props.data.bills, props.data.expenses]);

  return (
    <div className="pn-col">
      <div className="pn-layout" style={{ gridTemplateColumns: "repeat(3, minmax(0,1fr))" }}>
        <Card title="Bills" subtitle="One place for every bill.">
          <div className="pn-kpiNum">{props.data.bills.length}</div>
          <div className="pn-small pn-muted">Total bills saved</div>
          <div style={{ marginTop: 10 }}><Button variant="primary" onClick={()=>setTab("bills")}>Open Bills</Button></div>
        </Card>

        <Card title="Due soon" subtitle="Only what matters.">
          <div className="pn-kpiNum">{totals.billsDue.length}</div>
          <div className="pn-small pn-muted">Bills marked due/late</div>
        </Card>

        <Card title="This month" subtitle="Expenses snapshot.">
          <div className="pn-kpiNum">{money(totals.monthExp)}</div>
          <div className="pn-small pn-muted">Month-to-date</div>
          <div style={{ marginTop: 10 }}><Button onClick={()=>setTab("expenses")}>Open Expenses</Button></div>
        </Card>
      </div>

      <Card title="Money" subtitle="Bills + expenses with quick links." right={<Pill>{tab==="bills"?"Bills":"Expenses"}</Pill>}>
        <div style={{ display:"flex", gap:8, marginBottom: 10 }}>
          <Button onClick={()=>setTab("bills")} variant={tab==="bills"?"primary":"ghost"}>Bills</Button>
          <Button onClick={()=>setTab("expenses")} variant={tab==="expenses"?"primary":"ghost"}>Expenses</Button>
        </div>

        {tab === "bills" && (
          <div className="pn-list">
            {props.data.bills.map(b => (
              <div key={b.id} className="pn-item">
                <div className="pn-row">
                  <div>
                    <div style={{ fontWeight: 900 }}>{b.name}</div>
                    <div className="pn-small pn-muted">Due day: {b.dueDay} • {b.autopay ? "Autopay" : "Manual"}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontWeight: 900 }}>{money(b.amount)}</div>
                    <span className="pn-badge">{b.status === "late" ? "🚨 late" : b.status === "due" ? "⏰ due" : "✅ ok"}</span>
                  </div>
                </div>

                {b.website && (
                  <div style={{ marginTop: 10, display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
                    <a className="pn-btn" href={b.website} target="_blank" rel="noreferrer">Open payment site</a>
                    <span className="pn-small pn-muted">{b.website}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "expenses" && (
          <div className="pn-list">
            {props.data.expenses.map(e => (
              <div key={e.id} className="pn-item">
                <div className="pn-row">
                  <div>
                    <div style={{ fontWeight: 900 }}>{e.vendor}</div>
                    <div className="pn-small pn-muted">{e.date} • {e.category}</div>
                  </div>
                  <div style={{ fontWeight: 900 }}>{money(e.amount)}</div>
                </div>
                {e.website && (
                  <div style={{ marginTop: 10 }}>
                    <a className="pn-btn" href={e.website} target="_blank" rel="noreferrer">Open link</a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
