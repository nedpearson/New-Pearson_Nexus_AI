import React, { useMemo, useState } from "react";
import type { AppData } from "../data/model";
import { Card, Button, Pill } from "../components/kit";

type ReportKind =
  | "overview"
  | "profit_loss"
  | "spending_vendor"
  | "category_month"
  | "ledger"
  | "captures"
  | "money"
  | "exports";

type ReportPreset = {
  id: string;
  name: string;
  createdAt: number;
  kind: ReportKind;
  filters: {
    start: string;
    end: string;
    captureKind: string;
    captureCategory: string;
    expenseCategory: string;
    incomeCategory: string;
    ledgerTypes: string[];
  };
};

type IncomeRow = NonNullable<AppData["income"]>[number];
type ExpenseRow = AppData["expenses"][number];
type CatMonthRow = ({ type: "expense" } & ExpenseRow) | ({ type: "income" } & IncomeRow);

function presetsKey(view: "personal" | "business") {
  return `pnx.reportPresets.v1.${view}`;
}

function readPresets(view: "personal" | "business"): ReportPreset[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(presetsKey(view));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as ReportPreset[]) : [];
  } catch {
    return [];
  }
}

function rid(prefix: string) {
  return prefix + "_" + Math.random().toString(16).slice(2, 10);
}

function monthKey(iso: string) {
  return iso.slice(0, 7);
}

function money(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function Modal(props: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,.55)", display: "grid", placeItems: "center", padding: 14 }}
      onClick={props.onClose}
    >
      <div className="pn-card pn-p" style={{ maxWidth: 980, width: "100%" }} onClick={(e) => e.stopPropagation()}>
        <div className="pn-row" style={{ marginBottom: 10 }}>
          <div style={{ fontWeight: 900 }}>{props.title}</div>
          <Button onClick={props.onClose} title="Close">Close</Button>
        </div>
        {props.children}
      </div>
    </div>
  );
}

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

