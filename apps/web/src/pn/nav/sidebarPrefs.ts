import type { LayoutState } from "../utils/store";
import { isHeaderKey, type HeaderKey, type NavDefaults, type SidebarPreferencesV1, type ViewKey } from "./nav.types";

const PREFS_VERSION = 1 as const;

function prefsKey(view: ViewKey) {
  return `pnx.sidebarPrefs.v${PREFS_VERSION}.${view}`;
}

export function defaultPrefsForDefaults(defaults: NavDefaults): SidebarPreferencesV1 {
  const hidden = defaults.items.filter((i) => i.defaultHidden).map((i) => i.id);
  return {
    version: PREFS_VERSION,
    hiddenItemIds: hidden,
    orderByHeader: {},
    pinnedItemIds: [],
    ownerMode: false,
  };
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function coerce(raw: unknown): SidebarPreferencesV1 | null {
  if (!isRecord(raw)) return null;
  if (raw.version !== PREFS_VERSION) return null;
  const orderByHeader: SidebarPreferencesV1["orderByHeader"] = {};
  if (isRecord(raw.orderByHeader)) {
    for (const [k, v] of Object.entries(raw.orderByHeader)) {
      if (!isHeaderKey(k)) continue;
      if (!Array.isArray(v)) continue;
      orderByHeader[k] = v.filter((x): x is string => typeof x === "string");
    }
  }
  return {
    version: PREFS_VERSION,
    hiddenItemIds: Array.isArray(raw.hiddenItemIds) ? raw.hiddenItemIds.filter((x): x is string => typeof x === "string") : [],
    orderByHeader,
    pinnedItemIds: Array.isArray(raw.pinnedItemIds) ? raw.pinnedItemIds.filter((x): x is string => typeof x === "string") : [],
    ownerMode: raw.ownerMode === true,
  };
}

/** One-time migration from the legacy LayoutState ordering + enabled flags. */
export function migrateLegacyLayoutToPrefs(layout: LayoutState, defaults: NavDefaults): SidebarPreferencesV1 {
  const next = defaultPrefsForDefaults(defaults);

  // Hide items that were previously disabled in Admin.
  const enabled = layout.enabled || {};
  for (const it of defaults.items) {
    const k = it.path;
    if (enabled[k] === false) next.hiddenItemIds.push(it.id);
  }

  // Preserve legacy order by mapping module order -> per-header order.
  const orderIndex = new Map<string, number>();
  layout.desktopOrder.forEach((k, idx) => orderIndex.set(String(k), idx));

  const byHeader: Partial<Record<HeaderKey, string[]>> = {};
  for (const it of defaults.items) {
    const idx = orderIndex.get(String(it.path));
    if (idx === undefined) continue;
    const arr = (byHeader[it.header] ||= []);
    arr.push(it.id);
  }
  for (const h of Object.keys(byHeader) as HeaderKey[]) {
    byHeader[h] = (byHeader[h] || []).sort((a, b) => {
      const ia = orderIndex.get(String(defaults.items.find((x) => x.id === a)?.path ?? "")) ?? 9999;
      const ib = orderIndex.get(String(defaults.items.find((x) => x.id === b)?.path ?? "")) ?? 9999;
      return ia - ib;
    });
  }
  next.orderByHeader = byHeader;

  return next;
}

export function loadSidebarPrefs(view: ViewKey, layout: LayoutState | undefined, defaults: NavDefaults): SidebarPreferencesV1 {
  if (typeof window === "undefined") return defaultPrefsForDefaults(defaults);
  try {
    const raw = localStorage.getItem(prefsKey(view));
    if (raw) {
      const parsed = coerce(JSON.parse(raw));
      if (parsed) return parsed;
    }
  } catch {
    // ignore
  }

  // No saved prefs yet. If we have a legacy layout, migrate for continuity.
  if (layout) {
    const migrated = migrateLegacyLayoutToPrefs(layout, defaults);
    saveSidebarPrefs(view, migrated);
    return migrated;
  }
  return defaultPrefsForDefaults(defaults);
}

export function saveSidebarPrefs(view: ViewKey, prefs: SidebarPreferencesV1) {
  if (typeof window === "undefined") return;
  localStorage.setItem(prefsKey(view), JSON.stringify(prefs));
}

export function clearSidebarPrefs(view: ViewKey) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(prefsKey(view));
}

