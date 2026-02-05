import { ModuleItem, Tier } from "./types";

export const MODULES: ModuleItem[] = [
  { key: "dashboard", title: "Home",     subtitle: "Your daily hub",                    tier: "Free", accent: "cyan",   icon: "🏠" },
  { key: "documents", title: "Capture",  subtitle: "Photo • Video • Voice • Notes",    tier: "Free", accent: "blue",   icon: "📸" },
  { key: "finances",  title: "Money",    subtitle: "Bills • Expenses • Payment links", tier: "Plus", accent: "amber",  icon: "💳" },
  { key: "legal",     title: "Legal",    subtitle: "Divorce • Custody • Personal",     tier: "Plus", accent: "rose",   icon: "⚖️" },
  { key: "admin",     title: "Admin",    subtitle: "Reorder tabs • Categories • Tier", tier: "Pro",  accent: "purple", icon: "🛠️" },
];

export const TIER_ORDER: Tier[] = ["Free","Plus","Pro"];

export function isTierAllowed(userTier: Tier, required: Tier) {
  return TIER_ORDER.indexOf(userTier) >= TIER_ORDER.indexOf(required);
}

export const DEFAULT_DESKTOP_ORDER = MODULES.map(m => m.key);
export const DEFAULT_MOBILE_ORDER  = MODULES.map(m => m.key);
