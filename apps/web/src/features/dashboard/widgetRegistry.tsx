import React from "react";
import { z } from "zod";
import type { AppData } from "../../pn/data/model";
import type { DashboardContext, WidgetDef, WidgetInstance, WidgetSummaryProps, WidgetType } from "./types";
import { Button, Pill } from "../../pn/components/kit";

function money(n: number) {
  try {
    return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
  } catch {
    return `$${n.toFixed(2)}`;
  }
}

function isoFromTodayMinus(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function sumExpensesInRange(data: AppData, rangeDays: number, categoryKeys: string[]) {
  const minIso = isoFromTodayMinus(rangeDays);
  let total = 0;
  let count = 0;
  const scoped = categoryKeys.length ? new Set(categoryKeys) : null;
  for (const e of data.expenses) {
    if (!e?.date) continue;
    if (e.date < minIso) continue;
    if (scoped && !scoped.has(String(e.category || ""))) continue;
    total += Number(e.amount || 0);
    count += 1;
  }
  return { total, count };
}

function sumIncomeInRange(data: AppData, rangeDays: number, categoryKeys: string[]) {
  const minIso = isoFromTodayMinus(rangeDays);
  let total = 0;
  let count = 0;
  const scoped = categoryKeys.length ? new Set(categoryKeys) : null;
  for (const i of (data.income || [])) {
    if (!i?.date) continue;
    if (i.date < minIso) continue;
    if (scoped && !scoped.has(String(i.category || ""))) continue;
    total += Number(i.amount || 0);
    count += 1;
  }
  return { total, count };
}

function kpiShell(props: {
  icon: string;
  title: string;
  value: string;
  sub: string;
  right?: React.ReactNode;
  onClick?: () => void;
  customize: boolean;
  actions?: React.ReactNode;
}) {
  return (
    <div className="pn-item" style={{ background: "rgba(255,255,255,.03)" }}>
      <div className="pn-row" style={{ alignItems: "flex-start", gap: 12 }}>
        <div style={{ fontSize: 22, lineHeight: 1 }}>{props.icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
            <div style={{ fontWeight: 950 }}>{props.title}</div>
            {props.right}
          </div>
          <div style={{ fontSize: 22, fontWeight: 950, marginTop: 6 }}>{props.value}</div>
          <div className="pn-small pn-muted" style={{ marginTop: 4 }}>{props.sub}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10, alignItems: "center" }}>
            <Button variant="ghost" onClick={props.onClick} title="View details">
              View details
            </Button>
            {props.customize && props.actions}
          </div>
        </div>
      </div>
    </div>
  );
}

function widgetActions(p: WidgetSummaryProps) {
  return (
    <>
      <Button
        variant="ghost"
        onClick={p.onToggleHidden}
        title={p.inst.hidden ? "Show widget" : "Hide widget"}
      >
        {p.inst.hidden ? "Show" : "Hide"}
      </Button>
      <Button
        variant="ghost"
        onClick={p.onSoftDelete}
        title="Delete (soft delete; can restore)"
      >
        Delete
      </Button>
    </>
  );
}

const RangeDaysSchema = z.object({ rangeDays: z.number().int().min(1).max(365).default(30) }).passthrough();
const LimitSchema = z.object({ limit: z.number().int().min(1).max(50).default(6) }).passthrough();

function getRangeDays(inst: WidgetInstance, fallback: number): number | undefined {
  const raw = RangeDaysSchema.safeParse(inst.config || {});
  return raw.success ? raw.data.rangeDays : fallback;
}

function getLimit(inst: WidgetInstance, fallback: number) {
  const raw = LimitSchema.safeParse(inst.config || {});
  return raw.success ? raw.data.limit : fallback;
}

function rangeSelector(props: WidgetSummaryProps, current: number, useGlobal: boolean) {
  return (
    <label className="pn-small pn-muted" style={{ display: "flex", alignItems: "center", gap: 8 }}>
      Range
      <select
        className="pn-input"
        value={String(current)}
        onChange={(e) => props.onUpdate({ config: { ...(props.inst.config || {}), rangeDays: Number(e.target.value) } })}
        aria-label="Widget date range"
        title="Widget date range"
        style={{ padding: "6px 8px", borderRadius: 10, fontWeight: 900 }}
      >
        {[7, 14, 30, 60, 90].map((d) => <option key={d} value={d}>{d}d</option>)}
      </select>
      <Button
        variant="ghost"
        onClick={() => {
          const next = { ...(props.inst.config || {}) };
          // Use global range by removing override.
          delete (next as Record<string, unknown>).rangeDays;
          props.onUpdate({ config: next });
        }}
        disabled={useGlobal}
        title="Use global range"
      >
        Global
      </Button>
    </label>
  );
}

function norm(s: unknown) {
  return String(s || "").toLowerCase();
}

function includesQuery(hay: string, q: string) {
  if (!q.trim()) return true;
  return hay.includes(q.trim().toLowerCase());
}

