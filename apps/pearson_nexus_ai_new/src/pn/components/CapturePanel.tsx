import React, { useMemo, useRef, useState } from "react";
import { AppData } from "../data/model";
import { learnCorrection, suggestCategories } from "../utils/store";
import { Button, Card, Pill } from "./kit";

type Mode = "note" | "voice" | "video";
type RecState = "idle" | "recording" | "stopped";

function rid(prefix: string) {
  return prefix + "_" + Math.random().toString(16).slice(2, 10);
}

export function CapturePanel(props: { data: AppData; setData: (n: AppData) => void }) {
  const [mode, setMode] = useState<Mode>("note");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  const [recState, setRecState] = useState<RecState>("idle");
  const [mediaUrl, setMediaUrl] = useState<string|undefined>(undefined);
  const [mime, setMime] = useState<string|undefined>(undefined);

  const streamRef = useRef<MediaStream|null>(null);
  const recRef = useRef<MediaRecorder|null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const kind = mode === "note" ? "note" : mode === "voice" ? "voice" : "video";

  const suggestions = useMemo(() => {
    return suggestCategories(title || "Untitled", text || undefined, kind, props.data.categories, props.data.learning);
  }, [title, text, kind, props.data.categories, props.data.learning]);

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
      setMediaUrl(url);
      setMime(blob.type);
      setRecState("stopped");
    };

    rec.start();
    setRecState("recording");
  }

  function stop(silent = false) {
    try { recRef.current?.stop(); } catch {}
    recRef.current = null;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (!silent && recState === "recording") setRecState("stopped");
  }

  function reset() {
    setTitle(""); setText(""); setMediaUrl(undefined); setMime(undefined); setRecState("idle");
    stop(true);
  }

  function save(approvedCategory?: string) {
    const t = title.trim() || "Untitled";
    const s = suggestCategories(t, text || undefined, kind, props.data.categories, props.data.learning);

    const item = {
      id: rid("lib"),
      createdAt: Date.now(),
      kind,
      title: t,
      text: text.trim() || undefined,
      mediaUrl,
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
      </div>

      <div className="pn-col" style={{ marginTop: 10 }}>
        <input className="pn-input" value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Title (optional)" />
        <textarea className="pn-textarea" value={text} onChange={(e)=>setText(e.target.value)} placeholder="Add a quick note (optional) — helps categorization." />
      </div>

      {mode !== "note" && (
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

          {mediaUrl && mode === "voice" && <div style={{ marginTop: 10 }}><audio controls src={mediaUrl} style={{ width:"100%" }} /></div>}
          {mediaUrl && mode === "video" && <div style={{ marginTop: 10 }}><video controls src={mediaUrl} style={{ width:"100%", borderRadius: 14 }} /></div>}
          {mime && <div className="pn-small pn-muted" style={{ marginTop: 8 }}>mime: {mime}</div>}
        </div>
      )}

      <div className="pn-item" style={{ marginTop: 12 }}>
        <div className="pn-h2">Suggested categories</div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop: 10 }}>
          {suggestions.map(s => (
            <button key={s.category} className="pn-btn" onClick={() => save(s.category)} type="button" title="Approve and save">
              ✅ {s.category} <span className="pn-muted">({Math.round(s.score*100)}%)</span>
            </button>
          ))}
          <button className="pn-btn" onClick={() => save(undefined)} type="button" title="Save without approval">
            Save to Inbox
          </button>
          <Button onClick={reset}>Reset</Button>
        </div>
      </div>
    </Card>
  );
}
