import React from "react";

function AdminCard(props: { title: string; emoji: string; desc: string }) {
  return (
    <div className="tile" style={{ minHeight: 160 }}>
      <div className="pill"><span style={{ fontSize: 16 }}>{props.emoji}</span>{props.title}</div>
      <div className="muted" style={{ marginTop: 12 }}>{props.desc}</div>
      <div style={{ display:"flex", gap: 10, marginTop: 14, flexWrap:"wrap" }}>
        <button className="btn btnPrimary" type="button">Edit</button>
        <button className="btn" type="button">Preview</button>
      </div>
    </div>
  );
}

export default function Admin() {
  return (
    <div>
      <div className="glass cardPad">
        <div className="h1">Admin</div>
        <div className="muted" style={{ marginTop: 10 }}>
          Customize categories, modules, and subscription tiers. Push custom features to individual users.
        </div>
        <div style={{ display:"flex", gap: 10, marginTop: 14, flexWrap:"wrap" }}>
          <span className="badge">Categories</span>
          <span className="badge">Modules</span>
          <span className="badge">Per-user features</span>
        </div>
      </div>

      <div className="section grid3">
        <AdminCard emoji="🧭" title="Category Builder" desc="Create/edit taxonomies & approval flows." />
        <AdminCard emoji="🧩" title="Module Builder" desc="Toggle modules per subscription tier." />
        <AdminCard emoji="💎" title="Custom Feature Deploy" desc="Ship special features to one customer." />
      </div>

      <div className="section glass cardPad">
        <div className="h2">Quick toggle (demo)</div>
        <div className="muted" style={{ marginTop: 10 }}>
          Later: persist these settings. For now, this is a UI prototype.
        </div>
        <div style={{ display:"flex", gap: 10, marginTop: 14, flexWrap:"wrap" }}>
          <button className="btn btnPrimary" type="button">Enable Voice Notes</button>
          <button className="btn" type="button">Enable Web Links</button>
          <button className="btn" type="button">Enable Legal Modules</button>
        </div>
      </div>
    </div>
  );
}
