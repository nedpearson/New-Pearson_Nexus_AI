import React, { useMemo, useState } from "react";
import { AppData } from "../data/model";
import { CapturePanel } from "../components/CapturePanel";
import { Card, Button, Pill } from "../components/kit";
import { learnCorrection, suggestCategories } from "../utils/store";

export function DocumentsModule(props: { data: AppData; setData: (n: AppData) => void }) {
  const [filter, setFilter] = useState<string>("all");

  const items = useMemo(() => {
    if (filter === "all") return props.data.library;
    if (filter === "needs") return props.data.library.filter(i => !i.approvedCategory);
    return props.data.library.filter(i => i.approvedCategory === filter);
  }, [props.data.library, filter]);

  function approve(id: string, category: string) {
    const item = props.data.library.find(i => i.id === id);
    if (!item) return;

    const nextLearning = learnCorrection(props.data.learning, item.title, item.text, category);
    props.setData({
      ...props.data,
      learning: nextLearning,
      library: props.data.library.map(i => i.id === id ? { ...i, approvedCategory: category } : i),
    });
  }

  return (
    <div className="pn-col">
      <CapturePanel data={props.data} setData={props.setData} />

      <Card title="Library" subtitle="Approve category suggestions to train it." right={<Pill>{items.length} items</Pill>}>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom: 10 }}>
          <Button onClick={() => setFilter("all")} variant={filter==="all"?"primary":"ghost"}>All</Button>
          <Button onClick={() => setFilter("needs")} variant={filter==="needs"?"primary":"ghost"}>Needs approval</Button>
          {props.data.categories.slice(0, 6).map(c => (
            <Button key={c.key} onClick={() => setFilter(c.key)} variant={filter===c.key?"primary":"ghost"}>{c.label}</Button>
          ))}
        </div>

        <div className="pn-list">
          {items.map(i => {
            const suggestions = i.suggested?.length ? i.suggested : suggestCategories(i.title, i.text, i.kind, props.data.categories, props.data.learning);
            return (
              <div key={i.id} className="pn-item">
                <div className="pn-row">
                  <div>
                    <div style={{ fontWeight: 900 }}>{i.title}</div>
                    <div className="pn-small pn-muted">{new Date(i.createdAt).toLocaleString()} • {i.kind}</div>
                  </div>
                  <span className="pn-badge">{i.approvedCategory ? `✅ ${i.approvedCategory}` : "⏳ approve"}</span>
                </div>

                {i.text && <div style={{ marginTop: 8, color: "rgba(238,242,255,.78)" }}>{i.text}</div>}

                {i.mediaUrl && i.kind === "voice" && <div style={{ marginTop: 10 }}><audio controls src={i.mediaUrl} style={{ width:"100%" }} /></div>}
                {i.mediaUrl && i.kind === "video" && <div style={{ marginTop: 10 }}><video controls src={i.mediaUrl} style={{ width:"100%", borderRadius: 14 }} /></div>}

                {!i.approvedCategory && (
                  <div style={{ marginTop: 10 }}>
                    <div className="pn-small pn-muted">Approve suggestion:</div>
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop: 8 }}>
                      {suggestions.slice(0,3).map(s => (
                        <button key={s.category} className="pn-btn" onClick={() => approve(i.id, s.category)} type="button">
                          ✅ {s.category} <span className="pn-muted">({Math.round(s.score*100)}%)</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
