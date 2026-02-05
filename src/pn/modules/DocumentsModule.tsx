import React, { useEffect, useMemo, useState } from "react";
import type { AppData } from "../data/model";
import { CapturePanel } from "../components/CapturePanel";
import { Card, Button, Pill } from "../components/kit";
import { learnCorrection, suggestCategories } from "../utils/store";
import { getBlob } from "../utils/blobStore";

function useResolvedMediaUrl(mediaUrl?: string) {
  const [resolved, setResolved] = useState<string|undefined>(undefined);

  useEffect(() => {
    let active = true;
    let objectUrlToRevoke: string | undefined = undefined;

    async function run() {
      if (!mediaUrl) {
        setResolved(undefined);
        return;
      }

      if (!mediaUrl.startsWith("idb:")) {
        setResolved(mediaUrl);
        return;
      }

      const key = mediaUrl.slice("idb:".length);
      try {
        const blob = await getBlob(key);
        if (!active) return;
        if (!blob) {
          setResolved(undefined);
          return;
        }
        objectUrlToRevoke = URL.createObjectURL(blob);
        setResolved(objectUrlToRevoke);
      } catch {
        if (active) setResolved(undefined);
      }
    }

    void run();

    return () => {
      active = false;
      if (objectUrlToRevoke) {
        try { URL.revokeObjectURL(objectUrlToRevoke); } catch {}
      }
    };
  }, [mediaUrl]);

  return resolved;
}

function LibraryItemRow(props: {
  item: AppData["library"][number];
  categories: AppData["categories"];
  learning: AppData["learning"];
  approve: (id: string, category: string) => void;
}) {
  const i = props.item;
  const resolvedUrl = useResolvedMediaUrl(i.mediaUrl);
  const suggestions = useMemo(() => {
    return i.suggested?.length ? i.suggested : suggestCategories(i.title, i.text, i.kind, props.categories, props.learning);
  }, [i.suggested, i.title, i.text, i.kind, props.categories, props.learning]);

  return (
    <div className="pn-item">
      <div className="pn-row">
        <div>
          <div style={{ fontWeight: 900 }}>{i.title}</div>
          <div className="pn-small pn-muted">{new Date(i.createdAt).toLocaleString()} • {i.kind}</div>
        </div>
        <span className="pn-badge">{i.approvedCategory ? `✅ ${i.approvedCategory}` : "⏳ approve"}</span>
      </div>

      {i.text && <div style={{ marginTop: 8, color: "rgba(238,242,255,.78)" }}>{i.text}</div>}

      {resolvedUrl && i.kind === "voice" && <div style={{ marginTop: 10 }}><audio controls src={resolvedUrl} style={{ width:"100%" }} /></div>}
      {resolvedUrl && i.kind === "video" && <div style={{ marginTop: 10 }}><video controls src={resolvedUrl} style={{ width:"100%", borderRadius: 14 }} /></div>}
      {resolvedUrl && i.kind === "photo" && (
        <div style={{ marginTop: 10 }}>
          <img src={resolvedUrl} alt={i.title} style={{ width:"100%", maxHeight: 420, objectFit:"contain", borderRadius: 14, background:"rgba(0,0,0,.18)" }} />
          {i.mime && <div className="pn-small pn-muted" style={{ marginTop: 8 }}>mime: {i.mime}</div>}
        </div>
      )}
      {resolvedUrl && i.kind === "note" && i.mime && (
        <div style={{ marginTop: 10 }}>
          <a className="pn-btn" href={resolvedUrl} target="_blank" rel="noreferrer">
            Open attached file{i.fileName ? ` (${i.fileName})` : ""}
          </a>
          <div className="pn-small pn-muted" style={{ marginTop: 8 }}>mime: {i.mime}</div>
        </div>
      )}

      {!i.approvedCategory && (
        <div style={{ marginTop: 10 }}>
          <div className="pn-small pn-muted">Approve suggestion:</div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop: 8 }}>
            {suggestions.slice(0,3).map(s => (
              <button key={s.category} className="pn-btn" onClick={() => props.approve(i.id, s.category)} type="button">
                ✅ {s.category} <span className="pn-muted">({Math.round(s.score*100)}%)</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

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
          {items.map(i => (
            <LibraryItemRow
              key={i.id}
              item={i}
              categories={props.data.categories}
              learning={props.data.learning}
              approve={approve}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}
