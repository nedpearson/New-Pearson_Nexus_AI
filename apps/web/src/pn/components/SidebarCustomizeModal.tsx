import React, { useMemo, useRef, useState } from "react";
import { Button, Card, Pill } from "./kit";
import type { NavDefaults, SidebarPreferencesV1, HeaderKey, NavItemDef, ViewKey } from "../nav/nav.types";
import { HEADER_ORDER } from "../nav/nav.types";
import { clearSidebarPrefs, defaultPrefsForDefaults } from "../nav/sidebarPrefs";

function headerLabel(h: HeaderKey) {
  return h === "home" ? "Home"
    : h === "money" ? "Money"
      : h === "legal" ? "Legal"
        : h === "capture_docs" ? "Capture / Documents"
          : "Admin";
}

function ensureOrder(defaultIds: string[], desired?: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of (desired || [])) {
    if (defaultIds.includes(id) && !seen.has(id)) { out.push(id); seen.add(id); }
  }
  for (const id of defaultIds) {
    if (!seen.has(id)) out.push(id);
  }
  return out;
}

export function SidebarCustomizeModal(props: {
  open: boolean;
  onClose: () => void;
  view: ViewKey;
  defaults: NavDefaults;
  prefs: SidebarPreferencesV1;
  setPrefs: (n: SidebarPreferencesV1) => void;
  isAdmin: boolean;
}) {
  const [dragging, setDragging] = useState<string|undefined>(undefined);
  const dragFrom = useRef<number>(-1);

  const byHeader = useMemo(() => {
    const map = new Map<HeaderKey, NavItemDef[]>();
    for (const h of HEADER_ORDER) map.set(h, []);
    for (const it of props.defaults.items) map.get(it.header)!.push(it);
    return map;
  }, [props.defaults.items]);

  if (!props.open) return null;

  const hidden = new Set(props.prefs.hiddenItemIds || []);
  const pinned = new Set(props.prefs.pinnedItemIds || []);

  function setHidden(id: string, nextHidden: boolean) {
    const next = new Set(props.prefs.hiddenItemIds || []);
    if (nextHidden) next.add(id); else next.delete(id);
    props.setPrefs({ ...props.prefs, hiddenItemIds: Array.from(next) });
  }

  function setPinned(id: string, nextPinned: boolean) {
    const next = new Set(props.prefs.pinnedItemIds || []);
    if (nextPinned) next.add(id); else next.delete(id);
    props.setPrefs({ ...props.prefs, pinnedItemIds: Array.from(next) });
  }

  function setOrder(header: HeaderKey, ids: string[]) {
    props.setPrefs({
      ...props.prefs,
      orderByHeader: { ...(props.prefs.orderByHeader || {}), [header]: ids },
    });
  }

  function onDragStart(header: HeaderKey, idx: number, id: string) {
    dragFrom.current = idx;
    setDragging(`${header}:${id}`);
  }

  function onDrop(header: HeaderKey, toIdx: number, orderedIds: string[]) {
    const fromIdx = dragFrom.current;
    if (fromIdx < 0 || fromIdx === toIdx) { dragFrom.current = -1; setDragging(undefined); return; }
    const copy = [...orderedIds];
    const [x] = copy.splice(fromIdx, 1);
    copy.splice(toIdx, 0, x);
    setOrder(header, copy);
    dragFrom.current = -1;
    setDragging(undefined);
  }

  function restoreDefaultsForView() {
    clearSidebarPrefs(props.view);
    props.setPrefs(defaultPrefsForDefaults(props.defaults));
  }

  return (
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
      onClick={props.onClose}
    >
      <div className="pn-card pn-p" style={{ width: "min(980px, 100%)" }} onClick={(e) => e.stopPropagation()}>
        <div className="pn-row" style={{ marginBottom: 10 }}>
          <div>
            <div className="pn-h1">Customize Sidebar</div>
            <div className="pn-small pn-muted">View: {props.view}</div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <Button onClick={restoreDefaultsForView} title="Restore default sidebar for this view">Restore defaults</Button>
            <Button variant="primary" onClick={props.onClose} title="Close">Done</Button>
          </div>
        </div>

        <Card title="Access" subtitle="Safe placeholder gate (no auth system yet)." right={<Pill>{props.isAdmin ? "Admin enabled" : "Admin hidden"}</Pill>}>
          <label className="pn-item" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div style={{ fontWeight: 900 }}>Owner/Admin mode</div>
              <div className="pn-small pn-muted">Shows the Admin header and Admin-only items.</div>
            </div>
            <input
              type="checkbox"
              checked={props.prefs.ownerMode === true}
              onChange={(e) => props.setPrefs({ ...props.prefs, ownerMode: e.target.checked })}
              style={{ width: 18, height: 18 }}
              aria-label="Owner/Admin mode"
              title="Owner/Admin mode"
            />
          </label>
        </Card>

        <div className="pn-layout" style={{ gridTemplateColumns: "repeat(2, minmax(0,1fr))", alignItems: "start" }}>
          {HEADER_ORDER.map((h) => {
            if (h === "admin" && !props.isAdmin) return null;
            const items = byHeader.get(h) || [];
            const defaultIds = items.map((i) => i.id);
            const orderedIds = ensureOrder(defaultIds, props.prefs.orderByHeader?.[h]);
            const orderedItems = orderedIds.map((id) => items.find((i) => i.id === id)!).filter(Boolean);
            return (
              <Card key={h} title={headerLabel(h)} subtitle="Show/hide, pin, and reorder within this header." right={<Pill>{orderedItems.length} items</Pill>}>
                <div className="pn-list">
                  {orderedItems.map((it, idx) => {
                    const isHidden = hidden.has(it.id);
                    const isPinned = pinned.has(it.id);
                    return (
                      <div
                        key={it.id}
                        className={["pn-dndRow", dragging === `${h}:${it.id}` ? "pn-dndDragging" : ""].join(" ")}
                        draggable
                        onDragStart={() => onDragStart(h, idx, it.id)}
                        onDragOver={(e)=>e.preventDefault()}
                        onDrop={() => onDrop(h, idx, orderedIds)}
                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}
                        title={it.label}
                      >
                        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={!isHidden}
                            onChange={(e) => setHidden(it.id, !e.target.checked)}
                            aria-label={`Show ${it.label}`}
                            title={`Show ${it.label}`}
                          />
                          <span style={{ fontWeight: 900 }}>{it.icon ? `${it.icon} ` : ""}{it.label}</span>
                        </label>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <button
                            type="button"
                            className="pn-btn"
                            onClick={() => setPinned(it.id, !isPinned)}
                            title={isPinned ? "Unpin" : "Pin to top"}
                            style={{ padding: "6px 10px" }}
                          >
                            {isPinned ? "★" : "☆"}
                          </button>
                          <div className="pn-dndHandle">drag</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

