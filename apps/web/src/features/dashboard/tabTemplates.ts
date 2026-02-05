import type { DashboardConfigV1, DashboardTab, DashboardView, WidgetInstance } from "./types";

function rid(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2, 10)}`;
}

function now() {
  return Date.now();
}

function w(type: WidgetInstance["type"], title?: string, config: Record<string, unknown> = {}): WidgetInstance {
  const at = now();
  return {
    id: rid("w"),
    type,
    title,
    hidden: false,
    createdAt: at,
    updatedAt: at,
    config,
  };
}

function tab(name: string, widgets: WidgetInstance[]): DashboardTab {
  const at = now();
  return {
    id: rid("t"),
    name,
    widgets,
    hidden: false,
    createdAt: at,
    updatedAt: at,
  };
}

export function templateAtAGlance(view: DashboardView): DashboardConfigV1 {
  const t = tab("At a glance", [
    w("kpi.money.monthSpend", "Spend (30d)", { rangeDays: 30 }),
    w("kpi.money.monthIncome", "Income (30d)", { rangeDays: 30 }),
    w("kpi.documents.needsApproval", "Needs approval", {}),
    w("kpi.bills.dueCount", "Bills due", {}),
    w("calendar.summary", "Calendar", {}),
    w("list.captures.recent", "Recent captures", { limit: 6 }),
  ]);
  return {
    version: 1,
    view,
    global: { rangeDays: 30, categoryKeys: [], query: "" },
    selectedTabId: t.id,
    tabs: [t],
    auditLog: [
      {
        at: now(),
        actor: `local:${view}`,
        action: "create_tab",
        entityType: "tab",
        entityId: t.id,
        meta: { template: "at_a_glance" },
      },
    ],
  };
}

export const TAB_TEMPLATES: { id: string; label: string; description: string }[] = [
  { id: "at_a_glance", label: "At a glance", description: "KPIs + quick drilldowns across the app." },
];

