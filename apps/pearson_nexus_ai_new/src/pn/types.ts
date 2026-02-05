export type Tier = "Free" | "Plus" | "Pro";

export type ModuleKey = "dashboard" | "documents" | "finances" | "legal" | "admin";

export type ModuleItem = {
  key: ModuleKey;
  title: string;
  subtitle: string;
  tier: Tier;
  accent: "cyan" | "blue" | "purple" | "rose" | "amber";
  icon: string;
};
