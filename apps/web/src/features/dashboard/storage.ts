import type { DashboardConfigV1, DashboardTab, DashboardView, WidgetInstance, WidgetType } from "./types";
import { DashboardConfigV1Schema } from "./schema";
import { TAB_TEMPLATES, templateAtAGlance } from "./tabTemplates";

export type StorageLike = {
  getItem: (k: string) => string | null;
  setItem: (k: string, v: string) => void;
  removeItem: (k: string) => void;
};

function key(view: DashboardView) {
  return `pnx.dashboard.v1.${view}`;
}

function actor(view: DashboardView) {
  return `local:${view}`;
}

function now() {
  return Date.now();
}

function rid(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2, 10)}`;
}

function clampAudit(log: DashboardConfigV1["auditLog"]) {
  // Keep audit bounded in localStorage.
  return log.slice(-120);
}

function withGlobals(view: DashboardView, cfg: DashboardConfigV1): DashboardConfigV1 {
  // Phase 2 migration: ensure cfg.global exists.
  const g = cfg.global || {};
  return {
    ...cfg,
    view,
    global: {
      rangeDays: typeof g.rangeDays === "number" ? g.rangeDays : 30,
      categoryKeys: Array.isArray(g.categoryKeys) ? g.categoryKeys.filter((x) => typeof x === "string" && x) : [],
      query: typeof g.query === "string" ? g.query : "",
    },
  };
}

export function defaultDashboard(view: DashboardView): DashboardConfigV1 {
  return templateAtAGlance(view);
}

export function loadDashboard(view: DashboardView, storage?: StorageLike): DashboardConfigV1 {
  if (!storage) {
    if (typeof window === "undefined") return defaultDashboard(view);
    storage = window.localStorage;
  }
  try {
    const raw = storage.getItem(key(view));
    if (!raw) return defaultDashboard(view);
    const parsed = JSON.parse(raw) as unknown;
    const v = DashboardConfigV1Schema.safeParse(parsed);
    if (!v.success) return defaultDashboard(view);
    // Guardrail: view mismatch -> fall back.
    if (v.data.view !== view) return defaultDashboard(view);
    // Guardrail: selectedTab must exist and not be deleted.
    const alive = v.data.tabs.find((t) => !t.deletedAt);
    const selected = v.data.tabs.find((t) => t.id === v.data.selectedTabId && !t.deletedAt);
    const base = withGlobals(view, v.data as DashboardConfigV1);
    if (!selected && alive) return { ...base, selectedTabId: alive.id };
    return base;
  } catch {
    return defaultDashboard(view);
  }
}

export function saveDashboard(view: DashboardView, cfg: DashboardConfigV1, storage?: StorageLike) {
  if (!storage) {
    if (typeof window === "undefined") return;
    storage = window.localStorage;
  }
  storage.setItem(key(view), JSON.stringify(cfg));
}

export function listTemplates() {
  return TAB_TEMPLATES;
}

export function createTabFromTemplate(cfg: DashboardConfigV1, args: { view: DashboardView; templateId: string }): DashboardConfigV1 {
  const at = now();
  const tId = rid("t");
  const widgetId = (type: WidgetType, title?: string, config: Record<string, unknown> = {}): WidgetInstance => ({
    id: rid("w"),
    type,
    title,
    config,
    hidden: false,
    createdAt: at,
    updatedAt: at,
    updatedBy: actor(args.view),
  });

  const widgets =
    args.templateId === "at_a_glance"
      ? [
        widgetId("kpi.money.monthSpend", "Spend (30d)", { rangeDays: 30 }),
        widgetId("kpi.money.monthIncome", "Income (30d)", { rangeDays: 30 }),
        widgetId("kpi.documents.needsApproval", "Needs approval", {}),
        widgetId("kpi.bills.dueCount", "Bills due", {}),
        widgetId("calendar.summary", "Calendar", {}),
        widgetId("list.captures.recent", "Recent captures", { limit: 6 }),
      ]
      : [
        widgetId("kpi.documents.needsApproval", "Needs approval", {}),
        widgetId("list.captures.recent", "Recent captures", { limit: 6 }),
      ];

  const tab: DashboardTab = {
    id: tId,
    name: args.templateId === "at_a_glance" ? "At a glance" : "New tab",
    widgets,
    createdAt: at,
    updatedAt: at,
    updatedBy: actor(args.view),
  };

  const next: DashboardConfigV1 = {
    ...withGlobals(args.view, cfg),
    tabs: [...cfg.tabs, tab],
    selectedTabId: tab.id,
    auditLog: clampAudit([
      ...(cfg.auditLog || []),
      { at, actor: actor(args.view), action: "create_tab", entityType: "tab", entityId: tab.id, meta: { templateId: args.templateId } },
      { at, actor: actor(args.view), action: "select_tab", entityType: "config", entityId: cfg.view, meta: { tabId: tab.id } },
    ]),
  };
  return next;
}

export function setGlobalFilters(cfg: DashboardConfigV1, args: {
  view: DashboardView;
  patch: { rangeDays?: number; categoryKeys?: string[]; query?: string };
}): DashboardConfigV1 {
  const at = now();
  const base = withGlobals(args.view, cfg);
  const prev = base.global || {};
  const nextGlobal = {
    ...prev,
    ...args.patch,
  };
  return {
    ...base,
    global: nextGlobal,
    auditLog: clampAudit([
      ...(base.auditLog || []),
      { at, actor: actor(args.view), action: "update_global_filters", entityType: "config", entityId: base.view, meta: { patch: args.patch } },
    ]),
  };
}

export function renameTab(cfg: DashboardConfigV1, args: { view: DashboardView; tabId: string; name: string }): DashboardConfigV1 {
  const at = now();
  const nextTabs = cfg.tabs.map((t) => t.id === args.tabId ? { ...t, name: args.name, updatedAt: at, updatedBy: actor(args.view) } : t);
  return {
    ...withGlobals(args.view, cfg),
    tabs: nextTabs,
    auditLog: clampAudit([...(cfg.auditLog || []), { at, actor: actor(args.view), action: "rename_tab", entityType: "tab", entityId: args.tabId }]),
  };
}

export function selectTab(cfg: DashboardConfigV1, args: { view: DashboardView; tabId: string }): DashboardConfigV1 {
  const at = now();
  return {
    ...withGlobals(args.view, cfg),
    selectedTabId: args.tabId,
    auditLog: clampAudit([...(cfg.auditLog || []), { at, actor: actor(args.view), action: "select_tab", entityType: "config", entityId: cfg.view, meta: { tabId: args.tabId } }]),
  };
}

export function reorderTabs(cfg: DashboardConfigV1, args: { view: DashboardView; fromIdx: number; toIdx: number }): DashboardConfigV1 {
  const at = now();
  const tabs = [...cfg.tabs];
  const [x] = tabs.splice(args.fromIdx, 1);
  tabs.splice(args.toIdx, 0, x);
  return {
    ...withGlobals(args.view, cfg),
    tabs,
    auditLog: clampAudit([...(cfg.auditLog || []), { at, actor: actor(args.view), action: "reorder_tabs", entityType: "config", entityId: cfg.view, meta: { from: args.fromIdx, to: args.toIdx } }]),
  };
}

export function softDeleteTab(cfg: DashboardConfigV1, args: { view: DashboardView; tabId: string }): DashboardConfigV1 {
  const at = now();
  const nextTabs = cfg.tabs.map((t) => t.id === args.tabId ? { ...t, deletedAt: at, deletedBy: actor(args.view), updatedAt: at, updatedBy: actor(args.view) } : t);
  const alive = nextTabs.find((t) => !t.deletedAt);
  const selected = cfg.selectedTabId === args.tabId ? (alive?.id || cfg.selectedTabId) : cfg.selectedTabId;
  return {
    ...withGlobals(args.view, cfg),
    tabs: nextTabs,
    selectedTabId: selected,
    auditLog: clampAudit([...(cfg.auditLog || []), { at, actor: actor(args.view), action: "soft_delete_tab", entityType: "tab", entityId: args.tabId }]),
  };
}

export function restoreTab(cfg: DashboardConfigV1, args: { view: DashboardView; tabId: string }): DashboardConfigV1 {
  const at = now();
  const nextTabs = cfg.tabs.map((t) => t.id === args.tabId ? { ...t, deletedAt: undefined, deletedBy: undefined, updatedAt: at, updatedBy: actor(args.view) } : t);
  return {
    ...withGlobals(args.view, cfg),
    tabs: nextTabs,
    auditLog: clampAudit([...(cfg.auditLog || []), { at, actor: actor(args.view), action: "restore_tab", entityType: "tab", entityId: args.tabId }]),
  };
}

export function addWidget(cfg: DashboardConfigV1, args: { view: DashboardView; tabId: string; type: WidgetType; title?: string; config?: Record<string, unknown> }): DashboardConfigV1 {
  const at = now();
  const w: WidgetInstance = {
    id: rid("w"),
    type: args.type,
    title: args.title,
    config: args.config || {},
    hidden: false,
    createdAt: at,
    updatedAt: at,
    updatedBy: actor(args.view),
  };
  const nextTabs = cfg.tabs.map((t) => t.id === args.tabId ? { ...t, widgets: [...t.widgets, w], updatedAt: at, updatedBy: actor(args.view) } : t);
  return {
    ...withGlobals(args.view, cfg),
    tabs: nextTabs,
    auditLog: clampAudit([...(cfg.auditLog || []), { at, actor: actor(args.view), action: "create_widget", entityType: "widget", entityId: w.id, meta: { tabId: args.tabId, type: args.type } }]),
  };
}

export function updateWidget(cfg: DashboardConfigV1, args: { view: DashboardView; tabId: string; widgetId: string; patch: Partial<WidgetInstance> }): DashboardConfigV1 {
  const at = now();
  const nextTabs = cfg.tabs.map((t) => {
    if (t.id !== args.tabId) return t;
    return {
      ...t,
      widgets: t.widgets.map((w) => w.id === args.widgetId ? { ...w, ...args.patch, updatedAt: at, updatedBy: actor(args.view) } : w),
      updatedAt: at,
      updatedBy: actor(args.view),
    };
  });
  return {
    ...withGlobals(args.view, cfg),
    tabs: nextTabs,
    auditLog: clampAudit([...(cfg.auditLog || []), { at, actor: actor(args.view), action: "update_widget", entityType: "widget", entityId: args.widgetId }]),
  };
}

export function reorderWidgets(cfg: DashboardConfigV1, args: { view: DashboardView; tabId: string; fromIdx: number; toIdx: number }): DashboardConfigV1 {
  const at = now();
  const nextTabs = cfg.tabs.map((t) => {
    if (t.id !== args.tabId) return t;
    const ws = [...t.widgets];
    const [x] = ws.splice(args.fromIdx, 1);
    ws.splice(args.toIdx, 0, x);
    return { ...t, widgets: ws, updatedAt: at, updatedBy: actor(args.view) };
  });
  return {
    ...withGlobals(args.view, cfg),
    tabs: nextTabs,
    auditLog: clampAudit([...(cfg.auditLog || []), { at, actor: actor(args.view), action: "reorder_widgets", entityType: "tab", entityId: args.tabId, meta: { from: args.fromIdx, to: args.toIdx } }]),
  };
}

export function softDeleteWidget(cfg: DashboardConfigV1, args: { view: DashboardView; tabId: string; widgetId: string }): DashboardConfigV1 {
  const at = now();
  const next = updateWidget(cfg, {
    view: args.view,
    tabId: args.tabId,
    widgetId: args.widgetId,
    patch: { deletedAt: at, deletedBy: actor(args.view) },
  });
  return {
    ...next,
    auditLog: clampAudit([...(next.auditLog || []), { at, actor: actor(args.view), action: "soft_delete_widget", entityType: "widget", entityId: args.widgetId, meta: { tabId: args.tabId } }]),
  };
}

export function restoreWidget(cfg: DashboardConfigV1, args: { view: DashboardView; tabId: string; widgetId: string }): DashboardConfigV1 {
  const at = now();
  const next = updateWidget(cfg, { view: args.view, tabId: args.tabId, widgetId: args.widgetId, patch: { deletedAt: undefined, deletedBy: undefined } });
  return {
    ...next,
    auditLog: clampAudit([...(next.auditLog || []), { at, actor: actor(args.view), action: "restore_widget", entityType: "widget", entityId: args.widgetId, meta: { tabId: args.tabId } }]),
  };
}

export function toggleWidgetHidden(cfg: DashboardConfigV1, args: { view: DashboardView; tabId: string; widgetId: string }): DashboardConfigV1 {
  const at = now();
  let nextHidden = false;
  const nextTabs = cfg.tabs.map((t) => {
    if (t.id !== args.tabId) return t;
    return {
      ...t,
      widgets: (t.widgets || []).map((w) => {
        if (w.id !== args.widgetId) return w;
        nextHidden = !(w.hidden === true);
        return { ...w, hidden: nextHidden, updatedAt: at, updatedBy: actor(args.view) };
      }),
      updatedAt: at,
      updatedBy: actor(args.view),
    };
  });

  return {
    ...withGlobals(args.view, cfg),
    tabs: nextTabs,
    auditLog: clampAudit([
      ...(cfg.auditLog || []),
      { at, actor: actor(args.view), action: nextHidden ? "hide_widget" : "show_widget", entityType: "widget", entityId: args.widgetId, meta: { tabId: args.tabId } },
    ]),
  };
}

