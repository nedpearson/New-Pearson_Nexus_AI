import type { ModuleItem, Tier } from "./types";

export const MODULES: ModuleItem[] = [
  // Default order (same for Personal + Business)
  { key: "dashboard", title: "Home",     subtitle: "Your daily hub",                         tier: "Free", accent: "cyan",   icon: "🏠" },
  { key: "finances",  title: "Money",    subtitle: "Bills • Expenses • Payment links",      tier: "Plus", accent: "amber",  icon: "💳" },
  { key: "legal",     title: "Legal",    subtitle: "Divorce • Custody • Personal",          tier: "Plus", accent: "rose",   icon: "⚖️" },
  { key: "documents", title: "Capture / Documents", subtitle: "Photo • Video • Voice • Files", tier: "Free", accent: "blue",   icon: "📸" },
  { key: "reports",   title: "Reports",  subtitle: "Summaries • Exports • Insights",        tier: "Free", accent: "blue",   icon: "📊" },
  { key: "admin",     title: "Admin",    subtitle: "Integrations • Tabs • Categories",      tier: "Pro",  accent: "purple", icon: "🛠️" },
];

export const TIER_ORDER: Tier[] = ["Free","Plus","Pro"];

export function isTierAllowed(userTier: Tier, required: Tier) {
  return TIER_ORDER.indexOf(userTier) >= TIER_ORDER.indexOf(required);
}

export const DEFAULT_DESKTOP_ORDER = MODULES.map(m => m.key);
export const DEFAULT_MOBILE_ORDER  = MODULES.map(m => m.key);
