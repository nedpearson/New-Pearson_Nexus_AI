import React from "react";

export function Card(props: { title?: string; subtitle?: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="pn-card pn-p">
      {(props.title || props.subtitle || props.right) && (
        <div className="pn-row" style={{ marginBottom: 10 }}>
          <div>
            {props.title && <div className="pn-h1">{props.title}</div>}
            {props.subtitle && <div className="pn-small pn-muted">{props.subtitle}</div>}
          </div>
          {props.right}
        </div>
      )}
      {props.children}
    </div>
  );
}

export function Pill(props: { children: React.ReactNode }) {
  return <span className="pn-pill">{props.children}</span>;
}

export function Button(props: { children: React.ReactNode; onClick?: () => void; variant?: "ghost"|"primary"; disabled?: boolean; title?: string }) {
  const cls = props.variant === "primary" ? "pn-btn pn-btnPrimary" : "pn-btn";
  return (
    <button className={cls} onClick={props.onClick} disabled={props.disabled} title={props.title}>
      {props.children}
    </button>
  );
}

export function Tile(props: { title: string; subtitle: string; icon: string; badge?: string; onClick?: () => void }) {
  return (
    <button className="pn-tile" onClick={props.onClick} type="button">
      <div className="pn-row">
        <div style={{ fontSize: 24 }}>{props.icon}</div>
        {props.badge && <span className="pn-badge">{props.badge}</span>}
      </div>
      <div style={{ marginTop: 10 }}>
        <div style={{ fontWeight: 800 }}>{props.title}</div>
        <div className="pn-small pn-muted">{props.subtitle}</div>
      </div>
    </button>
  );
}
