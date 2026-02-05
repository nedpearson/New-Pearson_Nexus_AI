import React from "react";

type NavItem = { href: string; label: string; emoji: string; tone: "cyan"|"blue"|"amber"|"pink"|"lime" };

const items: NavItem[] = [
  { href: "/", label: "Dashboard", emoji: "✨", tone: "cyan" },
  { href: "/capture", label: "Capture", emoji: "📸", tone: "blue" },
  { href: "/documents", label: "Documents", emoji: "📚", tone: "lime" },
  { href: "/finances", label: "Finances", emoji: "💳", tone: "amber" },
  { href: "/legal", label: "Legal", emoji: "⚖️", tone: "pink" },
  { href: "/admin", label: "Admin", emoji: "🛠️", tone: "blue" },
];

function toneColor(t: NavItem["tone"]) {
  if (t === "cyan") return "rgba(78,231,255,.22)";
  if (t === "blue") return "rgba(106,168,255,.22)";
  if (t === "amber") return "rgba(244,164,77,.22)";
  if (t === "pink") return "rgba(255,92,168,.20)";
  return "rgba(124,255,107,.18)";
}

export function Sidebar() {
  const path = (typeof window !== "undefined" ? window.location.pathname : "/") || "/";

  return (
    <aside style={{
      position:"fixed",
      top: 18,
      left: 18,
      bottom: 18,
      width: 86,
      borderRadius: 28,
      padding: 12,
    }} className="glass">
      <a href="/" style={{ display:"grid", placeItems:"center", marginTop: 6, marginBottom: 10 }}>
        <img src="/logo.png" alt="PearsonNexusAI" style={{ width: 48, height: 48, borderRadius: 14, border:"1px solid rgba(255,255,255,.14)" }} />
      </a>

      <div style={{ display:"grid", gap: 10, marginTop: 8 }}>
        {items.map((it) => {
          const active = path === it.href || (it.href !== "/" && path.startsWith(it.href));
          return (
            <a
              key={it.href}
              href={it.href}
              title={it.label}
              style={{
                display:"grid",
                placeItems:"center",
                height: 54,
                borderRadius: 18,
                border: "1px solid rgba(255,255,255,.12)",
                background: active ? toneColor(it.tone) : "rgba(255,255,255,.04)",
                transform: active ? "translateY(-1px)" : "none",
                transition: "all .12s ease"
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 900 }}>{it.emoji}</div>
            </a>
          );
        })}
      </div>

      <div style={{ position:"absolute", left: 12, right: 12, bottom: 12 }}>
        <div className="tile" style={{ padding: 12, borderRadius: 20 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ fontWeight: 950, fontSize: 12 }}>Demo</div>
            <div className="badge">ON</div>
          </div>
          <div className="muted" style={{ fontSize: 11, marginTop: 6 }}>Playful UI</div>
        </div>
      </div>
    </aside>
  );
}
