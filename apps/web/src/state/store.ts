import { loadDb, saveDb, uid, now } from "@/data/db";
import { suggestCategory, learnFromApproval } from "@/utils/categorizer";
import { PnxDb, PnxItem, PnxMediaType, PnxCategory } from "@/types/pnx";

type Listener = () => void;

class Store {
  private db: PnxDb = loadDb();
  private listeners = new Set<Listener>();

  get snapshot() { return this.db; }

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit() { for (const l of this.listeners) l(); }

  private persist() { saveDb(this.db); this.emit(); }

  setUserName(name: string) { this.db.settings.userDisplayName = name; this.persist(); }
  toggleAutoSuggest(v: boolean) { this.db.settings.autoSuggestEnabled = v; this.persist(); }

  addCategory(cat: { name: string; color: string; icon: string; }) {
    const id = uid("cat");
    this.db.categories.unshift({ id, ...cat });
    this.persist();
  }

  removeCategory(id: string) {
    this.db.categories = this.db.categories.filter(c => c.id !== id);
    // unassign items
    this.db.items = this.db.items.map(i => {
      if (i.approvedCategoryId === id) return { ...i, approvedCategoryId: undefined, status: "needs_approval" };
      if (i.suggestedCategoryId === id) return { ...i, suggestedCategoryId: undefined, status: "needs_approval" };
      return i;
    });
    this.persist();
  }

  addItem(input: {
    title: string;
    description?: string;
    mediaType: PnxMediaType;
    fileName?: string;
    mimeType?: string;
    sizeBytes?: number;
    localUrl?: string;
  }) {
    const item: PnxItem = {
      id: uid("itm"),
      createdAt: now(),
      title: input.title,
      description: input.description,
      mediaType: input.mediaType,
      fileName: input.fileName,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      localUrl: input.localUrl,
      status: "needs_approval"
    };

    if (this.db.settings.autoSuggestEnabled) {
      const suggested = suggestCategory(this.db, item);
      item.suggestedCategoryId = suggested;
    }

    this.db.items.unshift(item);
    this.persist();
    return item;
  }

  approveItem(itemId: string, categoryId: string) {
    const idx = this.db.items.findIndex(i => i.id === itemId);
    if (idx < 0) return;
    const item = this.db.items[idx];
    item.approvedCategoryId = categoryId;
    item.status = "approved";
    // learning loop
    learnFromApproval(this.db, item);
    this.persist();
  }

  rejectSuggestion(itemId: string) {
    const idx = this.db.items.findIndex(i => i.id === itemId);
    if (idx < 0) return;
    const item = this.db.items[idx];
    item.suggestedCategoryId = undefined;
    item.status = "needs_approval";
    this.persist();
  }

  updateItem(itemId: string, patch: Partial<PnxItem>) {
    const idx = this.db.items.findIndex(i => i.id === itemId);
    if (idx < 0) return;
    this.db.items[idx] = { ...this.db.items[idx], ...patch };
    this.persist();
  }

  getCategory(id?: string): PnxCategory | undefined {
    if (!id) return undefined;
    return this.db.categories.find(c => c.id === id);
  }
}

export const store = new Store();
