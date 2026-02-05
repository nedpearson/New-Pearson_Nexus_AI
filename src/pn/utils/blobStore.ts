// Minimal IndexedDB blob store for persisted media (avoids broken blob: URLs after reload).
// Keyed by LibraryItem.id.

const DB_NAME = "pnx_blob_store_v1";
const STORE = "blobs";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function withStore<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const store = tx.objectStore(STORE);
      const req = fn(store);
      req.onsuccess = () => resolve(req.result as T);
      req.onerror = () => reject(req.error);
    });
  } finally {
    db.close();
  }
}

export async function putBlob(key: string, blob: Blob): Promise<void> {
  await withStore("readwrite", (s) => s.put(blob, key));
}

export async function getBlob(key: string): Promise<Blob | undefined> {
  const res = await withStore<Blob | undefined>("readonly", (s) => s.get(key));
  return res || undefined;
}

export async function deleteBlob(key: string): Promise<void> {
  await withStore("readwrite", (s) => s.delete(key));
}

