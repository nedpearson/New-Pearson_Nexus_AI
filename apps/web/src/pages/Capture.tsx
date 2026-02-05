import React from "react";

function ActionCard(props: { title: string; desc: string; emoji: string; tone: string }) {
  return (
    <div className="tile" style={{ minHeight: 160 }}>
      <div style={{
        position:"absolute", inset: 0,
        background: props.tone, opacity: .9
      }} />
      <div style={{ position:"relative" }}>
        <div className="pill"><span style={{ fontSize: 16 }}>{props.emoji}</span>{props.title}</div>
        <div className="muted" style={{ marginTop: 12 }}>{props.desc}</div>
        <div style={{ display:"flex", gap: 10, marginTop: 14, flexWrap:"wrap" }}>
          <button className="btn btnPrimary" type="button">Start</button>
          <button className="btn" type="button">Preview</button>
        </div>
      </div>
    </div>
  );
}

export default function Capture() {
  return (
    <div>
      <div className="glass cardPad">
        <div className="h1">Capture</div>
        <div className="muted" style={{ marginTop: 10 }}>
          Make capture the main flow. Save something fast, then approve the suggested category.
        </div>
        <div style={{ display:"flex", gap: 10, marginTop: 14, flexWrap:"wrap" }}>
          <span className="badge">Auto-category</span>
          <span className="badge">Approval</span>
          <span className="badge">Learns over time</span>
        </div>
      </div>

      <div className="section grid3">
        <ActionCard
          title="Photo"
          desc="Snap receipts, letters, IDs, anything."
          emoji="📷"
          tone="radial-gradient(circle at 20% 20%, rgba(78,231,255,.40), rgba(255,255,255,.02))"
        />
        <ActionCard
          title="Video"
          desc="Record quick context and evidence clips."
          emoji="🎥"
          tone="radial-gradient(circle at 20% 20%, rgba(106,168,255,.40), rgba(255,255,255,.02))"
        />
        <ActionCard
          title="Voice Note"
          desc="Talk it out. Convert to note + category."
          emoji="🎙️"
          tone="radial-gradient(circle at 20% 20%, rgba(255,92,168,.34), rgba(255,255,255,.02))"
        />
      </div>

      <div className="section glass cardPad">
        <div className="h2">Suggested Category (demo)</div>
        <div className="muted" style={{ marginTop: 10 }}>
          Once you capture something, PearsonNexusAI suggests a category. You approve or change it.
        </div>

        <div style={{ display:"flex", gap: 10, marginTop: 14, flexWrap:"wrap" }}>
          <span className="pill">📚 Documents</span>
          <span className="pill">💳 Finances</span>
          <span className="pill">⚖️ Legal</span>
          <span className="pill">🧩 Custom</span>
        </div>

        <div style={{ display:"flex", gap: 10, marginTop: 14, flexWrap:"wrap" }}>
          <button className="btn btnPrimary" type="button">Approve</button>
          <button className="btn" type="button">Change</button>
          <button className="btn" type="button">Add Notes</button>
        </div>
      </div>
    </div>
  );
}
