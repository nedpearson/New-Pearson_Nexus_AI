import type { LayoutState } from "../utils/store";
import type { HeaderKey, NavDefaults, SidebarPreferencesV1, ViewKey } from "./nav.types";

const PREFS_VERSION = 1 as const;

function prefsKey(view: ViewKey) {
  return `pnx.sidebarPrefs.v${PREFS_VERSION}.${view}`;
}

export function defaultPrefs(): SidebarPreferencesV1 {
  return {
    version: PREFS_VERSION,
    hiddenItemIds: [],
    orderByHeader: {},
    pinnedItemIds: [],
    ownerMode: false,
  };
}

function coerce(raw: any): SidebarPreferencesV1 | null {
  if (!raw || typeof raw !== "object") return null;
  if (raw.version !== PREFS_VERSION) return null;
  return {
    version: PREFS_VERSION,
    hiddenItemIds: Array.isArray(raw.hiddenItemIds) ? raw.hiddenItemIds.filter((x: any) => typeof x === "string") : [],
    orderByHeader: (raw.orderByHeader && typeof raw.orderByHeader === "object") ? raw.orderByHeader : {},
    pinnedItemIds: Array.isArray(raw.pinnedItemIds) ? raw.pinnedItemIds.filter((x: any) => typeof x === "string") : [],
    ownerMode: Boolean(raw.ownerMode),
  };
}

/** One-time migration from the legacy LayoutState ordering + enabled flags. */
export function migrateLegacyLayoutToPrefs(layout: LayoutState, defaults: NavDefaults): SidebarPreferencesV1 {
  const next = defaultPrefs();

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
      const ia = orderIndex.get(defaults.items.find((x) => x.id === a)?.path as any as string) ?? 9999;
      const ib = orderIndex.get(defaults.items.find((x) => x.id === b)?.path as any as string) ?? 9999;
      return ia - ib;
    });
  }
  next.orderByHeader = byHeader;

  return next;
}

export function loadSidebarPrefs(view: ViewKey, layout: LayoutState | undefined, defaults: NavDefaults): SidebarPreferencesV1 {
  if (typeof window === "undefined") return defaultPrefs();
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
  return defaultPrefs();
}

export function saveSidebarPrefs(view: ViewKey, prefs: SidebarPreferencesV1) {
  if (typeof window === "undefined") return;
  localStorage.setItem(prefsKey(view), JSON.stringify(prefs));
}

export function clearSidebarPrefs(view: ViewKey) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(prefsKey(view));
}

