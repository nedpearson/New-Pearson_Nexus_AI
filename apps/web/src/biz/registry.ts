import type { ModuleItem, Tier } from "../pn/types";

export const BUSINESS_MODULES: ModuleItem[] = [
  { key: "dashboard", title: "Business",  subtitle: "Overview + shortcuts",             tier: "Free", accent: "blue",   icon: "🏢" },
  { key: "clients",   title: "Clients",   subtitle: "Contacts, notes, status",         tier: "Free", accent: "cyan",   icon: "👥" },
  { key: "invoices",  title: "Invoices",  subtitle: "Create, send, track, export",     tier: "Plus", accent: "amber",  icon: "🧾" },
  { key: "projects",  title: "Projects",  subtitle: "Work items + deliverables",       tier: "Plus", accent: "purple", icon: "📁" },
  { key: "reports",   title: "Reports",   subtitle: "KPIs + summaries",                tier: "Plus", accent: "rose",   icon: "📊" },
  // Reuse the existing personal modules as business utilities (same simple shell)
  { key: "documents", title: "Documents", subtitle: "Library + uploads",               tier: "Free", accent: "blue",   icon: "📚" },
  { key: "finances",  title: "Finances",  subtitle: "Bills, receipts, subscriptions",  tier: "Plus", accent: "amber",  icon: "💳" },
  { key: "legal",     title: "Legal",     subtitle: "Contracts, issues, evidence",     tier: "Plus", accent: "rose",   icon: "⚖️" },
  { key: "guides",    title: "Guides",    subtitle: "Drill‑down docs & how‑tos",       tier: "Free", accent: "cyan",   icon: "🧭" },
  { key: "admin",     title: "Admin",     subtitle: "Tier + tab order + categories",   tier: "Pro",  accent: "purple", icon: "🛠️" }
];

export const BUSINESS_TIER_ORDER: Tier[] = ["Free", "Plus", "Pro"];

export const BUSINESS_DEFAULT_DESKTOP_ORDER = BUSINESS_MODULES.map((m) => m.key);
export const BUSINESS_DEFAULT_MOBILE_ORDER = [
  "dashboard",
  "clients",
  "invoices",
  "projects",
  "reports",
  "documents",
  "finances",
  "legal",
  "guides",
  "admin"
] satisfies (typeof BUSINESS_MODULES)[number]["key"][];

