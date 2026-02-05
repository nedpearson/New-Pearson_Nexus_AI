import React, { useEffect, useMemo, useState } from "react";
import { DEFAULT_DESKTOP_ORDER, DEFAULT_MOBILE_ORDER } from "./registry";
import type { ModuleKey, ModuleItem } from "./types";
import { SAMPLE_DATA } from "./data/sample";
import { loadData, loadLayout, saveData, saveLayout } from "./utils/store";
import type { LayoutState } from "./utils/store";
import { Brand } from "./components/Brand";
import { Button, Pill } from "./components/kit";
import { BusinessDashboardModule } from "../biz/modules/BusinessDashboardModule";
import { GuidesModule } from "../biz/modules/GuidesModule";
import { PlaceholderModule } from "../biz/modules/PlaceholderModule";
import { SidebarCustomizeModal } from "./components/SidebarCustomizeModal";
import { getDefaults } from "./nav/nav.defaults";
import { getEffectiveNav, validateDefaults } from "./nav/getEffectiveNav";
import type { SidebarPreferencesV1, ViewKey } from "./nav/nav.types";
import { defaultPrefsForDefaults, loadSidebarPrefs, saveSidebarPrefs } from "./nav/sidebarPrefs";

import { DashboardModule } from "./modules/DashboardModule";
import { DocumentsModule } from "./modules/DocumentsModule";
import { FinancesModule } from "./modules/FinancesModule";
import { LegalModule } from "./modules/LegalModule";
import { ReportsModule } from "./modules/ReportsModule";
import { AdminModule } from "./modules/AdminModule";
import { CalendarModule } from "./modules/CalendarModule";

function dotClass(accent: ModuleItem["accent"]) {
  return accent === "cyan" ? "pn-dot pn-cyan"
    : accent === "blue" ? "pn-dot pn-blue"
    : accent === "purple" ? "pn-dot pn-purple"
    : accent === "rose" ? "pn-dot pn-rose"
    : "pn-dot pn-amber";
}

