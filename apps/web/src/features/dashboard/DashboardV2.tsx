import React, { useEffect, useMemo, useRef, useState } from "react";
import type { AppData } from "../../pn/data/model";
import type { ModuleKey, Tier } from "../../pn/types";
import { Button, Card, Pill } from "../../pn/components/kit";
import type { DashboardConfigV1, DashboardContext, DashboardView, DrilldownModal, DrilldownTarget, WidgetType } from "./types";
import { getWidgetDef, isWidgetAllowed, WIDGET_REGISTRY } from "./widgetRegistry";
import {
  addWidget,
  createTabFromTemplate,
  listTemplates,
  loadDashboard,
  reorderTabs,
  reorderWidgets,
  renameTab,
  restoreTab,
  restoreWidget,
  saveDashboard,
  selectTab,
  setGlobalFilters,
  softDeleteTab,
  softDeleteWidget,
  toggleWidgetHidden,
  updateWidget,
} from "./storage";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function DashboardV2(props: {
  view: DashboardView;
  data: AppData;
  go: (k: ModuleKey) => void;
  userTier: Tier;
  isAdmin: boolean;
}) {
  const [cfg, setCfg] = useState<DashboardConfigV1>(() => loadDashboard(props.view));
  const [customize, setCustomize] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [addTabOpen, setAddTabOpen] = useState(false);
  const [addWidgetOpen, setAddWidgetOpen] = useState(false);
  const [modal, setModal] = useState<DrilldownModal | null>(null);

  const dragTabFrom = useRef<number>(-1);
  const dragWidgetFrom = useRef<number>(-1);

  // Persist changes.
  useEffect(() => {
    saveDashboard(props.view, cfg);
  }, [props.view, cfg]);

  const global = useMemo(() => ({
    rangeDays: cfg.global?.rangeDays ?? 30,
    categoryKeys: Array.isArray(cfg.global?.categoryKeys) ? (cfg.global?.categoryKeys || []) : [],
    query: cfg.global?.query ?? "",
  }), [cfg.global?.rangeDays, cfg.global?.categoryKeys, cfg.global?.query]);

  const ctx = useMemo((): DashboardContext => ({
    view: props.view,
    userTier: props.userTier,
    isAdmin: props.isAdmin,
    rangeDays: global.rangeDays,
    categoryKeys: global.categoryKeys,
    query: global.query,
  }), [props.view, props.userTier, props.isAdmin, global.rangeDays, global.categoryKeys, global.query]);

  const aliveTabs = useMemo(() => cfg.tabs.filter((t) => !t.deletedAt), [cfg.tabs]);
  const deletedTabs = useMemo(() => cfg.tabs.filter((t) => Boolean(t.deletedAt)), [cfg.tabs]);

  const selectedTab = useMemo(() => {
    const found = cfg.tabs.find((t) => t.id === cfg.selectedTabId && !t.deletedAt);
    return found || aliveTabs[0];
  }, [cfg.tabs, cfg.selectedTabId, aliveTabs]);

  const deletedWidgets = useMemo(() => {
    const out: { tabId: string; tabName: string; widgetId: string; title: string; type: WidgetType; deletedAt: number }[] = [];
    for (const t of cfg.tabs) {
      for (const w of (t.widgets || [])) {
        if (!w.deletedAt) continue;
        out.push({
          tabId: t.id,
          tabName: t.name,
          widgetId: w.id,
          title: w.title || getWidgetDef(w.type).label,
          type: w.type,
          deletedAt: w.deletedAt,
        });
      }
    }
    out.sort((a, b) => b.deletedAt - a.deletedAt);
    return out;
  }, [cfg.tabs]);

  function handleDrilldown(t: DrilldownTarget) {
    if (t.kind === "route") {
      props.go(t.moduleKey);
      return;
    }
    setModal(t);
  }

  function onDragTabStart(idx: number) {
    dragTabFrom.current = idx;
  }
  function onDropTab(toIdx: number) {
    const fromIdx = dragTabFrom.current;
    dragTabFrom.current = -1;
    if (fromIdx < 0 || fromIdx === toIdx) return;
    setCfg((prev) => reorderTabs(prev, { view: props.view, fromIdx, toIdx }));
  }

  function onDragWidgetStart(idx: number) {
    dragWidgetFrom.current = idx;
  }
  function onDropWidget(toIdx: number) {
    const fromIdx = dragWidgetFrom.current;
    dragWidgetFrom.current = -1;
    if (!selectedTab) return;
    if (fromIdx < 0 || fromIdx === toIdx) return;
    setCfg((prev) => reorderWidgets(prev, { view: props.view, tabId: selectedTab.id, fromIdx, toIdx }));
  }

  function updateTabName(tabId: string, name: string) {
    setCfg((prev) => renameTab(prev, { view: props.view, tabId, name }));
  }

  function setSelectedTab(tabId: string) {
    setCfg((prev) => selectTab(prev, { view: props.view, tabId }));
  }

  function addTab(templateId: string) {
    setCfg((prev) => createTabFromTemplate(prev, { view: props.view, templateId }));
    setAddTabOpen(false);
  }

  function addNewWidget(type: WidgetType) {
    if (!selectedTab) return;
    const def = getWidgetDef(type);
    setCfg((prev) => addWidget(prev, { view: props.view, tabId: selectedTab.id, type, title: def.label, config: def.defaultConfig }));
  }

  function formatWhen(ts: number) {
    try { return new Date(ts).toLocaleString(); } catch { return ""; }
  }

  const visibleWidgets = useMemo(() => {
    if (!selectedTab) return [];
    return (selectedTab.widgets || []).filter((w) => !w.deletedAt);
  }, [selectedTab]);

  return (
    <div className="pn-col">
      <Card
        title="Dashboard"
        subtitle="Everything at a glance — drill down into full views."
        right={<Pill>{props.view === "business" ? "Business" : "Personal"}</Pill>}
      >
        <div className="pn-row" style={{ marginBottom: 10, gap: 10, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <Button variant={customize ? "primary" : "ghost"} onClick={() => setCustomize((v) => !v)} title="Customize tabs + widgets">
              {customize ? "Customize: ON" : "Customize"}
            </Button>
            <Button
              variant={filtersOpen ? "primary" : "ghost"}
              onClick={() => setFiltersOpen((v) => !v)}
              title="Global filters"
            >
              Filters
            </Button>
            <label className="pn-small pn-muted" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              Range
              <select
                className="pn-input"
                value={String(global.rangeDays)}
                onChange={(e) => setCfg((prev) => setGlobalFilters(prev, { view: props.view, patch: { rangeDays: clamp(Number(e.target.value || 30), 1, 365) } }))}
                aria-label="Global date range"
                title="Global date range"
                style={{ padding: "6px 8px", borderRadius: 10, fontWeight: 900 }}
              >
                {[7, 14, 30, 60, 90].map((d) => <option key={d} value={d}>{d}d</option>)}
              </select>
            </label>
            <input
              className="pn-input"
              value={global.query}
              onChange={(e) => setCfg((prev) => setGlobalFilters(prev, { view: props.view, patch: { query: e.target.value } }))}
              placeholder="Search (titles, notes)…"
              aria-label="Global search"
              title="Global search"
              style={{ minWidth: 220 }}
            />
            {!!global.categoryKeys.length && <Pill>{global.categoryKeys.length} categories</Pill>}
          </div>

          <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Button onClick={() => setAddTabOpen((v) => !v)} title="Add a new tab from a template">Add Tab</Button>
            <Button onClick={() => setAddWidgetOpen((v) => !v)} title="Add a widget to this tab" disabled={!selectedTab}>Add Widget</Button>
          </div>
        </div>

        {filtersOpen && (
          <div className="pn-item" style={{ background: "rgba(0,0,0,.14)", marginBottom: 12 }}>
            <div className="pn-row" style={{ alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 260px" }}>
                <div style={{ fontWeight: 950 }}>Category scope</div>
                <div className="pn-small pn-muted">Empty selection means “All categories”.</div>
                <div className="pn-list" style={{ marginTop: 10 }}>
                  {props.data.categories.map((c) => {
                    const checked = global.categoryKeys.includes(c.key);
                    return (
                      <label key={c.key} className="pn-item" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: "rgba(255,255,255,.03)" }}>
                        <div style={{ fontWeight: 900 }}>{c.label}</div>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? Array.from(new Set([...global.categoryKeys, c.key]))
                              : global.categoryKeys.filter((k) => k !== c.key);
                            setCfg((prev) => setGlobalFilters(prev, { view: props.view, patch: { categoryKeys: next } }));
                          }}
                          aria-label={`Filter category ${c.label}`}
                          title={`Filter category ${c.label}`}
                          style={{ width: 18, height: 18 }}
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Button
                  onClick={() => setCfg((prev) => setGlobalFilters(prev, { view: props.view, patch: { categoryKeys: [] } }))}
                  disabled={!global.categoryKeys.length}
                  title="Clear category filters"
                >
                  Clear categories
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => { setCfg((prev) => setGlobalFilters(prev, { view: props.view, patch: { query: "" } })); }}
                  disabled={!global.query}
                  title="Clear search"
                >
                  Clear search
                </Button>
                <Button variant="ghost" onClick={() => setFiltersOpen(false)} title="Close filters">Close</Button>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {aliveTabs.map((t, idx) => {
            const active = selectedTab?.id === t.id;
            const disabled = Boolean(t.hidden);
            return (
              <div
                key={t.id}
                draggable={customize}
                onDragStart={() => onDragTabStart(idx)}
                onDragOver={(e) => customize && e.preventDefault()}
                onDrop={() => customize && onDropTab(idx)}
                style={{ opacity: disabled ? 0.55 : 1 }}
              >
                <button
                  type="button"
                  className={["pn-btn", active ? "pn-btnPrimary" : ""].join(" ")}
                  onClick={() => !disabled && setSelectedTab(t.id)}
                  disabled={disabled}
                  title={disabled ? "Tab hidden (unhide in Customize)" : t.name}
                  style={{ display: "flex", gap: 8, alignItems: "center" }}
                >
                  <span style={{ fontWeight: 950 }}>{t.name}</span>
                  {customize && <span className="pn-badge">drag</span>}
                </button>
              </div>
            );
          })}
        </div>

        {customize && selectedTab && (
          <div className="pn-item" style={{ marginTop: 12, background: "rgba(0,0,0,.14)" }}>
            <div className="pn-row" style={{ gap: 10, flexWrap: "wrap" }}>
              <label style={{ flex: "1 1 240px" }}>
                <div className="pn-small pn-muted" style={{ fontWeight: 900, marginBottom: 6 }}>Tab name</div>
                <input
                  className="pn-input"
                  value={selectedTab.name}
                  onChange={(e) => updateTabName(selectedTab.id, e.target.value)}
                  aria-label="Tab name"
                  title="Tab name"
                />
              </label>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap" }}>
                <Button
                  onClick={() => setCfg((prev) => softDeleteTab(prev, { view: props.view, tabId: selectedTab.id }))}
                  title="Delete tab (soft delete; can restore)"
                  disabled={aliveTabs.length <= 1}
                >
                  Delete Tab
                </Button>
              </div>
            </div>
            <div className="pn-small pn-muted" style={{ marginTop: 8 }}>
              Tip: drag tabs to reorder. Deleted tabs/widgets can be restored in Recycle Bin below.
            </div>
          </div>
        )}

        {addTabOpen && (
          <div className="pn-item" style={{ marginTop: 12, background: "rgba(0,0,0,.14)" }}>
            <div style={{ fontWeight: 950 }}>Add tab</div>
            <div className="pn-small pn-muted" style={{ marginTop: 6 }}>Choose a starter template.</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
              {listTemplates().map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className="pn-navBtn pn-navBtnActive"
                  onClick={() => addTab(t.id)}
                  title={t.description}
                  style={{ background: "rgba(255,255,255,.05)", minWidth: 220 }}
                >
                  <div style={{ fontWeight: 950 }}>{t.label}</div>
                  <div className="pn-small pn-muted">{t.description}</div>
                </button>
              ))}
              <Button variant="ghost" onClick={() => setAddTabOpen(false)}>Close</Button>
            </div>
          </div>
        )}

        {addWidgetOpen && selectedTab && (
          <div className="pn-item" style={{ marginTop: 12, background: "rgba(0,0,0,.14)" }}>
            <div className="pn-row">
              <div>
                <div style={{ fontWeight: 950 }}>Add widget</div>
                <div className="pn-small pn-muted">Adds to “{selectedTab.name}”.</div>
              </div>
              <Button variant="ghost" onClick={() => setAddWidgetOpen(false)}>Close</Button>
            </div>
            <div className="pn-list" style={{ marginTop: 10 }}>
              {Object.values(WIDGET_REGISTRY).map((def) => {
                const allowed = isWidgetAllowed(def, ctx);
                return (
                  <div key={def.type} className="pn-item" style={{ background: "rgba(255,255,255,.03)" }}>
                    <div className="pn-row" style={{ gap: 10 }}>
                      <div style={{ fontSize: 20 }}>{def.icon}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 950 }}>{def.label}</div>
                        <div className="pn-small pn-muted">{def.description}</div>
                      </div>
                      <Button
                        variant="primary"
                        onClick={() => addNewWidget(def.type)}
                        disabled={!allowed.allowed}
                        title={allowed.allowed ? "Add widget" : (allowed.reason || "Not allowed")}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {/* Widgets */}
      {selectedTab && (
        <div className="pn-card pn-p" style={{ marginTop: 14 }}>
          <div className="pn-row" style={{ marginBottom: 10 }}>
            <div style={{ fontWeight: 950 }}>{selectedTab.name}</div>
            <Pill>{visibleWidgets.length} widgets</Pill>
          </div>

          <div className="pn-list">
            {visibleWidgets
              .filter((w) => !w.hidden)
              .map((inst, idx) => {
                const def = getWidgetDef(inst.type);
                const allowed = isWidgetAllowed(def, ctx);
                const baseTitle = inst.title || def.label;

                return (
                  <div
                    key={inst.id}
                    draggable={customize}
                    onDragStart={() => customize && onDragWidgetStart(idx)}
                    onDragOver={(e) => customize && e.preventDefault()}
                    onDrop={() => customize && onDropWidget(idx)}
                    style={{ opacity: allowed.allowed ? 1 : 0.55 }}
                    title={customize ? "Drag to reorder" : undefined}
                  >
                    {!allowed.allowed ? (
                      <div className="pn-item" style={{ background: "rgba(255,255,255,.03)" }}>
                        <div className="pn-row">
                          <div>
                            <div style={{ fontWeight: 950 }}>{def.icon} {baseTitle}</div>
                            <div className="pn-small pn-muted">{allowed.reason || "Locked"}</div>
                          </div>
                          {customize && (
                            <Button
                              variant="ghost"
                              onClick={() => setCfg((prev) => toggleWidgetHidden(prev, { view: props.view, tabId: selectedTab.id, widgetId: inst.id }))}
                              title={inst.hidden ? "Show widget" : "Hide widget"}
                            >
                              {inst.hidden ? "Show" : "Hide"}
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <def.Summary
                        data={props.data}
                        ctx={ctx}
                        inst={inst}
                        customize={customize}
                        onDrilldown={handleDrilldown}
                        onUpdate={(patch) => setCfg((prev) => updateWidget(prev, { view: props.view, tabId: selectedTab.id, widgetId: inst.id, patch }))}
                        onSoftDelete={() => setCfg((prev) => softDeleteWidget(prev, { view: props.view, tabId: selectedTab.id, widgetId: inst.id }))}
                        onToggleHidden={() => setCfg((prev) => toggleWidgetHidden(prev, { view: props.view, tabId: selectedTab.id, widgetId: inst.id }))}
                      />
                    )}
                  </div>
                );
              })}
          </div>

          {customize && visibleWidgets.some((w) => w.hidden) && (
            <div className="pn-item" style={{ marginTop: 12, background: "rgba(0,0,0,.14)" }}>
              <div style={{ fontWeight: 950 }}>Hidden widgets</div>
              <div className="pn-small pn-muted">These are hidden (not deleted). You can show them again.</div>
              <div className="pn-list" style={{ marginTop: 10 }}>
                {visibleWidgets.filter((w) => w.hidden).map((w) => {
                  const def = getWidgetDef(w.type);
                  return (
                    <div key={w.id} className="pn-item" style={{ background: "rgba(255,255,255,.03)" }}>
                      <div className="pn-row">
                        <div style={{ fontWeight: 950 }}>{def.icon} {w.title || def.label}</div>
                        <Button
                          variant="primary"
                          onClick={() => setCfg((prev) => toggleWidgetHidden(prev, { view: props.view, tabId: selectedTab.id, widgetId: w.id }))}
                          title="Show widget"
                        >
                          Show
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recycle bin */}
      {customize && (
        <div className="pn-card pn-p" style={{ marginTop: 14 }}>
          <div className="pn-row" style={{ marginBottom: 10 }}>
            <div>
              <div className="pn-h1">Recycle Bin</div>
              <div className="pn-small pn-muted">Restore deleted tabs and widgets.</div>
            </div>
            <Pill>{deletedTabs.length + deletedWidgets.length} deleted</Pill>
          </div>

          {!deletedTabs.length && !deletedWidgets.length && (
            <div className="pn-small pn-muted">Nothing deleted.</div>
          )}

          {!!deletedTabs.length && (
            <div style={{ marginTop: 10 }}>
              <div className="pn-small pn-muted" style={{ fontWeight: 950, marginBottom: 8 }}>Deleted tabs</div>
              <div className="pn-list">
                {deletedTabs.map((t) => (
                  <div key={t.id} className="pn-item" style={{ background: "rgba(255,255,255,.03)" }}>
                    <div className="pn-row">
                      <div>
                        <div style={{ fontWeight: 950 }}>{t.name}</div>
                        <div className="pn-small pn-muted">Deleted {t.deletedAt ? formatWhen(t.deletedAt) : ""}</div>
                      </div>
                      <Button variant="primary" onClick={() => setCfg((prev) => restoreTab(prev, { view: props.view, tabId: t.id }))} title="Restore tab">
                        Restore
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!!deletedWidgets.length && (
            <div style={{ marginTop: 14 }}>
              <div className="pn-small pn-muted" style={{ fontWeight: 950, marginBottom: 8 }}>Deleted widgets</div>
              <div className="pn-list">
                {deletedWidgets.slice(0, 50).map((w) => (
                  <div key={w.widgetId} className="pn-item" style={{ background: "rgba(255,255,255,.03)" }}>
                    <div className="pn-row">
                      <div>
                        <div style={{ fontWeight: 950 }}>{getWidgetDef(w.type).icon} {w.title}</div>
                        <div className="pn-small pn-muted">From “{w.tabName}” • Deleted {formatWhen(w.deletedAt)}</div>
                      </div>
                      <Button
                        variant="primary"
                        onClick={() => setCfg((prev) => restoreWidget(prev, { view: props.view, tabId: w.tabId, widgetId: w.widgetId }))}
                        title="Restore widget"
                      >
                        Restore
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Drilldown modal host (Phase 2 contract: route OR modal). */}
      {!!modal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,.55)",
            display: "grid",
            placeItems: "center",
            padding: 14,
          }}
          onClick={() => setModal(null)}
        >
          <div className="pn-card pn-p" style={{ width: "min(720px, 100%)" }} onClick={(e) => e.stopPropagation()}>
            <div className="pn-row" style={{ marginBottom: 10 }}>
              <div>
                <div className="pn-h1">{modal.title}</div>
                {modal.message && <div className="pn-small pn-muted">{modal.message}</div>}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                {modal.primary && (
                  <Button
                    variant="primary"
                    onClick={() => { setModal(null); props.go(modal.primary!.moduleKey); }}
                    title={modal.primary.label}
                  >
                    {modal.primary.label}
                  </Button>
                )}
                <Button variant="ghost" onClick={() => setModal(null)} title="Close">Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

