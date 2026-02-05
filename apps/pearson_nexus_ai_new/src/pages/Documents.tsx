import React from "react";

function FolderTile(props: { name: string; count: string; emoji: string }) {
  return (
    <div className="tile" style={{ minHeight: 120 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div className="pill"><span style={{ fontSize: 16 }}>{props.emoji}</span>{props.name}</div>
        <span className="badge">{props.count}</span>
      </div>
      <div className="muted" style={{ marginTop: 12 }}>Tap to open folder</div>
    </div>
  );
}

export default function Documents() {
  return (
    <div>
      <div className="glass cardPad">
        <div className="h1">Documents</div>
        <div className="muted" style={{ marginTop: 10 }}>
          Your auto-organized library (tiles first, not lists).
        </div>
        <div style={{ display:"flex", gap: 10, marginTop: 14, flexWrap:"wrap" }}>
          <button className="btn btnPrimary" type="button">Upload</button>
          <button className="btn" type="button">Create Folder</button>
          <button className="btn" type="button">Search</button>
        </div>
      </div>

      <div className="section grid3">
        <FolderTile emoji="📄" name="Inbox" count="0" />
        <FolderTile emoji="🏠" name="Home" count="0" />
        <FolderTile emoji="👶" name="Kids" count="0" />
        <FolderTile emoji="💼" name="Work" count="0" />
        <FolderTile emoji="💳" name="Bills & Receipts" count="0" />
        <FolderTile emoji="⚖️" name="Legal Evidence" count="0" />
      </div>

      <div className="section glass cardPad">
        <div className="h2">Next step</div>
        <div className="muted" style={{ marginTop: 10 }}>
          Upload something or use <a className="pill" href="/capture">📸 Capture</a> and approve the category.
        </div>
      </div>
    </div>
  );
}
