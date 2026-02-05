import React, { useEffect, useMemo, useRef, useState } from "react";
import type { CaptureType } from "../offline/queue";
import { enqueueCapture, getSyncToken, isOnline, syncQueuedCaptures } from "../offline/queue";

type SpeechRecognitionCtor = new () => SpeechRecognition;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  const w = window as unknown as { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function CaptureDetail(props: {
  open: boolean;
  type: CaptureType;
  title: string;
  accent: "blue" | "orange";
  files?: File[];
  onClose: () => void;
}) {
  const [notes, setNotes] = useState("");
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [online, setOnline] = useState<boolean>(() => isOnline());
  const [, setAuthTick] = useState(0);
  const recRef = useRef<SpeechRecognition | null>(null);

  const authed = Boolean(getSyncToken());
  const canSpeech = useMemo(() => {
    if (typeof window === "undefined") return false;
    return Boolean(getSpeechRecognitionCtor());
  }, []);

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    const onAuth = () => setAuthTick((n) => n + 1);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    window.addEventListener("pnx-auth-changed", onAuth);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("pnx-auth-changed", onAuth);
    };
  }, []);

  useEffect(() => {
    if (!props.open) return;
    setStatus("");
    setNotes("");
    setTranscript("");
    setListening(false);
  }, [props.open, props.type]);

  function appendText(t: string) {
    const next = (notes ? notes.trimEnd() + "\n" : "") + t.trim();
    setNotes(next);
  }

  function startSpeech() {
    if (!canSpeech) {
      setStatus("Voice-to-text isn’t supported on this browser. Try Chrome/Edge on Android, or Safari iOS 16+.");
      return;
    }
    if (listening) return;
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.continuous = true;
    rec.onresult = (e) => {
      let out = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        out += String(e.results[i][0]?.transcript || "");
      }
      setTranscript(out.trim());
    };
    rec.onerror = () => {
      setListening(false);
      setStatus("Voice-to-text error. You can still type notes and Save Offline.");
    };
    rec.onend = () => {
      setListening(false);
    };
    recRef.current = rec;
    setStatus("");
    setListening(true);
    try {
      rec.start();
    } catch {
      setListening(false);
      setStatus("Voice-to-text couldn’t start. You can still type notes and Save Offline.");
    }
  }

  function stopSpeech() {
    try { recRef.current?.stop(); } catch { /* ignore */ }
    recRef.current = null;
    setListening(false);
    if (transcript.trim()) appendText(transcript.trim());
    setTranscript("");
  }

  async function saveOffline() {
    setBusy(true);
    setStatus("");
    try {
      const filesMeta = props.files?.map((f) => ({ name: f.name, type: f.type, size: f.size, lastModified: f.lastModified }));
      await enqueueCapture({
        type: props.type,
        notes,
        transcript: transcript.trim(),
        files: filesMeta,
      });
      setStatus("Saved offline. You can sync any time.");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function syncNow() {
    if (!online || !authed) return;
    setBusy(true);
    setStatus("");
    try {
      // Ensure this capture is queued first, then run queue sync.
      await saveOffline();
      const r = await syncQueuedCaptures();
      setStatus(r.ok ? `Synced ${r.synced}` : `Sync failed (${r.failed})`);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  if (!props.open) return null;

  const title = props.title;
  const hint = props.type === "document" ? "Capture with camera or upload — add notes for context." : "Capture evidence — keep it factual and timestamped.";
  const accentBtn = props.accent === "orange" ? "m-btnOrange" : "m-btnPrimary";

  return (
    <div className="m-root" style={{ paddingTop: 14 }}>
      <div className="m-wrap">
        <div className="m-row" style={{ justifyContent: "space-between" }}>
          <button className="m-btn" type="button" onClick={props.onClose} title="Back">← Back</button>
          <div className="m-chip">{online ? "Online" : "Offline"} • {authed ? "Auth OK" : "Auth required"}</div>
        </div>

        <div className="m-title" style={{ marginTop: 12 }}>{title}</div>
        <div className="m-subtitle">{hint}</div>

        {!!props.files?.length && (
          <div className="m-panel">
            <div className="m-chip" style={{ marginBottom: 6, fontWeight: 900, color: "rgba(238,242,255,.76)" }}>Files</div>
            <div className="m-chip">
              {props.files.map((f) => `${f.name} (${Math.round(f.size / 1024)} KB)`).join(" • ")}
            </div>
          </div>
        )}

        <div className="m-panel">
          <div className="m-chip" style={{ marginBottom: 8, fontWeight: 900, color: "rgba(238,242,255,.76)" }}>Notes</div>
          <textarea
            className="m-textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Type a clear, factual note… (names, dates, what happened)"
            aria-label="Notes"
          />

          <div className="m-row" style={{ marginTop: 10 }}>
            {!listening ? (
              <button className={["m-btn", accentBtn].join(" ")} type="button" onClick={startSpeech} disabled={!canSpeech} title={canSpeech ? "Start voice-to-text" : "Voice-to-text not supported"}>
                🎙️ Voice-to-text
              </button>
            ) : (
              <button className={["m-btn", accentBtn].join(" ")} type="button" onClick={stopSpeech} title="Stop voice-to-text">
                ⏹ Stop
              </button>
            )}
            <button className="m-btn" type="button" onClick={saveOffline} disabled={busy} title="Always works">
              Save Offline
            </button>
            <button className="m-btn" type="button" onClick={syncNow} disabled={busy || !online || !authed} title={!online ? "Offline" : !authed ? "Set a sync token to authenticate" : "Sync queued items now"}>
              Sync Now
            </button>
          </div>

          {!!listening && (
            <div className="m-chip" style={{ marginTop: 10 }}>
              Listening… {transcript ? `“${transcript}”` : "Speak now."}
            </div>
          )}
          {!!status && (
            <div className="m-chip" style={{ marginTop: 10 }}>{status}</div>
          )}
        </div>

        <div className="m-panel">
          <div className="m-chip">
            Tip: Install this to your Home Screen for fastest offline capture. (Share → Add to Home Screen)
          </div>
        </div>
      </div>
    </div>
  );
}

