import { openDB, type DBSchema } from "idb";

export type CaptureType = "document" | "violation";

export type OfflineCapture = {
  id: string;
  type: CaptureType;
  createdAt: number;
  updatedAt: number;
  notes: string;
  transcript: string;
  files?: { name: string; type: string; size: number; lastModified: number }[];
};

type SyncResult = {
  id: string;
  ok: boolean;
  error?: string;
};

type QueueDb = DBSchema & {
  captures: {
    key: string;
    value: OfflineCapture;
    indexes: { "by-createdAt": number };
  };
};

const DB_NAME = "pnx_offline_queue_v1";
const STORE = "captures" as const;

function dispatchQueueChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("pnx-queue-changed"));
}

function dispatchAuthChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("pnx-auth-changed"));
}

async function db() {
  return openDB<QueueDb>(DB_NAME, 1, {
    upgrade(up) {
      const s = up.createObjectStore(STORE, { keyPath: "id" });
      s.createIndex("by-createdAt", "createdAt");
    },
  });
}

export function getSyncToken(): string | null {
  if (typeof window === "undefined") return null;
  const t = localStorage.getItem("pnx.syncToken");
  return t && t.trim() ? t.trim() : null;
}

export function setSyncToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("pnx.syncToken", token.trim());
  dispatchAuthChanged();
}

export function clearSyncToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("pnx.syncToken");
  dispatchAuthChanged();
}

export function isOnline(): boolean {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine;
}

export async function enqueueCapture(input: Omit<OfflineCapture, "id" | "createdAt" | "updatedAt">): Promise<OfflineCapture> {
  const now = Date.now();
  const item: OfflineCapture = {
    id: "cap_" + Math.random().toString(16).slice(2, 10),
    type: input.type,
    createdAt: now,
    updatedAt: now,
    notes: input.notes,
    transcript: input.transcript,
    files: input.files,
  };
  const d = await db();
  await d.put(STORE, item);
  dispatchQueueChanged();
  return item;
}

export async function listQueuedCaptures(): Promise<OfflineCapture[]> {
  const d = await db();
  const idx = d.transaction(STORE).store.index("by-createdAt");
  const all = await idx.getAll();
  return all.sort((a, b) => a.createdAt - b.createdAt);
}

export async function queuedCount(): Promise<number> {
  const d = await db();
  return d.count(STORE);
}

export async function removeQueuedCapture(id: string): Promise<void> {
  const d = await db();
  await d.delete(STORE, id);
  dispatchQueueChanged();
}

export async function syncQueuedCaptures(args?: { endpoint?: string }): Promise<{ ok: boolean; synced: number; failed: number; results: SyncResult[] }> {
  const endpoint = args?.endpoint || "/api/sync";
  const items = await listQueuedCaptures();
  if (!items.length) return { ok: true, synced: 0, failed: 0, results: [] };
  if (!isOnline()) return { ok: false, synced: 0, failed: items.length, results: items.map((i) => ({ id: i.id, ok: false, error: "offline" })) };

  const token = getSyncToken();
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (token) headers.authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({ items }),
    });
  } catch (e) {
    return {
      ok: false,
      synced: 0,
      failed: items.length,
      results: items.map((i) => ({ id: i.id, ok: false, error: e instanceof Error ? e.message : String(e) })),
    };
  }

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    return { ok: false, synced: 0, failed: items.length, results: items.map((i) => ({ id: i.id, ok: false, error: msg || String(res.status) })) };
  }

  const payload = (await res.json().catch(() => null)) as null | { results?: SyncResult[] };
  const results = Array.isArray(payload?.results) ? payload!.results! : items.map((i) => ({ id: i.id, ok: true }));

  let synced = 0;
  let failed = 0;
  for (const r of results) {
    if (r.ok) {
      synced += 1;
      await removeQueuedCapture(r.id);
    } else {
      failed += 1;
    }
  }
  dispatchQueueChanged();
  return { ok: failed === 0, synced, failed, results };
}

