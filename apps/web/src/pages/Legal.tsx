import React from "react";

function LegalTile(props: { title: string; emoji: string; desc: string }) {
  return (
    <div className="tile" style={{ minHeight: 150 }}>
      <div className="pill"><span style={{ fontSize: 16 }}>{props.emoji}</span>{props.title}</div>
      <div className="muted" style={{ marginTop: 12 }}>{props.desc}</div>
      <div style={{ display:"flex", gap: 10, marginTop: 14, flexWrap:"wrap" }}>
        <button className="btn btnPrimary" type="button">Open</button>
        <button className="btn" type="button">Customize</button>
      </div>
    </div>
  );
}

export default function Legal() {
  return (
    <div>
      <div className="glass cardPad">
        <div className="h1">Legal</div>
        <div className="muted" style={{ marginTop: 10 }}>
          Personal legal help sections (divorce, custody, disputes) that you can customize as admin.
        </div>
      </div>

      <div className="section grid3">
        <LegalTile emoji="⚖️" title="Divorce" desc="Timeline, evidence, filings, summaries." />
        <LegalTile emoji="👶" title="Custody" desc="Schedules, violations, parenting plans." />
        <LegalTile emoji="🧩" title="Custom Issue" desc="Build your own module for a specific need." />
      </div>

      <div className="section glass cardPad">
        <div className="h2">Court-ready summary (demo)</div>
        <div className="muted" style={{ marginTop: 10 }}>
          Generate a structured summary from captured evidence: dates, patterns, impacts, definitions, attachments.
        </div>
        <div style={{ marginTop: 14 }}>
          <textarea
            style={{
              width:"100%", minHeight: 170, borderRadius: 18,
              background:"rgba(0,0,0,.25)", border:"1px solid rgba(255,255,255,.12)",
              padding: 14, color:"rgba(255,255,255,.92)", outline:"none"
            }}
            placeholder="Describe what happened…"
          />
        </div>
        <div style={{ display:"flex", gap: 10, marginTop: 14, flexWrap:"wrap" }}>
          <button className="btn btnPrimary" type="button">Generate</button>
          <button className="btn" type="button">Copy</button>
          <button className="btn" type="button">Download PDF</button>
        </div>
      </div>
    </div>
  );
}
