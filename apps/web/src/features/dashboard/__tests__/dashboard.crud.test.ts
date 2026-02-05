import { describe, expect, it } from "vitest";
import { createTabFromTemplate, defaultDashboard, renameTab, reorderTabs, addWidget, updateWidget, softDeleteWidget, restoreWidget, softDeleteTab, restoreTab, setGlobalFilters } from "../storage";
import { getWidgetDef, isWidgetAllowed } from "../widgetRegistry";

describe("dashboard config CRUD (local, feature-flag safe)", () => {
  it("can add a tab from template and rename it", () => {
    const base = defaultDashboard("personal");
    const next = createTabFromTemplate(base, { view: "personal", templateId: "at_a_glance" });
    expect(next.tabs.length).toBe(base.tabs.length + 1);
    const tabId = next.selectedTabId;
    const renamed = renameTab(next, { view: "personal", tabId, name: "My Tab" });
    expect(renamed.tabs.find((t) => t.id === tabId)?.name).toBe("My Tab");
  });

  it("can reorder tabs deterministically", () => {
    let cfg = defaultDashboard("personal");
    cfg = createTabFromTemplate(cfg, { view: "personal", templateId: "at_a_glance" });
    expect(cfg.tabs.length).toBeGreaterThanOrEqual(2);
    const a0 = cfg.tabs[0].id;
    const a1 = cfg.tabs[1].id;
    const moved = reorderTabs(cfg, { view: "personal", fromIdx: 0, toIdx: 1 });
    expect(moved.tabs[0].id).toBe(a1);
    expect(moved.tabs[1].id).toBe(a0);
  });

  it("can add/update/soft-delete/restore a widget (undoable)", () => {
    const base = defaultDashboard("personal");
    const tabId = base.selectedTabId;
    const added = addWidget(base, { view: "personal", tabId, type: "kpi.bills.dueCount", title: "Bills", config: {} });
    const w = added.tabs.find((t) => t.id === tabId)?.widgets.find((x) => x.title === "Bills");
    expect(w).toBeTruthy();
    const updated = updateWidget(added, { view: "personal", tabId, widgetId: String(w?.id), patch: { hidden: true } });
    const w2 = updated.tabs.find((t) => t.id === tabId)?.widgets.find((x) => x.id === w?.id);
    expect(w2?.hidden).toBe(true);
    const deleted = softDeleteWidget(updated, { view: "personal", tabId, widgetId: String(w?.id) });
    const w3 = deleted.tabs.find((t) => t.id === tabId)?.widgets.find((x) => x.id === w?.id);
    expect(Boolean(w3?.deletedAt)).toBe(true);
    const restored = restoreWidget(deleted, { view: "personal", tabId, widgetId: String(w?.id) });
    const w4 = restored.tabs.find((t) => t.id === tabId)?.widgets.find((x) => x.id === w?.id);
    expect(w4?.deletedAt).toBeUndefined();
  });

  it("permission gates are enforced by widget defs", () => {
    const def = getWidgetDef("kpi.bills.dueCount");
    const ok = isWidgetAllowed(def, { view: "personal", userTier: "Free", isAdmin: false, rangeDays: 30 });
    expect(ok.allowed).toBe(true);
  });

  it("can soft-delete and restore a tab (undoable)", () => {
    const base = defaultDashboard("business");
    const tabId = base.selectedTabId;
    const deleted = softDeleteTab(base, { view: "business", tabId });
    expect(deleted.tabs.find((t) => t.id === tabId)?.deletedAt).toBeTruthy();
    const restored = restoreTab(deleted, { view: "business", tabId });
    expect(restored.tabs.find((t) => t.id === tabId)?.deletedAt).toBeUndefined();
  });

  it("can update global filters (unified context)", () => {
    const base = defaultDashboard("personal");
    const next = setGlobalFilters(base, { view: "personal", patch: { rangeDays: 14, categoryKeys: ["bills"], query: "rent" } });
    expect(next.global?.rangeDays).toBe(14);
    expect(next.global?.categoryKeys).toEqual(["bills"]);
    expect(next.global?.query).toBe("rent");
  });
});

