import type { ModuleKey, Tier } from "../types";

export type HeaderKey = "home" | "money" | "legal" | "capture_docs" | "admin";

export const HEADER_ORDER: HeaderKey[] = ["home", "money", "legal", "capture_docs", "admin"];

export type ViewKey = "personal" | "business";

export type NavItemDef = {
  /** Stable string ID (do not change once shipped) */
  id: string;
  label: string;
  /** Existing navigation target. In this app it's a ModuleKey (internal module switch). */
  path: ModuleKey;
  icon?: string;
  header: HeaderKey;
  /**
   * If true, this item exists in defaults but starts hidden.
   * Users can enable it in Customize Sidebar.
   */
  defaultHidden?: boolean;
  /** Optional gate. If omitted, item is available for all tiers/roles. */
  minTier?: Tier;
  /** Optional gate for Admin/owner-only. */
  requiresAdmin?: boolean;
  /** Optional feature flag name. */
  featureFlag?: string;
};

export type NavDefaults = {
  view: ViewKey;
  items: NavItemDef[];
};

export type SidebarPreferencesV1 = {
  version: 1;
  /** Explicitly hidden items. Any item not listed here is visible by default. */
  hiddenItemIds: string[];
  /** Per-header ordering override (items not listed append automatically). */
  orderByHeader: Partial<Record<HeaderKey, string[]>>;
  /** Optional: pinned items float to top within their header. */
  pinnedItemIds: string[];
  /** Placeholder permission gate if no auth system exists. */
  ownerMode?: boolean;
};

export function isHeaderKey(x: string): x is HeaderKey {
  return (HEADER_ORDER as string[]).includes(x);
}

