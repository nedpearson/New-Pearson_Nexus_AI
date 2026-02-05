import React, { useEffect, useMemo, useState } from "react";
import { MODULES, DEFAULT_DESKTOP_ORDER, DEFAULT_MOBILE_ORDER, isTierAllowed } from "./registry";
import type { ModuleKey, ModuleItem, Tier } from "./types";
import { SAMPLE_DATA } from "./data/sample";
import { loadData, loadLayout, saveData, saveLayout } from "./utils/store";
import type { LayoutState } from "./utils/store";
import { Brand } from "./components/Brand";
import { Button, Card, Pill } from "./components/kit";
import { BusinessDashboardModule } from "../biz/modules/BusinessDashboardModule";

import { DashboardModule } from "./modules/DashboardModule";
import { DocumentsModule } from "./modules/DocumentsModule";
import { FinancesModule } from "./modules/FinancesModule";
import { LegalModule } from "./modules/LegalModule";
import { AdminModule } from "./modules/AdminModule";

const SIDEBAR_KEYS: ModuleKey[] = ["dashboard", "documents", "finances", "legal", "admin"];

const GUIDE_LINKS: { label: string; href: string }[] = [
  { label: "Install on Phone", href: "/INSTALL_ON_PHONE_GUIDE.md" },
  { label: "Mobile App Guide", href: "/MOBILE_APP_GUIDE.md" },
  { label: "PWA Deployment", href: "/PWA_DEPLOYMENT_GUIDE.md" },
  { label: "Financial + Legal", href: "/FINANCIAL_LEGAL_GUIDE.md" },
];

function dotClass(accent: ModuleItem["accent"]) {
  return accent === "cyan" ? "pn-dot pn-cyan"
    : accent === "blue" ? "pn-dot pn-blue"
    : accent === "purple" ? "pn-dot pn-purple"
    : accent === "rose" ? "pn-dot pn-rose"
    : "pn-dot pn-amber";
}

