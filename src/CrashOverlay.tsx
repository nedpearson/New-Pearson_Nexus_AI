import React from "react";

type CrashInfo = { title: string; detail: string };

function esc(s: any) {
  return String(s ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" } as any)[c]);
}

export function installGlobalCrashHandlers(push: (c: CrashInfo) => void) {
  window.addEventListener("error", (e: any) => {
    const detail = e?.error?.stack || e?.message || String(e);
    push({ title: "window.error", detail });
  });
  window.addEventListener("unhandledrejection", (e: any) => {
    const r = e?.reason;
    const detail = r?.stack || r?.message || String(r);
    push({ title: "unhandledrejection", detail });
  });
}

export function CrashOverlay({ crash, onClose }: { crash: CrashInfo | null; onClose: () => void }) {
  if (!crash) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        background: "rgba(0,0,0,.88)",
        color: "#fff",
        padding: 18,
        font: "14px/1.35 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace",
        overflow: "auto",
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 10 }}>PearsonNexusAI crashed</div>
      <div style={{ opacity: 0.85, marginBottom: 10 }}>{crash.title}</div>
      <pre style={{ whiteSpace: "pre-wrap", margin: 0, opacity: 0.95 }} dangerouslySetInnerHTML={{ __html: esc(crash.detail) }} />
      <div style={{ marginTop: 14, opacity: 0.8 }}>
        Copy this error text and paste it back to ChatGPT.
        <button
          onClick={onClose}
          style={{ marginLeft: 12, padding: "6px 10px", borderRadius: 8, border: "1px solid #666", background: "#111", color: "#fff" }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

export class ErrorBoundary extends React.Component<{ onCrash: (c: CrashInfo) => void; children: React.ReactNode }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    const detail = error?.stack || error?.message || String(error);
    this.props.onCrash({ title: "React ErrorBoundary", detail });
  }

  render() {
    return this.props.children;
  }
}
