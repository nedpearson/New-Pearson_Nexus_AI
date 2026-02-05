import React, { useMemo, useState } from "react";
import type { AppData } from "../data/model";
import { Card, Button, Pill } from "../components/kit";

function isoDay(ts: number) {
  try {
    return new Date(ts).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

function inIsoRange(iso: string, start?: string, end?: string) {
  if (!iso) return false;
  if (start && iso < start) return false;
  if (end && iso > end) return false;
  return true;
}

export function ReportsModule(props: { data: AppData }) {
  const [tab, setTab] = useState<"overview"|"captures"|"money"|"exports">("overview");
  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const defaultStart = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  }, []);

  const [start, setStart] = useState<string>(defaultStart);
  const [end, setEnd] = useState<string>(todayIso);
  const [captureKind, setCaptureKind] = useState<string>("any");
  const [captureCategory, setCaptureCategory] = useState<string>("any");
  const [expenseCategory, setExpenseCategory] = useState<string>("any");

  const captureCategoryOptions = useMemo(() => {
    const byKey = new Map(props.data.categories.map((c) => [c.key, c.label] as const));
    return [{ key: "any", label: "Any category" }, ...props.data.categories.map((c) => ({ key: c.key, label: byKey.get(c.key) || c.label }))];
  }, [props.data.categories]);

  const expenseCategoryOptions = useMemo(() => {
    const set = new Set<string>();
    for (const e of props.data.expenses) set.add(e.category);
    const list = Array.from(set).sort((a, b) => a.localeCompare(b));
    return ["any", ...list];
  }, [props.data.expenses]);

  const filteredCaptures = useMemo(() => {
    return props.data.library.filter((i) => {
      const day = isoDay(i.createdAt);
      if (!inIsoRange(day, start || undefined, end || undefined)) return false;
      if (captureKind !== "any" && i.kind !== captureKind) return false;
      const cat = i.approvedCategory || i.suggested?.[0]?.category || "inbox";
      if (captureCategory !== "any" && cat !== captureCategory) return false;
      return true;
    });
  }, [props.data.library, start, end, captureKind, captureCategory]);

  const filteredExpenses = useMemo(() => {
    return props.data.expenses.filter((e) => {
      if (!inIsoRange(e.date, start || undefined, end || undefined)) return false;
      if (expenseCategory !== "any" && e.category !== expenseCategory) return false;
      return true;
    });
  }, [props.data.expenses, start, end, expenseCategory]);

  const expenseTotal = useMemo(() => filteredExpenses.reduce((a, e) => a + e.amount, 0), [filteredExpenses]);
  const dueBills = useMemo(() => props.data.bills.filter(b => b.status === "due" || b.status === "late"), [props.data.bills]);

  const topCaptureCategories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const i of filteredCaptures) {
      const cat = i.approvedCategory || i.suggested?.[0]?.category || "inbox";
      counts.set(cat, (counts.get(cat) || 0) + 1);
    }
    const labelByKey = new Map(props.data.categories.map((c) => [c.key, c.label] as const));
    return Array.from(counts.entries())
      .map(([key, count]) => ({ key, label: labelByKey.get(key) || key, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [filteredCaptures, props.data.categories]);

  function money(n: number) {
    return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
  }

  return (
    <div className="pn-col">
      <Card title="Reports" subtitle="Global reporting across captures + money (prototype)." right={<Pill>{tab}</Pill>}>
        <div style={{ display:"flex", gap:8, marginBottom: 10, flexWrap:"wrap", alignItems:"center" }}>
          <Button onClick={() => setTab("overview")} variant={tab === "overview" ? "primary" : "ghost"}>Overview</Button>
          <Button onClick={() => setTab("captures")} variant={tab === "captures" ? "primary" : "ghost"}>Captures</Button>
          <Button onClick={() => setTab("money")} variant={tab === "money" ? "primary" : "ghost"}>Money</Button>
          <Button onClick={() => setTab("exports")} variant={tab === "exports" ? "primary" : "ghost"}>Exports</Button>
        </div>

        <div className="pn-item" style={{ background: "rgba(0,0,0,.12)" }}>
          <div className="pn-small pn-muted" style={{ marginBottom: 8, fontWeight: 850 }}>Filters</div>
          <div style={{ display:"grid", gap: 10 }}>
            <div style={{ display:"flex", gap: 10, flexWrap:"wrap", alignItems:"center" }}>
              <div className="pn-small pn-muted" style={{ minWidth: 64 }}>Dates</div>
              <input className="pn-input" type="date" value={start} onChange={(e)=>setStart(e.target.value)} aria-label="Start date" title="Start date" style={{ maxWidth: 170 }} />
              <span className="pn-small pn-muted">to</span>
              <input className="pn-input" type="date" value={end} onChange={(e)=>setEnd(e.target.value)} aria-label="End date" title="End date" style={{ maxWidth: 170 }} />
              <Button onClick={() => { setStart(defaultStart); setEnd(todayIso); }} title="Reset date range">Reset</Button>
            </div>

            <div style={{ display:"flex", gap: 10, flexWrap:"wrap", alignItems:"center" }}>
              <div className="pn-small pn-muted" style={{ minWidth: 64 }}>Capture</div>
              <select className="pn-select" value={captureKind} onChange={(e)=>setCaptureKind(e.target.value)} aria-label="Capture kind" title="Capture kind">
                <option value="any">Any type</option>
                <option value="photo">Photo</option>
                <option value="video">Video</option>
                <option value="voice">Voice</option>
                <option value="note">Note</option>
              </select>
              <select className="pn-select" value={captureCategory} onChange={(e)=>setCaptureCategory(e.target.value)} aria-label="Capture category" title="Capture category">
                {captureCategoryOptions.map((c) => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
            </div>

            <div style={{ display:"flex", gap: 10, flexWrap:"wrap", alignItems:"center" }}>
              <div className="pn-small pn-muted" style={{ minWidth: 64 }}>Expenses</div>
              <select className="pn-select" value={expenseCategory} onChange={(e)=>setExpenseCategory(e.target.value)} aria-label="Expense category" title="Expense category">
                {expenseCategoryOptions.map((c) => (
                  <option key={c} value={c}>{c === "any" ? "Any category" : c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {tab === "overview" && (
          <>
            <div className="pn-layout" style={{ gridTemplateColumns: "repeat(4, minmax(0,1fr))", marginTop: 12 }}>
              <Card title="Captures" subtitle="Filtered range">
                <div className="pn-kpiNum">{filteredCaptures.length}</div>
                <div className="pn-small pn-muted">items</div>
              </Card>
              <Card title="Expenses" subtitle="Filtered range">
                <div className="pn-kpiNum">{money(expenseTotal)}</div>
                <div className="pn-small pn-muted">{filteredExpenses.length} rows</div>
              </Card>
              <Card title="Bills due/late" subtitle="All bills (no date field)">
                <div className="pn-kpiNum">{dueBills.length}</div>
                <div className="pn-small pn-muted">due or late</div>
              </Card>
              <Card title="Legal threads" subtitle="All threads">
                <div className="pn-kpiNum">{props.data.legal.threads.length}</div>
                <div className="pn-small pn-muted">threads</div>
              </Card>
            </div>

            <div className="pn-item" style={{ marginTop: 12 }}>
              <div className="pn-small pn-muted" style={{ fontWeight: 850 }}>Top capture categories</div>
              <div style={{ display:"flex", gap: 8, flexWrap:"wrap", marginTop: 10 }}>
                {topCaptureCategories.length === 0 ? (
                  <span className="pn-small pn-muted">No captures in range.</span>
                ) : topCaptureCategories.map((c) => (
                  <button
                    key={c.key}
                    className="pn-btn"
                    type="button"
                    onClick={() => { setCaptureCategory(c.key); setTab("captures"); }}
                    title={`Filter to ${c.label}`}
                  >
                    {c.label} <span className="pn-muted">({c.count})</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {tab === "captures" && (
          <div className="pn-list" style={{ marginTop: 12 }}>
            {filteredCaptures.map((i) => {
              const cat = i.approvedCategory || i.suggested?.[0]?.category || "inbox";
              const day = isoDay(i.createdAt);
              return (
                <div key={i.id} className="pn-item">
                  <div className="pn-row">
                    <div>
                      <div style={{ fontWeight: 900 }}>{i.title}</div>
                      <div className="pn-small pn-muted">{day} • {i.kind} • {cat}</div>
                    </div>
                    <span className="pn-badge">{i.approvedCategory ? "✅ approved" : "⏳ needs approval"}</span>
                  </div>
                  {i.text && <div style={{ marginTop: 8, color: "rgba(238,242,255,.78)" }}>{i.text}</div>}
                </div>
              );
            })}
            {filteredCaptures.length === 0 && <div className="pn-small pn-muted">No captures match your filters.</div>}
          </div>
        )}

        {tab === "money" && (
          <div className="pn-layout" style={{ gridTemplateColumns: "repeat(2, minmax(0,1fr))", marginTop: 12 }}>
            <Card title="Expenses (filtered)" subtitle="By date + category filters.">
              <div className="pn-kpiNum">{money(expenseTotal)}</div>
              <div className="pn-small pn-muted">{filteredExpenses.length} entries</div>
              <div className="pn-list" style={{ marginTop: 10 }}>
                {filteredExpenses.slice(0, 12).map((e) => (
                  <div key={e.id} className="pn-item" style={{ background:"rgba(0,0,0,.12)" }}>
                    <div className="pn-row">
                      <div>
                        <div style={{ fontWeight: 900 }}>{e.vendor}</div>
                        <div className="pn-small pn-muted">{e.date} • {e.category}</div>
                      </div>
                      <div style={{ fontWeight: 900 }}>{money(e.amount)}</div>
                    </div>
                  </div>
                ))}
                {filteredExpenses.length > 12 && <div className="pn-small pn-muted">Showing 12 of {filteredExpenses.length}. Refine filters to narrow.</div>}
                {filteredExpenses.length === 0 && <div className="pn-small pn-muted">No expenses match your filters.</div>}
              </div>
            </Card>

            <Card title="Bills (all)" subtitle="Bills don’t currently store dates, so they aren’t date-filtered.">
              <div className="pn-kpiNum">{props.data.bills.length}</div>
              <div className="pn-small pn-muted">{dueBills.length} due/late</div>
              <div className="pn-list" style={{ marginTop: 10 }}>
                {props.data.bills.slice(0, 10).map((b) => (
                  <div key={b.id} className="pn-item" style={{ background:"rgba(0,0,0,.12)" }}>
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
                  </div>
                ))}
                {props.data.bills.length > 10 && <div className="pn-small pn-muted">Showing 10 of {props.data.bills.length}.</div>}
              </div>
            </Card>
          </div>
        )}

        {tab === "exports" && (
          <div className="pn-list" style={{ marginTop: 12 }}>
            <div className="pn-item">
              <div style={{ fontWeight: 900 }}>Export filtered report (JSON)</div>
              <div className="pn-small pn-muted">Exports just the filtered views shown in this report.</div>
              <div style={{ marginTop: 10, display:"flex", gap: 8, flexWrap:"wrap" }}>
                <Button
                  variant="primary"
                  onClick={() => {
                    const payload = {
                      range: { start, end },
                      filters: { captureKind, captureCategory, expenseCategory },
                      captures: filteredCaptures,
                      expenses: filteredExpenses,
                      bills: props.data.bills,
                      legal: props.data.legal,
                    };
                    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "pnx-report-export.json";
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

