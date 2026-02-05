import React, { useMemo, useRef, useState } from "react";
import { AppData, Category } from "../data/model";
import { Button, Card, Pill } from "../components/kit";
import { saveData, saveLayout, LayoutState } from "../utils/store";
import { MODULES } from "../registry";

function move<T>(arr: T[], from: number, to: number) {
  const copy = [...arr];
  const [x] = copy.splice(from, 1);
  copy.splice(to, 0, x);
  return copy;
}

export function AdminModule(props: {
  data: AppData;
  setData: (n: AppData) => void;
  layout: LayoutState;
  setLayout: (n: LayoutState) => void;
}) {
  const moduleMap = useMemo(() => new Map(MODULES.map(m => [m.key, m])), []);
  const [dragging, setDragging] = useState<string|undefined>(undefined);
  const dragFrom = useRef<number>(-1);

  function setTier(t: "Free"|"Plus"|"Pro") {
    const next = { ...props.layout, userTier: t };
    props.setLayout(next);
    saveLayout(next);
  }

  function addCategory() {
    const key = "cat_" + Math.random().toString(16).slice(2, 8);
    const nextCat: Category = { key, label: "New Category", color: "cyan" };
    const next = { ...props.data, categories: [...props.data.categories, nextCat] };
    props.setData(next);
    saveData(next);
  }

  function updateCategory(key: string, patch: Partial<Category>) {
    const next = { ...props.data, categories: props.data.categories.map(c => c.key === key ? { ...c, ...patch } : c) };
    props.setData(next);
    saveData(next);
  }

  function onDragStart(idx: number, id: string) {
    dragFrom.current = idx;
    setDragging(id);
  }

  function onDropDesktop(toIdx: number) {
    const fromIdx = dragFrom.current;
    if (fromIdx < 0 || fromIdx === toIdx) { dragFrom.current = -1; setDragging(undefined); return; }
    const nextOrder = move(props.layout.desktopOrder, fromIdx, toIdx);
    const next = { ...props.layout, desktopOrder: nextOrder };
    props.setLayout(next);
    saveLayout(next);
    dragFrom.current = -1;
    setDragging(undefined);
  }

  function onDropMobile(toIdx: number) {
    const fromIdx = dragFrom.current;
    if (fromIdx < 0 || fromIdx === toIdx) { dragFrom.current = -1; setDragging(undefined); return; }
    const nextOrder = move(props.layout.mobileOrder, fromIdx, toIdx);
    const next = { ...props.layout, mobileOrder: nextOrder };
    props.setLayout(next);
    saveLayout(next);
    dragFrom.current = -1;
    setDragging(undefined);
  }

  return (
    <div className="pn-col">
      <Card title="Admin (Prototype)" subtitle="Tier, tab order (desktop + mobile), categories." right={<Pill>Local only</Pill>}>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          <Button onClick={() => setTier("Free")}>Set Tier: Free</Button>
          <Button onClick={() => setTier("Plus")}>Set Tier: Plus</Button>
          <Button onClick={() => setTier("Pro")} variant="primary">Set Tier: Pro</Button>
        </div>
      </Card>

      <div className="pn-layout" style={{ gridTemplateColumns: "repeat(2, minmax(0,1fr))" }}>
        <Card title="Desktop module order" subtitle="Drag rows to reorder the sidebar.">
          <div className="pn-list">
            {props.layout.desktopOrder.map((k, idx) => {
              const m = moduleMap.get(k)!;
              return (
                <div
                  key={k}
                  className={["pn-dndRow", dragging === k ? "pn-dndDragging" : ""].join(" ")}
                  draggable
                  onDragStart={() => onDragStart(idx, k)}
                  onDragOver={(e)=>e.preventDefault()}
                  onDrop={() => onDropDesktop(idx)}
                >
                  <div>
                    <div style={{ fontWeight: 900 }}>{m.icon} {m.title}</div>
                    <div className="pn-small pn-muted">{m.subtitle}</div>
                  </div>
                  <div className="pn-dndHandle">drag</div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title="Mobile tab order" subtitle="Drag rows to reorder bottom tabs (first 5 show).">
          <div className="pn-list">
            {props.layout.mobileOrder.map((k, idx) => {
              const m = moduleMap.get(k)!;
              return (
                <div
                  key={k}
                  className={["pn-dndRow", dragging === k ? "pn-dndDragging" : ""].join(" ")}
                  draggable
                  onDragStart={() => onDragStart(idx, k)}
                  onDragOver={(e)=>e.preventDefault()}
                  onDrop={() => onDropMobile(idx)}
                >
                  <div>
                    <div style={{ fontWeight: 900 }}>{m.icon} {m.title}</div>
                    <div className="pn-small pn-muted">{m.subtitle}</div>
                  </div>
                  <div className="pn-dndHandle">drag</div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card title="Categories" subtitle="These drive auto-categorization suggestions." right={<Button variant="primary" onClick={addCategory}>Add category</Button>}>
        <div className="pn-list">
          {props.data.categories.map(c => (
            <div key={c.key} className="pn-item">
              <div className="pn-layout" style={{ gridTemplateColumns: "1fr 180px 220px", alignItems:"center" }}>
                <input className="pn-input" value={c.label} onChange={(e)=>updateCategory(c.key, { label: e.target.value })} />
                <select className="pn-select" value={c.color} onChange={(e)=>updateCategory(c.key, { color: e.target.value as any })}>
                  <option value="cyan">cyan</option>
                  <option value="blue">blue</option>
                  <option value="purple">purple</option>
                  <option value="rose">rose</option>
                  <option value="amber">amber</option>
                </select>
                <div className="pn-small pn-muted">key: {c.key}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
