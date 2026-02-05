export type Tier = "Free" | "Plus" | "Pro";

// Shared keys (Personal + Business). Business adds extra tabs but we keep the same simple shell UI.
export type ModuleKey =
  | "dashboard"
  | "documents"
  | "finances"
  | "legal"
  | "admin"
  // business-only tabs
  | "clients"
  | "invoices"
  | "projects"
  | "reports"
  | "guides";

export type ModuleItem = {
  key: ModuleKey;
  title: string;
  subtitle: string;
  tier: Tier;
  accent: "cyan" | "blue" | "purple" | "rose" | "amber";
  icon: string;
};
