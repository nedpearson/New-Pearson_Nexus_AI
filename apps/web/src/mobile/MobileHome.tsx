import React, { useMemo, useRef, useState } from "react";
import "../mobile/mobile.css";
import type { CaptureType } from "../offline/queue";
import { CaptureDetail } from "./CaptureDetail";
import { SyncButton } from "../components/SyncButton";
import { getSyncToken, setSyncToken } from "../offline/queue";

type DetailState =
  | { open: false }
  | { open: true; type: CaptureType; title: string; accent: "blue" | "orange"; files?: File[] };

function BigTile(props: { accent: "blue" | "orange"; icon: string; title: string; hint: string; onClick: () => void }) {
  const cls = ["m-bigTile", props.accent === "blue" ? "m-bigTileBlue" : "m-bigTileOrange"].join(" ");
  const ic = ["m-iconBlock", props.accent === "blue" ? "m-iconBlockBlue" : "m-iconBlockOrange"].join(" ");
  return (
    <button className={cls} type="button" onClick={props.onClick} title={props.title}>
      <div className={ic}>{props.icon}</div>
      <div>
        <div className="m-bigLabel">{props.title}</div>
        <div className="m-bigHint">{props.hint}</div>
      </div>
    </button>
  );
}

function SmallTile(props: { accent: "blue" | "orange"; icon: string; title: string; sub: string; onClick: () => void }) {
  const iconCls = ["m-smallIcon", props.accent === "blue" ? "m-smallIconBlue" : "m-smallIconOrange"].join(" ");
  return (
    <button className="m-smallTile" type="button" onClick={props.onClick} title={props.title}>
      <div className="m-smallLeft">
        <div className={iconCls}>{props.icon}</div>
        <div className="m-smallText">
          <div className="m-smallTitle">{props.title}</div>
          <div className="m-smallSub">{props.sub}</div>
        </div>
      </div>
      <div className="m-arrow">›</div>
    </button>
  );
}

export function MobileHome() {
  const [detail, setDetail] = useState<DetailState>({ open: false });
  const fileBlueRef = useRef<HTMLInputElement | null>(null);
  const fileOrangeRef = useRef<HTMLInputElement | null>(null);
  const [showToken, setShowToken] = useState(false);
  const [tokenDraft, setTokenDraft] = useState<string>(() => (getSyncToken() || ""));

  const title = useMemo(() => "Quick Capture", []);
  const subtitle = useMemo(() => "Capture evidence for your case", []);

  function openDetail(type: CaptureType, files?: File[]) {
    const isDoc = type === "document";
    setDetail({
      open: true,
      type,
      title: isDoc ? "Capture Documents" : "Capture Violations",
      accent: isDoc ? "blue" : "orange",
      files,
    });
  }

  function onPicked(which: "blue" | "orange", files: FileList | null) {
    const arr = files ? Array.from(files) : [];
    if (!arr.length) return;
    openDetail(which === "blue" ? "document" : "violation", arr);
    // reset so selecting the same file twice still triggers
    if (which === "blue" && fileBlueRef.current) fileBlueRef.current.value = "";
    if (which === "orange" && fileOrangeRef.current) fileOrangeRef.current.value = "";
  }

  if (detail.open) {
    return (
      <CaptureDetail
        open={detail.open}
        type={detail.type}
        title={detail.title}
        accent={detail.accent}
        files={detail.files}
        onClose={() => setDetail({ open: false })}
      />
    );
  }

  return (
    <div className="m-root">
      <div className="m-wrap">
        <div className="m-title">{title}</div>
        <div className="m-subtitle">{subtitle}</div>

        <div className="m-grid2">
          <BigTile
            accent="blue"
            icon="📷"
            title="Capture Documents"
            hint="Capture with camera"
            onClick={() => openDetail("document")}
          />
          <BigTile
            accent="orange"
            icon="⚠️"
            title="Capture Violations"
            hint="Capture evidence"
            onClick={() => openDetail("violation")}
          />
        </div>

        <div style={{ height: 14 }} />

        <div className="m-grid2">
          <SmallTile
            accent="blue"
            icon="⬆️"
            title="Upload Files"
            sub="From device"
            onClick={() => fileBlueRef.current?.click()}
          />
          <SmallTile
            accent="orange"
            icon="⬆️"
            title="Upload Files"
            sub="Evidence from device"
            onClick={() => fileOrangeRef.current?.click()}
          />
          <SmallTile
            accent="blue"
            icon="🎙️"
            title="Voice Notes"
            sub="Describe…"
            onClick={() => openDetail("document")}
          />
          <SmallTile
            accent="orange"
            icon="🎙️"
            title="Voice Notes"
            sub="Describe…"
            onClick={() => openDetail("violation")}
          />
        </div>

        <input
          ref={(r) => { fileBlueRef.current = r; }}
          type="file"
          multiple
          accept="image/*,application/pdf,video/*,audio/*"
          style={{ display: "none" }}
          onChange={(e) => onPicked("blue", e.target.files)}
        />
        <input
          ref={(r) => { fileOrangeRef.current = r; }}
          type="file"
          multiple
          accept="image/*,application/pdf,video/*,audio/*"
          style={{ display: "none" }}
          onChange={(e) => onPicked("orange", e.target.files)}
        />

        <div className="m-panel" style={{ marginTop: 16 }}>
          <div className="m-row" style={{ justifyContent: "space-between" }}>
            <div className="m-chip" style={{ fontWeight: 900, color: "rgba(238,242,255,.76)" }}>Sync</div>
            <SyncButton compact />
          </div>
          <div className="m-chip" style={{ marginTop: 8 }}>
            Save Offline always works. Sync Now requires internet + a sync token (set in Admin → Integrations).
          </div>
          <div className="m-row" style={{ marginTop: 10 }}>
            <button className="m-btn" type="button" onClick={() => setShowToken((v) => !v)} title="Sync token settings">
              {showToken ? "Hide Sync Settings" : "Sync Settings"}
            </button>
          </div>
          {showToken && (
            <div className="m-row" style={{ marginTop: 10 }}>
              <input
                value={tokenDraft}
                onChange={(e) => setTokenDraft(e.target.value)}
                placeholder="Paste sync token…"
                aria-label="Sync token"
                style={{
                  flex: "1 1 240px",
                  minWidth: 220,
                  borderRadius: 14,
                  padding: "10px 12px",
                  border: "1px solid rgba(255,255,255,.12)",
                  background: "rgba(255,255,255,.04)",
                  color: "rgba(238,242,255,.92)",
                  outline: "none",
                  fontWeight: 800,
                }}
              />
              <button
                className="m-btn m-btnPrimary"
                type="button"
                onClick={() => setSyncToken(tokenDraft)}
                title="Save token on this device"
                disabled={!tokenDraft.trim()}
              >
                Save Token
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

