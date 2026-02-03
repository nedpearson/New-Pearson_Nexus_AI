import React, { useEffect, useMemo, useState } from "react";
import { MODULES, DEFAULT_DESKTOP_ORDER, DEFAULT_MOBILE_ORDER, isTierAllowed } from "./registry";
import type { ModuleKey, ModuleItem, Tier } from "./types";
import { SAMPLE_DATA } from "./data/sample";
import { loadData, loadLayout, saveData, saveLayout } from "./utils/store";
import type { LayoutState } from "./utils/store";
import { Brand } from "./components/Brand";
import { Button, Card, Pill } from "./components/kit";

import { DashboardModule } from "./modules/DashboardModule";
import { DocumentsModule } from "./modules/DocumentsModule";
import { FinancesModule } from "./modules/FinancesModule";
import { LegalModule } from "./modules/LegalModule";
import { AdminModule } from "./modules/AdminModule";

function dotClass(accent: ModuleItem["accent"]) {
  return accent === "cyan" ? "pn-dot pn-cyan"
    : accent === "blue" ? "pn-dot pn-blue"
    : accent === "purple" ? "pn-dot pn-purple"
    : accent === "rose" ? "pn-dot pn-rose"
    : "pn-dot pn-amber";
}

export function AppShell() {
  const fallbackLayout: LayoutState = {
    active: "dashboard",
    desktopOrder: DEFAULT_DESKTOP_ORDER,
    mobileOrder: DEFAULT_MOBILE_ORDER,
    userTier: "Pro",
  };

  const [layout, setLayout] = useState<LayoutState>(() => fallbackLayout);
  const [data, setData] = useState(() => SAMPLE_DATA);

  // --- PWA install UX ---
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [mobileModalOpen, setMobileModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLayout(loadLayout(fallbackLayout));
    setData(loadData(SAMPLE_DATA));
  }, []);

  useEffect(() => { saveLayout(layout); }, [layout]);
  useEffect(() => { saveData(data); }, [data]);

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

  const byKey = useMemo(() => new Map(MODULES.map(m => [m.key, m])), []);
  const desktopItems = layout.desktopOrder.map(k => byKey.get(k)!).filter(Boolean);
  const mobileItems = layout.mobileOrder.map(k => byKey.get(k)!).filter(Boolean);

  function setActive(k: ModuleKey) {
    setLayout(prev => ({ ...prev, active: k }));
  }

  function quickCapture() {
    setActive("documents");
  }

  const header = useMemo(() => {
    switch (layout.active) {
      case "dashboard": return { t: "Home", s: "Tiles, shortcuts, and what’s next." };
      case "documents": return { t: "Capture", s: "Voice/video/notes — approve the category. It learns." };
      case "finances":  return { t: "Money", s: "Bills + expenses + quick pay links in one place." };
      case "legal":     return { t: "Legal", s: "Personal, divorce, custody — organized and easy." };
      case "admin":     return { t: "Admin", s: "Tier + drag/drop tab order + categories." };
      default:          return { t: "PearsonNexusAI", s: "Prototype" };
    }
  }, [layout.active]);

  const content = (
    <>
      {layout.active === "dashboard" && <DashboardModule data={data} go={setActive} userTier={layout.userTier} />}
      {layout.active === "documents" && <DocumentsModule data={data} setData={setData} />}
      {layout.active === "finances"  && <FinancesModule data={data} />}
      {layout.active === "legal"     && <LegalModule data={data} setData={setData} />}
      {layout.active === "admin"     && <AdminModule data={data} setData={setData} layout={layout} setLayout={setLayout} />}
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
