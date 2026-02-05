import React, { useEffect, useMemo, useRef, useState } from "react";
import type { AppData } from "../data/model";
import { learnCorrection, suggestCategories } from "../utils/store";
import { putBlob } from "../utils/blobStore";
import { Button, Card, Pill } from "./kit";

type Mode = "note" | "voice" | "video";
type RecState = "idle" | "recording" | "stopped";

function rid(prefix: string) {
  return prefix + "_" + Math.random().toString(16).slice(2, 10);
}

export function CapturePanel(props: { data: AppData; setData: (n: AppData) => void }) {
  const [mode, setMode] = useState<Mode | "file">("note");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [category, setCategory] = useState<string>("inbox");
  const [categoryTouched, setCategoryTouched] = useState(false);
  const [newCategoryLabel, setNewCategoryLabel] = useState("");
  const [fileName, setFileName] = useState<string>("");

  const [recState, setRecState] = useState<RecState>("idle");
  const [previewUrl, setPreviewUrl] = useState<string|undefined>(undefined);
  const [mime, setMime] = useState<string|undefined>(undefined);
  const [pendingBlob, setPendingBlob] = useState<Blob|undefined>(undefined);
  const [pendingDataUrl, setPendingDataUrl] = useState<string|undefined>(undefined);

  const streamRef = useRef<MediaStream|null>(null);
  const recRef = useRef<MediaRecorder|null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const kind = mode === "file"
    ? ((mime || "").startsWith("image/") ? "photo" : "note")
    : mode === "note"
      ? "note"
      : mode === "voice"
        ? "voice"
        : "video";

  const suggestions = useMemo(() => {
    return suggestCategories(title || "Untitled", text || undefined, kind, props.data.categories, props.data.learning);
  }, [title, text, kind, props.data.categories, props.data.learning]);

  const topSuggestion = suggestions?.[0]?.category;

  // Initialize the category when suggestions update (but don't clobber user choice).
  useEffect(() => {
    if (categoryTouched) return;
    if (!category || category === "inbox") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (topSuggestion) setCategory(topSuggestion);
    }
  }, [topSuggestion, categoryTouched, category]);

  async function start(kind: "voice"|"video") {
    stop(true);

    const constraints: MediaStreamConstraints =
      kind === "video" ? { audio: true, video: { facingMode: "environment" } } : { audio: true, video: false };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    streamRef.current = stream;

    const rec = new MediaRecorder(stream);
    recRef.current = rec;
    chunksRef.current = [];

    rec.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunksRef.current.push(e.data); };
    rec.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: rec.mimeType || (kind === "video" ? "video/webm" : "audio/webm") });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setMime(blob.type);
      setPendingBlob(blob);
      setPendingDataUrl(undefined);
      setRecState("stopped");
    };

    rec.start();
    setRecState("recording");
  }

  function stop(silent = false) {
    try { recRef.current?.stop(); } catch { /* ignore */ }
    recRef.current = null;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (!silent && recState === "recording") setRecState("stopped");
  }

  function reset() {
    setTitle(""); setText(""); setMime(undefined); setRecState("idle");
    setCategory("inbox");
    setCategoryTouched(false);
    setNewCategoryLabel("");
    setFileName("");
    setPendingBlob(undefined);
    setPendingDataUrl(undefined);
    if (previewUrl && previewUrl.startsWith("blob:")) {
      try { URL.revokeObjectURL(previewUrl); } catch { /* ignore */ }
    }
    setPreviewUrl(undefined);
    stop(true);
  }

  async function save(approvedCategory?: string) {
    const t = title.trim() || "Untitled";
    const s = suggestCategories(t, text || undefined, kind, props.data.categories, props.data.learning);
    const id = rid("lib");

    let persistedUrl: string | undefined = undefined;
    if (pendingDataUrl) {
      persistedUrl = pendingDataUrl;
    } else if (pendingBlob) {
      await putBlob(id, pendingBlob);
      persistedUrl = `idb:${id}`;
    } else if (previewUrl && !previewUrl.startsWith("blob:")) {
      // data: urls (small uploads) are safe to persist
      persistedUrl = previewUrl;
    }

    const item = {
      id,
      createdAt: Date.now(),
      kind,
      title: t,
      text: text.trim() || undefined,
      fileName: fileName || undefined,
      mediaUrl: persistedUrl,
      mime,
      suggested: s,
      approvedCategory,
    };

    const nextLearning = approvedCategory
      ? learnCorrection(props.data.learning, t, text || undefined, approvedCategory)
      : props.data.learning;

    props.setData({
      ...props.data,
      library: [item, ...props.data.library],
      learning: nextLearning,
    });

    reset();
  }

  function normalizeKey(label: string) {
    return label
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s_-]/g, "")
      .replace(/\s+/g, "_")
      .slice(0, 24);
  }

  function addCategoryInline() {
    const label = newCategoryLabel.trim();
    if (!label) return;
    const base = normalizeKey(label) || "cat";
    let key = base;
    let n = 1;
    while (props.data.categories.some((c) => c.key === key)) {
      key = `${base}_${n++}`;
    }
    const next = {
      ...props.data,
      categories: [...props.data.categories, { key, label, color: "cyan" as const }],
    };
    props.setData(next);
    setCategory(key);
    setCategoryTouched(true);
    setNewCategoryLabel("");
  }

  async function onPickFile(file: File | null) {
    if (!file) return;
    stop(true);
    setRecState("idle");
    setFileName(file.name);
    setMime(file.type || "application/octet-stream");

    // Read as data URL for persistence in localStorage (simple prototype).
    // Guardrail: if file is huge, store the Blob in IndexedDB (persisted).
    const maxBytes = 2_000_000; // ~2MB
    if (file.size > maxBytes) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setPendingBlob(file);
      setPendingDataUrl(undefined);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = typeof reader.result === "string" ? reader.result : "";
      if (url) {
        setPreviewUrl(url);
        setPendingDataUrl(url);
        setPendingBlob(undefined);
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <Card
      title="Quick Capture"
      subtitle="Record it fast, approve the category, and it learns your style."
      right={<Pill>Camera/Mic</Pill>}
    >
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        <Button onClick={() => setMode("note")} variant={mode==="note" ? "primary" : "ghost"}>Note</Button>
        <Button onClick={() => setMode("voice")} variant={mode==="voice" ? "primary" : "ghost"}>Voice</Button>
        <Button onClick={() => setMode("video")} variant={mode==="video" ? "primary" : "ghost"}>Video</Button>
        <Button onClick={() => setMode("file")} variant={mode==="file" ? "primary" : "ghost"}>Upload</Button>
      </div>

      <div className="pn-col" style={{ marginTop: 10 }}>
        <input className="pn-input" value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Title (optional)" />
        <textarea className="pn-textarea" value={text} onChange={(e)=>setText(e.target.value)} placeholder="Add a quick note (optional) — helps categorization." />
      </div>

      {mode === "file" && (
        <div className="pn-item" style={{ marginTop: 10 }}>
          <div className="pn-h2">Upload a file</div>
          <div className="pn-small pn-muted" style={{ marginTop: 6 }}>
            Choose a document/photo and assign a category. (Prototype: stored locally.)
          </div>
          <div style={{ marginTop: 10, display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
            <input
              type="file"
              onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
              aria-label="Upload file"
            />
            {fileName && <Pill>{fileName}</Pill>}
          </div>

          {previewUrl && (mime || "").startsWith("image/") && (
            <div style={{ marginTop: 10 }}>
              <img src={previewUrl} alt="Uploaded preview" style={{ width: "100%", maxHeight: 360, objectFit: "contain", borderRadius: 14 }} />
            </div>
          )}
          {previewUrl && !(mime || "").startsWith("image/") && (
            <div style={{ marginTop: 10 }}>
              <a className="pn-btn" href={previewUrl} target="_blank" rel="noreferrer">Open uploaded file</a>
              {mime && <div className="pn-small pn-muted" style={{ marginTop: 8 }}>mime: {mime}</div>}
            </div>
          )}
        </div>
      )}

      {mode !== "note" && mode !== "file" && (
        <div className="pn-item" style={{ marginTop: 10 }}>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
            {mode === "voice" && (
              <>
                <Button onClick={() => start("voice")} variant="primary" disabled={recState==="recording"}>Start Voice</Button>
                <Button onClick={() => stop()} disabled={recState!=="recording"}>Stop</Button>
              </>
            )}
            {mode === "video" && (
              <>
                <Button onClick={() => start("video")} variant="primary" disabled={recState==="recording"}>Start Video</Button>
                <Button onClick={() => stop()} disabled={recState!=="recording"}>Stop</Button>
              </>
            )}
            <Pill>Status: {recState}</Pill>
          </div>

          {previewUrl && mode === "voice" && <div style={{ marginTop: 10 }}><audio controls src={previewUrl} style={{ width:"100%" }} /></div>}
          {previewUrl && mode === "video" && <div style={{ marginTop: 10 }}><video controls src={previewUrl} style={{ width:"100%", borderRadius: 14 }} /></div>}
          {mime && <div className="pn-small pn-muted" style={{ marginTop: 8 }}>mime: {mime}</div>}
        </div>
      )}

      <div className="pn-item" style={{ marginTop: 12 }}>
        <div className="pn-h2">Category</div>
        <div className="pn-small pn-muted" style={{ marginTop: 6 }}>
          Pick the category it belongs to. You can change it later in the Library.
        </div>

        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop: 10, alignItems:"center" }}>
          <select
            className="pn-select"
            value={category}
            onChange={(e)=>{ setCategory(e.target.value); setCategoryTouched(true); }}
            aria-label="Choose category"
            title="Choose category"
          >
            {props.data.categories.map((c) => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
          <Button
            variant="primary"
            onClick={() => { void save(category); }}
            disabled={mode === "file" && !previewUrl}
            title={mode === "file" && !previewUrl ? "Upload a file first" : "Save with selected category"}
          >
            Save
          </Button>
        </div>

        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop: 10, alignItems:"center" }}>
          <input
            className="pn-input"
            value={newCategoryLabel}
            onChange={(e)=>setNewCategoryLabel(e.target.value)}
            placeholder="Add new category…"
            aria-label="New category label"
            title="New category label"
            style={{ maxWidth: 260 }}
          />
          <Button onClick={addCategoryInline} disabled={!newCategoryLabel.trim()} title="Add category">
            + Add Category
          </Button>
        </div>

        <div className="pn-h2" style={{ marginTop: 12 }}>Suggested categories</div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop: 10 }}>
          {suggestions.map(s => (
            <button key={s.category} className="pn-btn" onClick={() => { void save(s.category); }} type="button" title="Approve and save">
              ✅ {s.category} <span className="pn-muted">({Math.round(s.score*100)}%)</span>
            </button>
          ))}
          <button className="pn-btn" onClick={() => { void save(undefined); }} type="button" title="Save without approval">
            Save to Inbox
          </button>
          <Button onClick={reset}>Reset</Button>
        </div>
      </div>
    </Card>
  );
}
