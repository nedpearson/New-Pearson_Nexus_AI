import React from "react";

function BigTile(props: { title: string; desc: string; emoji: string; href: string; accent: string }) {
  return (
    <a className="tile" href={props.href} style={{ minHeight: 160 }}>
      <div style={{
        position:"absolute", right:-40, top:-40, width: 180, height: 180, borderRadius: 999,
        background: props.accent, filter:"blur(0px)", opacity: .9
      }} />
      <div style={{ position:"relative" }}>
        <div className="pill">
          <span style={{ fontSize: 16 }}>{props.emoji}</span>
          {props.title}
        </div>
        <div className="h2" style={{ marginTop: 14 }}>{props.desc}</div>
        <div className="muted" style={{ marginTop: 8 }}>Tap to open</div>
      </div>
    </a>
  );
}

function Stat(props: { label: string; value: string; hint: string }) {
  return (
    <div className="glass cardPad">
      <div className="muted">{props.label}</div>
      <div style={{ fontSize: 34, fontWeight: 950, marginTop: 6 }}>{props.value}</div>
      <div className="muted" style={{ marginTop: 6 }}>{props.hint}</div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div>
      <div className="glass cardPad">
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap: 12, flexWrap:"wrap" }}>
          <div>
            <div className="muted">PearsonNexusAI</div>
            <div className="h1" style={{ marginTop: 6 }}>Welcome back.</div>
            <div className="muted" style={{ marginTop: 10 }}>
              Everything you need in one playful hub: capture → organize → review → export.
            </div>
          </div>

          <div style={{ display:"flex", gap: 10, flexWrap:"wrap" }}>
            <a className="btn btnPrimary" href="/capture">📸 Quick Capture</a>
            <a className="btn" href="/documents">📚 Browse Library</a>
            <a className="btn" href="/admin">🛠️ Admin</a>
          </div>
        </div>
      </div>

      <div className="section grid2">
        <BigTile
          title="Capture"
          desc="Photo, Video, Voice Notes"
          emoji="📸"
          href="/capture"
          accent="radial-gradient(circle at 30% 30%, rgba(78,231,255,.50), transparent 60%)"
        />
        <BigTile
          title="Documents"
          desc="Auto-organized library"
          emoji="📚"
          href="/documents"
          accent="radial-gradient(circle at 30% 30%, rgba(124,255,107,.35), transparent 60%)"
        />
      </div>

      <div className="section grid3">
        <BigTile
          title="Finances"
          desc="Bills, subscriptions, receipts"
          emoji="💳"
          href="/finances"
          accent="radial-gradient(circle at 30% 30%, rgba(244,164,77,.45), transparent 60%)"
        />
        <BigTile
          title="Legal"
          desc="Issues, timelines, evidence"
          emoji="⚖️"
          href="/legal"
          accent="radial-gradient(circle at 30% 30%, rgba(255,92,168,.38), transparent 60%)"
        />
        <BigTile
          title="Admin"
          desc="Customize categories & modules"
          emoji="🛠️"
          href="/admin"
          accent="radial-gradient(circle at 30% 30%, rgba(106,168,255,.40), transparent 60%)"
        />
      </div>

      <div className="section grid3">
        <Stat label="Captured Today" value="0" hint="Photo / video / voice notes" />
        <Stat label="Documents" value="0" hint="Uploads + auto-category" />
        <Stat label="Open Items" value="0" hint="Things waiting for review" />
      </div>

      <div className="section glass cardPad">
        <div className="h2">Recent Activity</div>
        <div className="muted" style={{ marginTop: 10 }}>
          You have no activity yet. Start with <a className="pill" href="/capture">📸 Capture</a>.
        </div>
      </div>
    </div>
  );
}