export const WIDGET_REGISTRY: Record<WidgetType, WidgetDef> = {
  "kpi.money.monthSpend": {
    type: "kpi.money.monthSpend",
    label: "Spend (range)",
    description: "Sum of expenses in the selected date range.",
    icon: "💳",
    defaultConfig: { rangeDays: 30 },
    drilldown: () => ({ kind: "route", moduleKey: "finances" }),
    Summary: (p) => {
      const override = (p.inst.config || {}) as Record<string, unknown>;
      const useGlobal = typeof override.rangeDays !== "number";
      const rangeDays = useGlobal ? p.ctx.rangeDays : (getRangeDays(p.inst, p.ctx.rangeDays) || p.ctx.rangeDays);
      const r = sumExpensesInRange(p.data, rangeDays, p.ctx.categoryKeys);
      return kpiShell({
        icon: "💳",
        title: p.inst.title || `Spend (${rangeDays}d)`,
        value: money(r.total),
        sub: `${r.count} expenses in last ${rangeDays} days`,
        right: <Pill>{rangeDays}d</Pill>,
        onClick: () => p.onDrilldown({ kind: "route", moduleKey: "finances" }),
        customize: p.customize,
        actions: (
          <>
            {rangeSelector(p, rangeDays, useGlobal)}
            {widgetActions(p)}
          </>
        ),
      });
    },
  },

  "kpi.money.monthIncome": {
    type: "kpi.money.monthIncome",
    label: "Income (range)",
    description: "Sum of income rows in the selected date range.",
    icon: "💰",
    defaultConfig: { rangeDays: 30 },
    drilldown: () => ({ kind: "route", moduleKey: "finances" }),
    Summary: (p) => {
      const override = (p.inst.config || {}) as Record<string, unknown>;
      const useGlobal = typeof override.rangeDays !== "number";
      const rangeDays = useGlobal ? p.ctx.rangeDays : (getRangeDays(p.inst, p.ctx.rangeDays) || p.ctx.rangeDays);
      const r = sumIncomeInRange(p.data, rangeDays, p.ctx.categoryKeys);
      return kpiShell({
        icon: "💰",
        title: p.inst.title || `Income (${rangeDays}d)`,
        value: money(r.total),
        sub: `${r.count} income rows in last ${rangeDays} days`,
        right: <Pill>{rangeDays}d</Pill>,
        onClick: () => p.onDrilldown({ kind: "route", moduleKey: "finances" }),
        customize: p.customize,
        actions: (
          <>
            {rangeSelector(p, rangeDays, useGlobal)}
            {widgetActions(p)}
          </>
        ),
      });
    },
  },

  "kpi.documents.needsApproval": {
    type: "kpi.documents.needsApproval",
    label: "Documents needing approval",
    description: "Count of captures missing an approved category.",
    icon: "📄",
    defaultConfig: {},
    drilldown: () => ({ kind: "route", moduleKey: "documents" }),
    Summary: (p) => {
      const scoped = p.ctx.categoryKeys.length ? new Set(p.ctx.categoryKeys) : null;
      const q = norm(p.ctx.query);
      const needsApproval = p.data.library.filter((i) => {
        if (i.approvedCategory) return false;
        if (scoped) {
          const anySuggested = (i.suggested || []).some((s) => scoped.has(String(s.category || "")));
          if (!anySuggested) return false;
        }
        if (q && !includesQuery(norm(i.title) + " " + norm(i.text), q)) return false;
        return true;
      }).length;
      return kpiShell({
        icon: "📄",
        title: p.inst.title || "Needs approval",
        value: String(needsApproval),
        sub: "Items waiting for category approval",
        onClick: () => p.onDrilldown({ kind: "route", moduleKey: "documents" }),
        customize: p.customize,
        actions: widgetActions(p),
      });
    },
  },

  "kpi.bills.dueCount": {
    type: "kpi.bills.dueCount",
    label: "Bills due/late",
    description: "Count of bills with status due or late.",
    icon: "🧾",
    defaultConfig: {},
    drilldown: () => ({ kind: "route", moduleKey: "finances" }),
    Summary: (p) => {
      const dueBills = p.data.bills.filter((b) => b.status === "due" || b.status === "late").length;
      return kpiShell({
        icon: "🧾",
        title: p.inst.title || "Bills due",
        value: String(dueBills),
        sub: "Bills needing attention",
        onClick: () => p.onDrilldown({ kind: "route", moduleKey: "finances" }),
        customize: p.customize,
        actions: widgetActions(p),
      });
    },
  },

  "calendar.summary": {
    type: "calendar.summary",
    label: "Calendar summary",
    description: "Quick link to your unified calendar.",
    icon: "📅",
    defaultConfig: {},
    drilldown: () => ({ kind: "route", moduleKey: "calendar" }),
    Summary: (p) => {
      // Simple rollup (Phase 1): count items in the current month.
      const y = new Date().toISOString().slice(0, 7);
      const expenseCount = p.data.expenses.filter((e) => e.date.startsWith(y)).length;
      const incomeCount = (p.data.income || []).filter((i) => i.date.startsWith(y)).length;
      const captureCount = p.data.library.filter((c) => new Date(c.createdAt).toISOString().slice(0, 7) === y).length;
      const legalNoteCount = p.data.legal.threads.reduce((acc, t) => acc + t.notes.filter((n) => new Date(n.createdAt).toISOString().slice(0, 7) === y).length, 0);
      const total = expenseCount + incomeCount + captureCount + legalNoteCount;
      const title = p.inst.title || "Calendar";
      const sub = `This month: ${expenseCount} expenses • ${incomeCount} income • ${captureCount} captures • ${legalNoteCount} legal notes`;
      return (
        <div className="pn-item" style={{ background: "rgba(255,255,255,.03)" }}>
          <div className="pn-row" style={{ alignItems: "flex-start", gap: 12 }}>
            <div style={{ fontSize: 22, lineHeight: 1 }}>📅</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
                <div style={{ fontWeight: 950 }}>{title}</div>
                <Pill>{y}</Pill>
              </div>
              <div style={{ fontSize: 22, fontWeight: 950, marginTop: 6 }}>{String(total)}</div>
              <div className="pn-small pn-muted" style={{ marginTop: 4 }}>{sub}</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10, alignItems: "center" }}>
                <Button
                  variant="ghost"
                  onClick={() => p.onDrilldown({ kind: "route", moduleKey: "calendar" })}
                  title="Open calendar"
                >
                  View details
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => p.onDrilldown({
                    kind: "modal",
                    title: "Calendar (unified timeline)",
                    message: "Bills, expenses/income, captures, and legal notes all roll into one calendar. Use filters on the Dashboard to scope what you see.",
                    primary: { label: "Open Calendar", moduleKey: "calendar" },
                  })}
                  title="Quick explanation"
                >
                  Quick info
                </Button>
                {p.customize && widgetActions(p)}
              </div>
            </div>
          </div>
        </div>
      );
    },
  },

  "list.captures.recent": {
    type: "list.captures.recent",
    label: "Recent captures",
    description: "Shows your most recent capture items.",
    icon: "📸",
    defaultConfig: { limit: 6 },
    drilldown: () => ({ kind: "route", moduleKey: "documents" }),
    Summary: (p) => {
      const limit = getLimit(p.inst, 6);
      const scoped = p.ctx.categoryKeys.length ? new Set(p.ctx.categoryKeys) : null;
      const q = norm(p.ctx.query);
      const items = [...p.data.library]
        .filter((i) => {
          if (scoped) {
            const approved = i.approvedCategory ? scoped.has(String(i.approvedCategory)) : false;
            const suggested = (i.suggested || []).some((s) => scoped.has(String(s.category || "")));
            if (!approved && !suggested) return false;
          }
          if (q && !includesQuery(norm(i.title) + " " + norm(i.text) + " " + norm(i.approvedCategory), q)) return false;
          return true;
        })
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, limit);
      return (
        <div className="pn-item" style={{ background: "rgba(255,255,255,.03)" }}>
          <div className="pn-row" style={{ alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 22 }}>📸</div>
            <div style={{ fontWeight: 950, flex: 1, minWidth: 0 }}>{p.inst.title || "Recent captures"}</div>
            <Pill>{items.length}</Pill>
          </div>
          <div style={{ marginTop: 10 }}>
            {items.map((i) => (
              <div key={i.id} className="pn-small pn-muted" style={{ padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
                <span style={{ fontWeight: 900, color: "rgba(238,242,255,.84)" }}>{i.title}</span>{" "}
                <span>• {new Date(i.createdAt).toLocaleDateString()}</span>{" "}
                <span>• {i.approvedCategory ? `✅ ${i.approvedCategory}` : "⏳ needs approval"}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10, alignItems: "center" }}>
            <Button variant="ghost" onClick={() => p.onDrilldown({ kind: "route", moduleKey: "documents" })} title="View details">
              View details
            </Button>
            {p.customize && (
              <>
                <label className="pn-small pn-muted" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  Limit
                  <select
                    className="pn-input"
                    value={String(limit)}
                    onChange={(e) => p.onUpdate({ config: { ...(p.inst.config || {}), limit: Number(e.target.value) } })}
                    aria-label="Widget list limit"
                    title="Widget list limit"
                    style={{ padding: "6px 8px", borderRadius: 10, fontWeight: 900 }}
                  >
                    {[3, 5, 6, 8, 10, 12].map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </label>
                {widgetActions(p)}
              </>
            )}
          </div>
        </div>
      );
    },
  },
};

export function getWidgetDef(t: WidgetType): WidgetDef {
  return WIDGET_REGISTRY[t];
}

export function isWidgetAllowed(def: WidgetDef, ctx: DashboardContext): { allowed: boolean; reason?: string } {
  if (def.requiresAdmin && !ctx.isAdmin) return { allowed: false, reason: "Admin required" };
  const order: Record<string, number> = { Free: 0, Plus: 1, Pro: 2 };
  if (def.minTier && order[ctx.userTier] < order[def.minTier]) return { allowed: false, reason: `Unlock in ${def.minTier}` };
  return { allowed: true };
}