export function AppShell() {
  type Mode = "personal" | "business";
  const [mode, setMode] = useState<Mode>(() => {
    if (typeof window === "undefined") return "personal";
    return localStorage.getItem("pnx.mode") === "business" ? "business" : "personal";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("pnx.mode", mode);
  }, [mode]);

  const scope = mode; // namespace for localStorage (layout + data)
  const activeModules = MODULES; // same sidebar tabs for Personal + Business
  const defaultDesktopOrder = DEFAULT_DESKTOP_ORDER;
  const defaultMobileOrder = DEFAULT_MOBILE_ORDER;

  // Keep defaults minimal; Admin can enable additional tabs.
  const defaultEnabled = useMemo((): Partial<Record<ModuleKey, boolean>> => ({
    dashboard: true,
    documents: true,
    finances: true,
    legal: true,
    admin: true,
    // business-only keys remain off unless you bring them back later
    clients: false,
    invoices: false,
    projects: false,
    reports: false,
    guides: false,
  }), []);

  const fallbackLayout: LayoutState = {
    active: "dashboard",
    desktopOrder: defaultDesktopOrder,
    mobileOrder: defaultMobileOrder,
    userTier: "Pro",
    enabled: defaultEnabled,
  };

  const [layout, setLayout] = useState<LayoutState>(() => fallbackLayout);
  const [data, setData] = useState(() => SAMPLE_DATA);

  // --- PWA install UX ---
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [mobileModalOpen, setMobileModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    setLayout(loadLayout(fallbackLayout, scope));
    setData(loadData(SAMPLE_DATA, scope));
  }, [scope]);

  useEffect(() => { saveLayout(layout, scope); }, [layout, scope]);
  useEffect(() => { saveData(data, scope); }, [data, scope]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkInstalled = () => {
      const standalone = window.matchMedia?.("(display-mode: standalone)")?.matches;
      const iosStandalone = (window.navigator as any)?.standalone === true;
      setIsInstalled(Boolean(standalone || iosStandalone));
    };

    checkInstalled();

    const onBip = (e: any) => {
      // Chrome/Edge: capture install prompt
      e.preventDefault?.();
      setInstallPrompt(e);
    };
    const onInstalled = () => {
      setInstallPrompt(null);
      setIsInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", onBip as any);
    window.addEventListener("appinstalled", onInstalled as any);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBip as any);
      window.removeEventListener("appinstalled", onInstalled as any);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (typeof window === "undefined") return;
        const url = window.location.origin;
        // Lazy-load QR lib so we don't bloat initial boot.
        const QRCode = (await import("qrcode")).default;
        const dataUrl = await QRCode.toDataURL(url, {
          margin: 1,
          width: 92,
          color: { dark: "#0b1020", light: "#ffffff" },
        });
        if (!cancelled) setQrDataUrl(dataUrl);
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function doInstall() {
    if (!installPrompt) return;
    try {
      await installPrompt.prompt();
      await installPrompt.userChoice?.catch?.(() => null);
    } finally {
      setInstallPrompt(null);
    }
  }

  async function copyLink() {
    try {
      const url = window.location.origin;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  const byKey = useMemo(() => new Map(activeModules.map(m => [m.key, m])), [activeModules]);
  const enabled = layout.enabled || defaultEnabled;
  const isEnabled = (k: ModuleKey) => enabled[k] !== false; // default true unless explicitly false

  // Sidebar is identical for Personal + Business: fixed, core tabs only.
  const desktopItems = SIDEBAR_KEYS
    .filter((k) => isEnabled(k))
    .map((k) => byKey.get(k))
    .filter(Boolean) as ModuleItem[];

  const mobileItems = SIDEBAR_KEYS
    .filter((k) => isEnabled(k))
    .map((k) => byKey.get(k))
    .filter(Boolean) as ModuleItem[];

  function openGuide(e: React.MouseEvent, href: string) {
    e.preventDefault();
    e.stopPropagation();
    window.open(href, "_blank", "noreferrer");
  }

  function drilldownsFor(k: ModuleKey): { label: string; href?: string }[] {
    if (k === "dashboard") {
      return mode === "business"
        ? [
          { label: "Business drill-downs" },
          { label: "Clients" },
          { label: "Invoices" },
          { label: "Projects" },
          { label: "Reports" },
          { label: "Guides" },
          ...GUIDE_LINKS,
        ]
        : [
          { label: "Personal drill-downs" },
          { label: "Today" },
          { label: "Pinned" },
          { label: "Guides" },
          ...GUIDE_LINKS,
        ];
    }
    if (k === "documents") {
      const cats = (data.categories || []).map((c) => c.label).slice(0, 6);
      const more = Math.max(0, (data.categories || []).length - cats.length);
      const out = [
        { label: "Categories" },
        ...cats.map((c) => ({ label: c })),
      ];
      if (more) out.push({ label: `+${more} more…` });
      return out;
    }
    if (k === "finances") {
      return mode === "business"
        ? [
          { label: "Invoices" },
          { label: "Expenses" },
          { label: "Receipts" },
          { label: "Payment links" },
        ]
        : [
          { label: "Bills" },
          { label: "Expenses" },
          { label: "Payment links" },
        ];
    }
    if (k === "legal") {
      return mode === "business"
        ? [
          { label: "Contracts" },
          { label: "Issues" },
          { label: "Evidence" },
          { label: "Open guide", href: "/FINANCIAL_LEGAL_GUIDE.md" },
        ]
        : [
          { label: "Divorce" },
          { label: "Custody" },
          { label: "Evidence" },
          { label: "Open guide", href: "/FINANCIAL_LEGAL_GUIDE.md" },
        ];
    }
    if (k === "admin") {
      return [
        { label: "Tier" },
        { label: "Reorder tabs" },
        { label: "Categories" },
      ];
    }
    return [];
  }

  function setActive(k: ModuleKey) {
    setLayout(prev => ({ ...prev, active: k }));
  }

  // If the currently-active tab is disabled, bounce to dashboard.
  useEffect(() => {
    if (!isEnabled(layout.active)) {
      setLayout((prev) => ({ ...prev, active: "dashboard" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, layout.active, JSON.stringify(enabled)]);

  function quickCapture() {
    setActive("documents");
  }

  const header = useMemo(() => {
    switch (layout.active) {
      case "dashboard": return mode === "business"
        ? { t: "Business", s: "Clients, invoices, projects — simplified." }
        : { t: "Home", s: "Tiles, shortcuts, and what’s next." };
      case "documents": return { t: "Capture", s: "Voice/video/notes — approve the category. It learns." };
      case "finances":  return { t: "Money", s: "Bills + expenses + quick pay links in one place." };
      case "legal":     return { t: "Legal", s: "Personal, divorce, custody — organized and easy." };
      case "clients":   return { t: "Clients", s: "Contacts, notes, status." };
      case "invoices":  return { t: "Invoices", s: "Create, send, track, export." };
      case "projects":  return { t: "Projects", s: "Work items + deliverables." };
      case "reports":   return { t: "Reports", s: "KPIs + summaries." };
      case "guides":    return { t: "Guides", s: "Drill‑down docs & how‑tos." };
      case "admin":     return { t: "Admin", s: "Tier + drag/drop tab order + categories." };
      default:          return { t: "PearsonNexusAI", s: "Prototype" };
    }
  }, [layout.active, mode]);

  const content = (
    <>
      {mode === "personal" && layout.active === "dashboard" && <DashboardModule data={data} go={setActive} userTier={layout.userTier} />}
      {mode === "business" && layout.active === "dashboard" && <BusinessDashboardModule go={setActive} />}
      {layout.active === "documents" && <DocumentsModule data={data} setData={setData} />}
      {layout.active === "finances"  && <FinancesModule data={data} />}
      {layout.active === "legal"     && <LegalModule data={data} setData={setData} />}

      {layout.active === "admin"     && <AdminModule data={data} setData={setData} layout={layout} setLayout={setLayout} scope={scope} modules={activeModules} />}
    </>
  );

  return (
    <div className="pn-grid">
      <div className="pn-wrap">
        <div className="pn-layout">
          {/* Sidebar (desktop) */}
          <div className="pn-sidebar">
            <div className="pn-card pn-p pn-col">
              <Brand />
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop: 8 }}>
                <Pill>Tier: {layout.userTier}</Pill>
                <Pill>Desktop</Pill>
              </div>
            </div>

            <div className="pn-card pn-p" style={{ marginTop: 14 }}>
              <div className="pn-col">
                {desktopItems.map(m => {
                  const allowed = isTierAllowed(layout.userTier as Tier, m.tier);
                  const active = layout.active === m.key;
                  const drill = drilldownsFor(m.key);
                  return (
                    <button
                      key={m.key}
                      className={["pn-navBtn", active ? "pn-navBtnActive" : ""].join(" ")}
                      onClick={() => allowed && setActive(m.key)}
                      disabled={!allowed}
                      type="button"
                      title={!allowed ? `Unlock in ${m.tier}` : m.subtitle}
                      style={{ opacity: allowed ? 1 : .45, cursor: allowed ? "pointer" : "not-allowed" }}
                    >
                      <div className="pn-row">
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <div className={dotClass(m.accent)} />
                          <div style={{ fontSize: 18 }}>{m.icon}</div>
                          <div>
                            <div style={{ fontWeight: 900 }}>{m.title}</div>
                            <div className="pn-small pn-muted">{m.subtitle}</div>
                            {!!drill.length && (
                              <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
                                {drill.map((d) => {
                                  const isLink = Boolean(d.href);
                                  const style: React.CSSProperties = {
                                    fontSize: 11,
                                    lineHeight: 1,
                                    padding: "6px 8px",
                                    borderRadius: 999,
                                    border: "1px solid rgba(255,255,255,.14)",
                                    background: "rgba(255,255,255,.06)",
                                    color: "rgba(238,242,255,.78)",
                                    cursor: isLink ? "pointer" : "default",
                                  };
                                  return isLink ? (
                                    <a
                                      key={d.label + d.href}
                                      href={d.href}
                                      onClick={(e) => openGuide(e, d.href!)}
                                      style={style}
                                      title={d.label}
                                    >
                                      {d.label}
                                    </a>
                                  ) : (
                                    <span key={d.label} style={style} title={d.label}>{d.label}</span>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                        {!allowed && <span className="pn-badge">🔒 {m.tier}</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pn-card pn-p" style={{ marginTop: 14 }}>
              <div className="pn-small pn-muted">Drag/drop reorder is in Admin. All saved locally for this prototype.</div>
            </div>
          </div>

          {/* Main */}
          <div className="pn-col pn-content">
            <div className="pn-card pn-p">
              <div className="pn-row">
                <div>
                  <div className="pn-h1">{header.t}</div>
                  <div className="pn-small pn-muted">{header.s}</div>
                </div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
                  <div
                    style={{
                      display: "flex",
                      border: "1px solid rgba(255,255,255,.18)",
                      background: "rgba(255,255,255,.06)",
                      borderRadius: 999,
                      overflow: "hidden",
                    }}
                    title="Switch between Personal and Business"
                  >
                    <button
                      type="button"
                      onClick={() => setMode("personal")}
                      style={{
                        padding: "8px 10px",
                        border: "none",
                        background: mode === "personal" ? "rgba(255,255,255,.18)" : "transparent",
                        color: "rgba(238,242,255,.92)",
                        fontWeight: 850,
                        cursor: "pointer",
                      }}
                    >
                      Personal
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode("business")}
                      style={{
                        padding: "8px 10px",
                        border: "none",
                        background: mode === "business" ? "rgba(255,255,255,.18)" : "transparent",
                        color: "rgba(238,242,255,.92)",
                        fontWeight: 850,
                        cursor: "pointer",
                      }}
                    >
                      Business
                    </button>
                  </div>
                  <Pill>{layout.userTier}</Pill>
                  <Button
                    onClick={doInstall}
                    variant="primary"
                    disabled={isInstalled || !installPrompt}
                    style={isInstalled || !installPrompt ? { opacity: 0.9 } : undefined}
                    title={isInstalled ? "Already installed" : (installPrompt ? "Install the desktop app" : "Install not available yet (open in Chrome/Edge)")}                  >
                    {isInstalled ? "Installed" : "Install Desktop App"}
                  </Button>
                  <Button variant="primary" onClick={() => setMobileModalOpen(true)} title="Open on your phone and install to Home Screen">
                    Install on Phone
                  </Button>
                  <button
                    type="button"
                    onClick={() => setMobileModalOpen(true)}
                    title="Scan to open on your phone"
                    style={{
                      display: "grid",
                      gap: 6,
                      alignItems: "center",
                      justifyItems: "center",
                      padding: 8,
                      borderRadius: 16,
                      border: "1px solid rgba(255,255,255,.18)",
                      background: "rgba(255,255,255,.07)",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ width: 46, height: 46, borderRadius: 10, overflow: "hidden", background: "#fff", display: "grid", placeItems: "center" }}>
                      {qrDataUrl ? (
                        <img src={qrDataUrl} alt="QR code for phone install" width={46} height={46} style={{ display: "block" }} />
                      ) : (
                        <div style={{ width: 46, height: 46, display: "grid", placeItems: "center", color: "#0b1020", fontWeight: 900 }}>QR</div>
                      )}
                    </div>
                    <div className="pn-small pn-muted" style={{ lineHeight: 1, whiteSpace: "nowrap" }}>Phone</div>
                  </button>
                  <Button variant="primary" onClick={quickCapture}>Quick Capture</Button>
                </div>
              </div>
            </div>

            {mobileModalOpen && (
              <div
                role="dialog"
                aria-modal="true"
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 9999,
                  background: "rgba(0,0,0,.55)",
                  display: "grid",
                  placeItems: "center",
                  padding: 14,
                }}
                onClick={() => setMobileModalOpen(false)}
              >
                <div className="pn-card pn-p" style={{ maxWidth: 720, width: "100%" }} onClick={(e) => e.stopPropagation()}>
                  <div className="pn-row" style={{ marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 16 }}>Install on Phone</div>
                      <div className="pn-small pn-muted">Open this link on your phone, then “Add to Home Screen”.</div>
                    </div>
                    <Button onClick={() => setMobileModalOpen(false)} title="Close">Close</Button>
                  </div>

                  <div className="pn-card pn-p" style={{ background: "rgba(0,0,0,.18)" }}>
                    <div className="pn-small pn-muted">Link</div>
                    <div style={{ fontWeight: 800, wordBreak: "break-all", marginTop: 6 }}>{typeof window !== "undefined" ? window.location.origin : ""}</div>
                    <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <Button onClick={copyLink} variant="primary">{copied ? "Copied!" : "Copy Link"}</Button>
                      <Button onClick={() => window.open(window.location.origin, "_blank")}>Open Link</Button>
                    </div>
                  </div>

                  <div style={{ marginTop: 12 }} className="pn-small pn-muted">
                    iPhone/iPad: Safari → Share → “Add to Home Screen”.<br />
                    Android: Chrome → menu (⋮) → “Install app” / “Add to Home screen”.
                  </div>
                </div>
              </div>
            )}

            <div className="pn-col" style={{ marginTop: 14 }}>
              {content}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="pn-mobileNav pn-card">
        <div className="pn-mobileGrid">
          {mobileItems.slice(0, 5).map(m => {
            const allowed = isTierAllowed(layout.userTier as Tier, m.tier);
            const active = layout.active === m.key;
            return (
              <button
                key={m.key}
                className={["pn-mobileTab", active ? "pn-mobileTabActive" : ""].join(" ")}
                onClick={() => allowed && setActive(m.key)}
                disabled={!allowed}
                type="button"
                title={!allowed ? `Unlock in ${m.tier}` : m.title}
                style={{ opacity: allowed ? 1 : .45, cursor: allowed ? "pointer" : "not-allowed" }}
              >
                <div style={{ fontSize: 18 }}>{m.icon}</div>
                <div className="pn-small" style={{ marginTop: 4, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{m.title}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
