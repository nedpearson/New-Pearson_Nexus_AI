import type { NavDefaults } from "./nav.types";

/**
 * Default nav tree (single source of truth).
 *
 * NOTE: This app currently navigates by switching modules (ModuleKey) rather than URL routing.
 * We keep `path` as the existing ModuleKey to avoid breaking pages.
 */

export const PERSONAL_NAV_DEFAULTS: NavDefaults = {
  view: "personal",
  items: [
    // ---- Home ----
    { id: "home.dashboard", label: "Home", path: "dashboard", icon: "🏠", header: "home" },
    { id: "home.reports", label: "Reports", path: "reports", icon: "📊", header: "home" },
    { id: "home.guides", label: "Guides", path: "guides", icon: "🧭", header: "home" },

    // ---- Money ----
    { id: "money.finances", label: "Money", path: "finances", icon: "💳", header: "money", minTier: "Plus" },

    // ---- Legal ----
    { id: "legal.legal", label: "Legal", path: "legal", icon: "⚖️", header: "legal", minTier: "Plus" },

    // ---- Capture / Documents ----
    { id: "capdocs.documents", label: "Capture / Documents", path: "documents", icon: "📸", header: "capture_docs" },

    // ---- Admin ----
    { id: "admin.admin", label: "Admin", path: "admin", icon: "🛠️", header: "admin", minTier: "Pro", requiresAdmin: true },
  ],
};

export const BUSINESS_NAV_DEFAULTS: NavDefaults = {
  view: "business",
  items: [
    // ---- Home ----
    { id: "home.dashboard", label: "Home", path: "dashboard", icon: "🏠", header: "home" },
    { id: "home.clients", label: "Clients", path: "clients", icon: "👥", header: "home" },
    { id: "home.projects", label: "Projects", path: "projects", icon: "📁", header: "home", minTier: "Plus" },
    { id: "home.reports", label: "Reports", path: "reports", icon: "📊", header: "home" },
    { id: "home.guides", label: "Guides", path: "guides", icon: "🧭", header: "home" },

    // ---- Money ----
    { id: "money.finances", label: "Money", path: "finances", icon: "💳", header: "money", minTier: "Plus" },
    { id: "money.invoices", label: "Invoices", path: "invoices", icon: "🧾", header: "money", minTier: "Plus" },

    // ---- Legal ----
    { id: "legal.legal", label: "Legal", path: "legal", icon: "⚖️", header: "legal", minTier: "Plus" },

    // ---- Capture / Documents ----
    { id: "capdocs.documents", label: "Capture / Documents", path: "documents", icon: "📸", header: "capture_docs" },

    // ---- Admin ----
    { id: "admin.admin", label: "Admin", path: "admin", icon: "🛠️", header: "admin", minTier: "Pro", requiresAdmin: true },
  ],
};

export function getDefaults(view: "personal" | "business") {
  return view === "business" ? BUSINESS_NAV_DEFAULTS : PERSONAL_NAV_DEFAULTS;
}

