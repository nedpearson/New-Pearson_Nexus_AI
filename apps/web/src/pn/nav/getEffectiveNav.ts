import type { Tier } from "../types";
import { HEADER_ORDER, type HeaderKey, type NavDefaults, type NavItemDef, type SidebarPreferencesV1, type ViewKey } from "./nav.types";

export type EffectiveNav = {
  view: ViewKey;
  headers: {
    key: HeaderKey;
    label: string;
    items: NavItemDef[];
  }[];
};

const HEADER_LABELS: Record<HeaderKey, string> = {
  home: "Home",
  money: "Money",
  legal: "Legal",
  capture_docs: "Capture / Documents",
  admin: "Admin",
};

function applyOrder(items: NavItemDef[], desired: string[] | undefined) {
  if (!desired?.length) return items;
  const byId = new Map(items.map((i) => [i.id, i] as const));
  const out: NavItemDef[] = [];
  for (const id of desired) {
    const it = byId.get(id);
    if (it) out.push(it);
  }
  for (const it of items) {
    if (!out.includes(it)) out.push(it);
  }
  return out;
}

export function getEffectiveNav(args: {
  view: ViewKey;
  defaults: NavDefaults;
  prefs: SidebarPreferencesV1;
  userTier: Tier;
  isAdmin: boolean;
  enabledFeatures?: Record<string, boolean>;
}): EffectiveNav {
  const { defaults, prefs, userTier, isAdmin, enabledFeatures } = args;

  const hidden = new Set(prefs.hiddenItemIds || []);
  const pinned = new Set(prefs.pinnedItemIds || []);

  // Filter by feature flags + admin gate + user hide/show.
  // NOTE: We intentionally do NOT filter by tier here; tier-locked items should remain visible but disabled.
  const visibleItems = defaults.items.filter((it) => {
    if (it.featureFlag && enabledFeatures && enabledFeatures[it.featureFlag] === false) return false;
    if (it.requiresAdmin && !isAdmin) return false;
    if (hidden.has(it.id)) return false;
    return true;
  });

  const byHeader = new Map<HeaderKey, NavItemDef[]>();
  for (const h of HEADER_ORDER) byHeader.set(h, []);
  for (const it of visibleItems) byHeader.get(it.header)!.push(it);

  const headers = HEADER_ORDER.map((h) => {
    const items = byHeader.get(h)!;
    const ordered = applyOrder(items, prefs.orderByHeader?.[h]);
    const pinnedItems = ordered.filter((i) => pinned.has(i.id));
    const rest = ordered.filter((i) => !pinned.has(i.id));
    return { key: h, label: HEADER_LABELS[h], items: [...pinnedItems, ...rest] };
  }).filter((h) => {
    // Admin header: hide entirely if gated off (no items).
    if (h.key === "admin" && !isAdmin) return false;
    return h.items.length > 0;
  });

  return { view: args.view, headers };
}

export function validateDefaults(defaults: NavDefaults) {
  const seen = new Set<string>();
  for (const it of defaults.items) {
    if (seen.has(it.id)) throw new Error(`Duplicate nav id: ${it.id}`);
    seen.add(it.id);
  }
}