export function ReportsModule(props: { data: AppData; view?: "personal" | "business" }) {
  const view: "personal" | "business" = props.view || "personal";
  const [kind, setKind] = useState<ReportKind>("overview");
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
  const [incomeCategory, setIncomeCategory] = useState<string>("any");
  const [ledgerTypes, setLedgerTypes] = useState<string[]>(["captures", "expenses", "income"]);

  const [presetName, setPresetName] = useState("");
  const [presetsByView, setPresetsByView] = useState<Record<"personal" | "business", ReportPreset[]>>(() => ({
    personal: readPresets("personal"),
    business: readPresets("business"),
  }));
  const presets = presetsByView[view] || [];

  function savePresets(next: ReportPreset[]) {
    setPresetsByView((prev) => ({ ...prev, [view]: next }));
    try { localStorage.setItem(presetsKey(view), JSON.stringify(next)); } catch { /* ignore */ }
  }

  const categoryIndex = useMemo(() => {
    const keyByNorm = new Map<string, string>();
    const labelByKey = new Map<string, string>();
    for (const c of props.data.categories) {
      const k = String(c.key || "");
      const l = String(c.label || "");
      if (k) keyByNorm.set(k.toLowerCase(), k);
      if (l) keyByNorm.set(l.toLowerCase(), k);
      if (k) labelByKey.set(k, l || k);
    }
    const toKey = (v: string | undefined) => {
      const s = String(v || "").trim();
      if (!s) return "";
      return keyByNorm.get(s.toLowerCase()) || s;
    };
    const toLabel = (v: string | undefined) => {
      const k = toKey(v);
      return labelByKey.get(k) || String(v || k || "");
    };
    return { toKey, toLabel, labelByKey };
  }, [props.data.categories]);

  const captureCategoryOptions = useMemo(() => {
    return [{ key: "any", label: "Any category" }, ...props.data.categories.map((c) => ({ key: c.key, label: c.label }))];
  }, [props.data.categories]);

  const expenseCategoryOptions = useMemo(() => {
    const fromData = new Set<string>();
    for (const e of props.data.expenses) {
      const k = categoryIndex.toKey(e.category);
      if (k) fromData.add(k);
    }
    // Prefer configured categories, but include any unknown keys seen in data.
    const known = props.data.categories.map((c) => c.key);
    const extras = Array.from(fromData).filter((k) => !known.includes(k)).sort((a, b) => a.localeCompare(b));
    return ["any", ...known, ...extras];
  }, [props.data.expenses, props.data.categories, categoryIndex]);

  const incomeCategoryOptions = useMemo(() => {
    const fromData = new Set<string>();
    for (const i of (props.data.income || [])) {
      const k = categoryIndex.toKey(i.category);
      if (k) fromData.add(k);
    }
    const known = props.data.categories.map((c) => c.key);
    const extras = Array.from(fromData).filter((k) => !known.includes(k)).sort((a, b) => a.localeCompare(b));
    return ["any", ...known, ...extras];
  }, [props.data.income, props.data.categories, categoryIndex]);

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
      if (expenseCategory !== "any" && categoryIndex.toKey(e.category) !== expenseCategory) return false;
      return true;
    });
  }, [props.data.expenses, start, end, expenseCategory, categoryIndex]);

  const filteredIncome = useMemo(() => {
    return (props.data.income || []).filter((i) => {
      if (!inIsoRange(i.date, start || undefined, end || undefined)) return false;
      if (incomeCategory !== "any" && categoryIndex.toKey(i.category) !== incomeCategory) return false;
      return true;
    });
  }, [props.data.income, start, end, incomeCategory, categoryIndex]);

  const expenseTotal = useMemo(() => filteredExpenses.reduce((a, e) => a + e.amount, 0), [filteredExpenses]);
  const incomeTotal = useMemo(() => filteredIncome.reduce((a, i) => a + i.amount, 0), [filteredIncome]);
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

  const [drillOpen, setDrillOpen] = useState(false);
  const [drillTitle, setDrillTitle] = useState("");
  const [drillBody, setDrillBody] = useState<React.ReactNode>(null);

  function openDrill(title: string, body: React.ReactNode) {
    setDrillTitle(title);
    setDrillBody(body);
    setDrillOpen(true);
  }

  return (
    <div className="pn-col">
      <Card title="Reports" subtitle="Global reporting with filters + drill-downs." right={<Pill>{kind}</Pill>}>
        <div style={{ display:"flex", gap:8, marginBottom: 10, flexWrap:"wrap", alignItems:"center" }}>
          <select className="pn-select" value={kind} onChange={(e)=>setKind(e.target.value as ReportKind)} aria-label="Report type" title="Report type" style={{ maxWidth: 280 }}>
            <option value="overview">Overview</option>
            <option value="profit_loss">Profit & Loss</option>
            <option value="spending_vendor">Spending by vendor</option>
            <option value="category_month">Category totals by month</option>
            <option value="ledger">Ledger</option>
            <option value="captures">Captures</option>
            <option value="money">Money</option>
            <option value="exports">Exports</option>
          </select>
          <Button onClick={() => setKind("overview")} variant={kind === "overview" ? "primary" : "ghost"}>Overview</Button>
          <Button onClick={() => setKind("profit_loss")} variant={kind === "profit_loss" ? "primary" : "ghost"}>P&L</Button>
          <Button onClick={() => setKind("ledger")} variant={kind === "ledger" ? "primary" : "ghost"}>Ledger</Button>
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
                  <option key={c} value={c}>{c === "any" ? "Any category" : (categoryIndex.toLabel(c) || c)}</option>
                ))}
              </select>
            </div>

            <div style={{ display:"flex", gap: 10, flexWrap:"wrap", alignItems:"center" }}>
              <div className="pn-small pn-muted" style={{ minWidth: 64 }}>Income</div>
              <select className="pn-select" value={incomeCategory} onChange={(e)=>setIncomeCategory(e.target.value)} aria-label="Income category" title="Income category">
                {incomeCategoryOptions.map((c) => (
                  <option key={c} value={c}>{c === "any" ? "Any category" : (categoryIndex.toLabel(c) || c)}</option>
                ))}
              </select>
            </div>

            <div style={{ display:"flex", gap: 10, flexWrap:"wrap", alignItems:"center" }}>
              <div className="pn-small pn-muted" style={{ minWidth: 64 }}>Presets</div>
              <input className="pn-input" value={presetName} onChange={(e)=>setPresetName(e.target.value)} placeholder="Preset name..." style={{ maxWidth: 220 }} />
              <Button
                onClick={() => {
                  const name = presetName.trim();
                  if (!name) return;
                  const p: ReportPreset = {
                    id: rid("rp"),
                    name,
                    createdAt: Date.now(),
                    kind,
                    filters: { start, end, captureKind, captureCategory, expenseCategory, incomeCategory, ledgerTypes },
                  };
                  savePresets([p, ...presets].slice(0, 25));
                  setPresetName("");
                }}
                variant="primary"
                title="Save current report + filters"
              >
                Save
              </Button>
              {presets.length > 0 && (
                <select
                  className="pn-select"
                  value=""
                  onChange={(e) => {
                    const id = e.target.value;
                    const p = presets.find((x) => x.id === id);
                    if (!p) return;
                    setKind(p.kind);
                    setStart(p.filters.start);
                    setEnd(p.filters.end);
                    setCaptureKind(p.filters.captureKind);
                    setCaptureCategory(p.filters.captureCategory);
                    setExpenseCategory(p.filters.expenseCategory);
                    setIncomeCategory(p.filters.incomeCategory);
                    setLedgerTypes(p.filters.ledgerTypes || ["captures","expenses","income"]);
                    e.currentTarget.value = "";
                  }}
                  aria-label="Load preset"
                  title="Load preset"
                  style={{ maxWidth: 260 }}
                >
                  <option value="">Load preset…</option>
                  {presets.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {kind === "overview" && (
          <>
            <div className="pn-layout" style={{ gridTemplateColumns: "repeat(4, minmax(0,1fr))", marginTop: 12 }}>
              <Card title="Captures" subtitle="Filtered range">
                <div className="pn-kpiNum">{filteredCaptures.length}</div>
                <div className="pn-small pn-muted">items</div>
              </Card>
              <Card title="Income" subtitle="Filtered range">
                <div className="pn-kpiNum">{money(incomeTotal)}</div>
                <div className="pn-small pn-muted">{filteredIncome.length} rows</div>
              </Card>
              <Card title="Expenses" subtitle="Filtered range">
                <div className="pn-kpiNum">{money(expenseTotal)}</div>
                <div className="pn-small pn-muted">{filteredExpenses.length} rows</div>
              </Card>
              <Card title="Bills due/late" subtitle="All bills (no bill dates yet)">
                <div className="pn-kpiNum">{dueBills.length}</div>
                <div className="pn-small pn-muted">due or late</div>
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
                    onClick={() => { setCaptureCategory(c.key); setKind("captures"); }}
                    title={`Filter to ${c.label}`}
                  >
                    {c.label} <span className="pn-muted">({c.count})</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {kind === "profit_loss" && (
          <div className="pn-layout" style={{ gridTemplateColumns: "repeat(3, minmax(0,1fr))", marginTop: 12 }}>
            <Card title="Income" subtitle="Filtered range">
              <div className="pn-kpiNum">{money(incomeTotal)}</div>
              <div className="pn-small pn-muted">{filteredIncome.length} rows</div>
              <div style={{ marginTop: 10 }}>
                <Button variant="primary" onClick={() => openDrill("Income transactions", (
                  <div className="pn-list">
                    {filteredIncome.map((i) => (
                      <div key={i.id} className="pn-item" style={{ background:"rgba(0,0,0,.12)" }}>
                        <div className="pn-row">
                          <div>
                            <div style={{ fontWeight: 900 }}>{i.source}</div>
                            <div className="pn-small pn-muted">{i.date} • {categoryIndex.toLabel(i.category)}</div>
                          </div>
                          <div style={{ fontWeight: 900 }}>{money(i.amount)}</div>
                        </div>
                        {i.notes && <div className="pn-small pn-muted" style={{ marginTop: 6 }}>{i.notes}</div>}
                      </div>
                    ))}
                    {filteredIncome.length === 0 && <div className="pn-small pn-muted">No income rows match filters.</div>}
                  </div>
                ))}>Drill down</Button>
              </div>
            </Card>
            <Card title="Expenses" subtitle="Filtered range">
              <div className="pn-kpiNum">{money(expenseTotal)}</div>
              <div className="pn-small pn-muted">{filteredExpenses.length} rows</div>
              <div style={{ marginTop: 10 }}>
                <Button variant="primary" onClick={() => openDrill("Expense transactions", (
                  <div className="pn-list">
                    {filteredExpenses.map((e) => (
                      <div key={e.id} className="pn-item" style={{ background:"rgba(0,0,0,.12)" }}>
                        <div className="pn-row">
                          <div>
                            <div style={{ fontWeight: 900 }}>{e.vendor}</div>
                            <div className="pn-small pn-muted">{e.date} • {categoryIndex.toLabel(e.category)}</div>
                          </div>
                          <div style={{ fontWeight: 900 }}>{money(e.amount)}</div>
                        </div>
                      </div>
                    ))}
                    {filteredExpenses.length === 0 && <div className="pn-small pn-muted">No expense rows match filters.</div>}
                  </div>
                ))}>Drill down</Button>
              </div>
            </Card>
            <Card title="Net" subtitle="Income − Expenses">
              <div className="pn-kpiNum">{money(incomeTotal - expenseTotal)}</div>
              <div className="pn-small pn-muted">filtered range</div>
            </Card>
          </div>
        )}

        {kind === "spending_vendor" && (
          <div className="pn-list" style={{ marginTop: 12 }}>
            {(() => {
              const by = new Map<string, { vendor: string; total: number; rows: typeof filteredExpenses }>();
              for (const e of filteredExpenses) {
                const k = e.vendor || "Unknown";
                const cur = by.get(k) || { vendor: k, total: 0, rows: [] as typeof filteredExpenses };
                cur.total += e.amount;
                cur.rows.push(e);
                by.set(k, cur);
              }
              const rows = Array.from(by.values()).sort((a, b) => b.total - a.total);
              return rows.map((r) => (
                <button
                  key={r.vendor}
                  className="pn-navBtn"
                  type="button"
                  onClick={() => openDrill(`Vendor: ${r.vendor}`, (
                    <div className="pn-list">
                      {r.rows.map((e) => (
                        <div key={e.id} className="pn-item" style={{ background:"rgba(0,0,0,.12)" }}>
                          <div className="pn-row">
                            <div>
                              <div style={{ fontWeight: 900 }}>{e.vendor}</div>
                              <div className="pn-small pn-muted">{e.date} • {categoryIndex.toLabel(e.category)}</div>
                            </div>
                            <div style={{ fontWeight: 900 }}>{money(e.amount)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                  title="Click to drill down"
                >
                  <div className="pn-row">
                    <div>
                      <div style={{ fontWeight: 900 }}>{r.vendor}</div>
                      <div className="pn-small pn-muted">{r.rows.length} transactions</div>
                    </div>
                    <div style={{ fontWeight: 900 }}>{money(r.total)}</div>
                  </div>
                </button>
              ));
            })()}
            {filteredExpenses.length === 0 && <div className="pn-small pn-muted">No expenses match your filters.</div>}
          </div>
        )}

        {kind === "category_month" && (
          <div className="pn-list" style={{ marginTop: 12 }}>
            {(() => {
              const map = new Map<string, { month: string; category: string; total: number; rows: CatMonthRow[] }>();
              const add = (month: string, category: string, amount: number, row: CatMonthRow) => {
                const k = `${month}::${category}`;
                const cur = map.get(k) || { month, category, total: 0, rows: [] as CatMonthRow[] };
                cur.total += amount;
                cur.rows.push(row);
                map.set(k, cur);
              };
              for (const e of filteredExpenses) {
                const cat = categoryIndex.toKey(e.category) || e.category || "Uncategorized";
                add(monthKey(e.date), cat, e.amount, { type: "expense", ...e });
              }
              for (const i of filteredIncome) {
                const cat = categoryIndex.toKey(i.category) || i.category || "Uncategorized";
                add(monthKey(i.date), cat, i.amount, { type: "income", ...i });
              }
              const rows = Array.from(map.values()).sort((a, b) => (a.month === b.month ? b.total - a.total : (a.month < b.month ? 1 : -1)));
              let lastMonth = "";
              return rows.map((r) => {
                const header = r.month !== lastMonth;
                lastMonth = r.month;
                return (
                  <div key={`${r.month}:${r.category}`}>
                    {header && <div className="pn-small pn-muted" style={{ marginTop: 14, fontWeight: 850 }}>{r.month}</div>}
                    <button
                      className="pn-navBtn"
                      type="button"
                      onClick={() => openDrill(`${r.month} • ${categoryIndex.toLabel(r.category)}`, (
                        <div className="pn-list">
                          {r.rows.map((x) => (
                            <div key={x.id} className="pn-item" style={{ background:"rgba(0,0,0,.12)" }}>
                              <div className="pn-row">
                                <div>
                                  <div style={{ fontWeight: 900 }}>{x.type === "expense" ? x.vendor : x.source}</div>
                                  <div className="pn-small pn-muted">{x.date} • {x.type}</div>
                                </div>
                                <div style={{ fontWeight: 900 }}>{money(x.amount)}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                      title="Click to drill down"
                    >
                      <div className="pn-row">
                        <div>
                          <div style={{ fontWeight: 900 }}>{categoryIndex.toLabel(r.category)}</div>
                          <div className="pn-small pn-muted">{r.rows.length} rows</div>
                        </div>
                        <div style={{ fontWeight: 900 }}>{money(r.total)}</div>
                      </div>
                    </button>
                  </div>
                );
              });
            })()}
          </div>
        )}

        {kind === "ledger" && (
          <div className="pn-item" style={{ marginTop: 12 }}>
            <div className="pn-small pn-muted" style={{ fontWeight: 850, marginBottom: 8 }}>Ledger types</div>
            <div style={{ display:"flex", gap: 10, flexWrap:"wrap" }}>
              {(["captures","expenses","income"] as const).map((t) => (
                <label key={t} className="pn-pill" style={{ cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={ledgerTypes.includes(t)}
                    onChange={(e) => {
                      const next = new Set(ledgerTypes);
                      if (e.target.checked) next.add(t); else next.delete(t);
                      setLedgerTypes(Array.from(next));
                    }}
                    style={{ marginRight: 8 }}
                  />
                  {t}
                </label>
              ))}
            </div>
            <div className="pn-list" style={{ marginTop: 12 }}>
              {(() => {
                const rows: { id: string; date: string; label: string; type: string; amount?: number; meta?: string }[] = [];
                if (ledgerTypes.includes("captures")) {
                  for (const c of filteredCaptures) {
                    rows.push({ id: c.id, date: isoDay(c.createdAt), label: c.title, type: `capture:${c.kind}`, meta: c.approvedCategory || c.suggested?.[0]?.category || "inbox" });
                  }
                }
                if (ledgerTypes.includes("expenses")) {
                  for (const e of filteredExpenses) {
                    rows.push({ id: e.id, date: e.date, label: e.vendor, type: "expense", amount: e.amount, meta: categoryIndex.toLabel(e.category) });
                  }
                }
                if (ledgerTypes.includes("income")) {
                  for (const i of filteredIncome) {
                    rows.push({ id: i.id, date: i.date, label: i.source, type: "income", amount: i.amount, meta: categoryIndex.toLabel(i.category) });
                  }
                }
                rows.sort((a, b) => (a.date === b.date ? a.id.localeCompare(b.id) : (a.date < b.date ? 1 : -1)));
                return rows.map((r) => (
                  <div key={`${r.type}:${r.id}`} className="pn-item" style={{ background:"rgba(0,0,0,.12)" }}>
                    <div className="pn-row">
                      <div>
                        <div style={{ fontWeight: 900 }}>{r.label}</div>
                        <div className="pn-small pn-muted">{r.date} • {r.type}{r.meta ? ` • ${r.meta}` : ""}</div>
                      </div>
                      {typeof r.amount === "number" && <div style={{ fontWeight: 900 }}>{money(r.amount)}</div>}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        )}

        {kind === "captures" && (
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

        {kind === "money" && (
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
                        <div className="pn-small pn-muted">{e.date} • {categoryIndex.toLabel(e.category)}</div>
                      </div>
                      <div style={{ fontWeight: 900 }}>{money(e.amount)}</div>
                    </div>
                  </div>
                ))}
                {filteredExpenses.length > 12 && <div className="pn-small pn-muted">Showing 12 of {filteredExpenses.length}. Refine filters to narrow.</div>}
                {filteredExpenses.length === 0 && <div className="pn-small pn-muted">No expenses match your filters.</div>}
              </div>
            </Card>

            <Card title="Bills (all)" subtitle="Bills don’t currently store dates (QuickBooks-like billing dates can be added next).">
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

        {kind === "exports" && (
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
                      filters: { captureKind, captureCategory, expenseCategory, incomeCategory, ledgerTypes },
                      captures: filteredCaptures,
                      expenses: filteredExpenses,
                      income: filteredIncome,
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

      {drillOpen && (
        <Modal title={drillTitle} onClose={() => setDrillOpen(false)}>
          {drillBody}
        </Modal>
      )}
    </div>
  );
}