export function AppShell() {
  type Mode = "personal" | "business";
  type BeforeInstallPromptEvent = Event & {
    prompt: () => Promise<void>;
    userChoice?: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  };
  const [mode, setMode] = useState<Mode>(() => {
    if (typeof window === "undefined") return "personal";
    return localStorage.getItem("pnx.mode") === "business" ? "business" : "personal";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("pnx.mode", mode);
  }, [mode]);

  const scope = mode; // namespace for localStorage (layout + data)
  const defaultDesktopOrder = DEFAULT_DESKTOP_ORDER;
  const defaultMobileOrder = DEFAULT_MOBILE_ORDER;
  const view: ViewKey = mode;
  const navDefaults = useMemo(() => getDefaults(view), [view]);

  // Keep defaults minimal; Admin can enable additional tabs.
  const defaultEnabled = useMemo((): Partial<Record<ModuleKey, boolean>> => ({
    dashboard: true,
    documents: true,
    finances: true,
    legal: true,
    reports: true,
    admin: true,
    // business-only keys remain off (still accessible from defaults in Business view)
    clients: false,
    invoices: false,
    projects: false,
    guides: false,
  }), []);

  const fallbackLayout = useMemo((): LayoutState => ({
    active: "dashboard",
    desktopOrder: defaultDesktopOrder,
    mobileOrder: defaultMobileOrder,
    userTier: "Pro",
    enabled: defaultEnabled,
    prefs: { showMore: false },
  }), [defaultDesktopOrder, defaultMobileOrder, defaultEnabled]);

  const [layout, setLayout] = useState<LayoutState>(() => fallbackLayout);
  const [data, setData] = useState(() => SAMPLE_DATA);

  // --- PWA install UX ---
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [mobileModalOpen, setMobileModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [sidebarPrefs, setSidebarPrefs] = useState<SidebarPreferencesV1>(() => defaultPrefsForDefaults(navDefaults));
  const [viewMode, setViewMode] = useState<"mobile" | "desktop">(() => {
    if (typeof window === "undefined") return "mobile";
    return (localStorage.getItem("pnx.ui.viewMode") === "desktop") ? "desktop" : "mobile";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("pnx.ui.viewMode", viewMode);
  }, [viewMode]);

  useEffect(() => {
    const loadedLayout = loadLayout(fallbackLayout, scope);
    setLayout(loadedLayout);
    setData(loadData(SAMPLE_DATA, scope));
    setSidebarPrefs(loadSidebarPrefs(view, loadedLayout, navDefaults));
  }, [scope, view, navDefaults, fallbackLayout]);

  useEffect(() => { saveLayout(layout, scope); }, [layout, scope]);
  useEffect(() => { saveData(data, scope); }, [data, scope]);
  useEffect(() => { saveSidebarPrefs(view, sidebarPrefs); }, [view, sidebarPrefs]);

  useEffect(() => {
    try { validateDefaults(navDefaults); } catch { /* ignore */ }
  }, [navDefaults]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkInstalled = () => {
      const standalone = window.matchMedia?.("(display-mode: standalone)")?.matches;
      const nav = window.navigator as Navigator & { standalone?: boolean };
      const iosStandalone = nav.standalone === true;
      setIsInstalled(Boolean(standalone || iosStandalone));
    };

    checkInstalled();

    const onBip: EventListener = (e) => {
      // Chrome/Edge: capture install prompt
      const maybe = e as unknown as BeforeInstallPromptEvent;
      maybe.preventDefault?.();
      if (typeof maybe.prompt === "function") setInstallPrompt(maybe);
    };
    const onInstalled = () => {
      setInstallPrompt(null);
      setIsInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", onBip);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBip);
      window.removeEventListener("appinstalled", onInstalled);
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

  const isAdmin = (layout.userTier === "Pro") || (sidebarPrefs.ownerMode === true);

  const effectiveNav = useMemo(() => {
    return getEffectiveNav({
      view,
      defaults: navDefaults,
      prefs: sidebarPrefs,
      userTier: layout.userTier,
      isAdmin,
    });
  }, [view, navDefaults, sidebarPrefs, layout.userTier, isAdmin]);

  const flatNavItems = useMemo(() => effectiveNav.headers.flatMap((h) => h.items), [effectiveNav.headers]);

  // Provide a ModuleItem list for the existing Admin module (keep it working).
  const adminModules = useMemo((): ModuleItem[] => {
    const seen = new Set<ModuleKey>();
    const pickAccent = (header: string): ModuleItem["accent"] =>
      header === "money" ? "amber"
        : header === "legal" ? "rose"
          : header === "admin" ? "purple"
            : header === "capture_docs" ? "blue"
              : "cyan";
    const out: ModuleItem[] = [];
    for (const it of navDefaults.items) {
      if (seen.has(it.path)) continue;
      seen.add(it.path);
      out.push({
        key: it.path,
        title: it.label,
        subtitle: "",
        tier: it.minTier || "Free",
        accent: pickAccent(it.header),
        icon: it.icon || "•",
      });
    }
    return out;
  }, [navDefaults.items]);

  function setActive(k: ModuleKey) {
    setLayout(prev => ({ ...prev, active: k }));
  }

  // If the currently-active item is hidden or admin-gated, bounce to Home.
  useEffect(() => {
    const stillVisible = flatNavItems.some((it) => it.path === layout.active);
    if (!stillVisible) setLayout((prev) => ({ ...prev, active: "dashboard" }));
  }, [flatNavItems, layout.active]);

  function quickCapture() {
    setActive("documents");
  }

  const header = useMemo(() => {
    switch (layout.active) {
      case "dashboard": return mode === "business"
        ? { t: "Business", s: "Clients, invoices, projects — simplified." }
        : { t: "Home", s: "Tiles, shortcuts, and what’s next." };
      case "calendar":  return { t: "Calendar", s: "Timeline and due dates (prototype placeholder)." };
      case "documents": return { t: "Capture", s: "Voice/video/notes — approve the category. It learns." };
      case "finances":  return { t: "Money", s: "Bills + expenses + quick pay links in one place." };
      case "legal":     return { t: "Legal", s: "Personal, divorce, custody — organized and easy." };
      case "reports":   return { t: "Reports", s: "Summaries, exports, and simple insights." };
      case "admin":     return { t: "Admin", s: "Tier + drag/drop tab order + categories." };
      default:          return { t: "PearsonNexusAI", s: "Prototype" };
    }
  }, [layout.active, mode]);

  const dashboardV2Enabled = layout.prefs?.dashboardV2 === true;

  const content = (
    <>
      {mode === "personal" && layout.active === "dashboard" && (
        <DashboardModule
          data={data}
          go={setActive}
          userTier={layout.userTier}
          isAdmin={isAdmin}
          dashboardV2Enabled={dashboardV2Enabled}
        />
      )}
      {mode === "business" && layout.active === "dashboard" && (
        <BusinessDashboardModule
          go={setActive}
          data={data}
          userTier={layout.userTier}
          isAdmin={isAdmin}
          dashboardV2Enabled={dashboardV2Enabled}
        />
      )}
      {layout.active === "calendar"  && <CalendarModule data={data} go={setActive} />}
      {layout.active === "documents" && <DocumentsModule data={data} setData={setData} />}
      {layout.active === "finances"  && <FinancesModule data={data} />}
      {layout.active === "legal"     && <LegalModule data={data} setData={setData} />}
      {layout.active === "reports"   && <ReportsModule data={data} view={mode} />}
      {layout.active === "guides"    && <GuidesModule />}
      {layout.active === "clients"   && <PlaceholderModule title="Clients" subtitle="Contacts, notes, status (prototype)" />}
      {layout.active === "invoices"  && <PlaceholderModule title="Invoices" subtitle="Create, send, track, export (prototype)" />}
      {layout.active === "projects"  && <PlaceholderModule title="Projects" subtitle="Work items + deliverables (prototype)" />}

      {layout.active === "admin"     && <AdminModule data={data} setData={setData} layout={layout} setLayout={setLayout} scope={scope} modules={adminModules} />}
    </>
  );

  const DESKTOP_ORDER: { key: ModuleKey; label: string; icon: string }[] = useMemo(() => ([
    { key: "dashboard", label: "Home", icon: "🏠" },
    { key: "calendar", label: "Calendar", icon: "📅" },
    { key: "finances", label: "Money", icon: "💳" },
    { key: "legal", label: "Legal", icon: "⚖️" },
    { key: "reports", label: "Reports", icon: "📊" },
    { key: "documents", label: "Capture / Documents", icon: "📸" },
    { key: "admin", label: "Admin", icon: "🛠️" },
  ]), []);

  const canonicalDesktopItems = useMemo(() => {
    // Enforce: show ONLY the canonical 7 items in this exact order (both Personal + Business).
    return DESKTOP_ORDER.filter((it) => {
      if (it.key === "admin") return isAdmin;
      return true;
    });
  }, [DESKTOP_ORDER, isAdmin]);

  return (
    <div className={["pn-grid", viewMode === "desktop" ? "pn-forceDesktop" : ""].join(" ")}>
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
              <div className="pn-row" style={{ marginBottom: 10 }}>
                <div style={{ fontWeight: 900 }}>Navigation</div>
                <Button onClick={() => setCustomizeOpen(true)} variant="ghost" title="Customize sidebar (show/hide, reorder, pin)">
                  Customize
                </Button>
              </div>

              <div className="pn-col">
                {canonicalDesktopItems.map((it) => {
                  const active = layout.active === it.key;
                  const accent: ModuleItem["accent"] =
                    it.key === "finances" ? "amber"
                      : it.key === "legal" ? "rose"
                        : it.key === "admin" ? "purple"
                          : it.key === "documents" ? "blue"
                            : "cyan";
                  return (
                    <button
                      key={it.key}
                      className={["pn-navBtn", active ? "pn-navBtnActive" : ""].join(" ")}
                      onClick={() => setActive(it.key)}
                      type="button"
                      aria-label={it.label}
                      title={it.label}
                    >
                      <div className="pn-row">
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <div className={dotClass(accent)} />
                          <div style={{ fontSize: 18 }}>{it.icon}</div>
                          <div style={{ fontWeight: 900 }}>{it.label}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
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
                  {viewMode === "desktop" && (
                    <Button
                      variant="ghost"
                      onClick={() => setViewMode("mobile")}
                      title="Return to mobile view"
                    >
                      Mobile view
                    </Button>
                  )}
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

      <SidebarCustomizeModal
        open={customizeOpen}
        onClose={() => setCustomizeOpen(false)}
        view={view}
        defaults={navDefaults}
        prefs={sidebarPrefs}
        setPrefs={setSidebarPrefs}
        isAdmin={isAdmin}
      />

      {/* Mobile bottom nav */}
      <div className="pn-mobileNav pn-card">
        <div className="pn-mobileGrid">
          {([
            { key: "finances" as const, label: "Money", icon: "💳", onClick: () => setActive("finances") },
            { key: "calendar" as const, label: "Calendar", icon: "📅", onClick: () => setActive("calendar") },
            { key: "documents" as const, label: "Documents", icon: "📄", onClick: () => setActive("documents") },
            { key: "desktop" as const, label: "Desktop", icon: "🖥️", onClick: () => setViewMode((v) => v === "desktop" ? "mobile" : "desktop") },
          ]).map((t) => {
            const active = (t.key === "desktop") ? (viewMode === "desktop") : (layout.active === t.key);
            return (
              <button
                key={t.key}
                className={["pn-mobileTab", active ? "pn-mobileTabActive" : ""].join(" ")}
                onClick={t.onClick}
                type="button"
                aria-label={t.label}
                title={t.label}
                style={{ minHeight: 54 }}
              >
                <div style={{ fontSize: 18 }}>{t.icon}</div>
                <div className="pn-small" style={{ marginTop: 4, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{t.label}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
