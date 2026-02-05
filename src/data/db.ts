import { PnxDb } from "@/types/pnx";

const KEY = "pnx_db_v1";

export function now() { return Date.now(); }
export function uid(prefix = "pnx") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

export function defaultDb(): PnxDb {
  return {
    categories: [
      { id: "cat_docs", name: "Documents", color: "#6AA8FF", icon: "📄" },
      { id: "cat_bills", name: "Bills & Expenses", color: "#F4A44D", icon: "💳" },
      { id: "cat_legal", name: "Legal", color: "#FF5DA2", icon: "⚖️" },
      { id: "cat_photos", name: "Photos", color: "#4EE7FF", icon: "📸" },
      { id: "cat_voice", name: "Voice Notes", color: "#66F2B4", icon: "🎙️" },
      { id: "cat_cases", name: "Case Evidence", color: "#A78BFA", icon: "🧾" }
    ],
    items: [
      {
        id: "itm_demo_1",
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
        title: "Sample: Bank statement",
        description: "Demo item to show the tiles + approval flow.",
        mediaType: "file",
        fileName: "bank_statement.pdf",
        mimeType: "application/pdf",
        sizeBytes: 248000,
        suggestedCategoryId: "cat_bills",
        approvedCategoryId: "cat_bills",
        status: "approved",
        tags: ["demo", "finance"]
      },
      {
        id: "itm_demo_2",
        createdAt: Date.now() - 1000 * 60 * 60 * 20,
        title: "Sample: Voice note about timeline",
        description: "A demo voice note entry.",
        mediaType: "audio",
        fileName: "voice_note.webm",
        mimeType: "audio/webm",
        sizeBytes: 98000,
        suggestedCategoryId: "cat_voice",
        status: "needs_approval"
      }
    ],
    settings: {
      userDisplayName: "Sarah Johnson",
      autoSuggestEnabled: true
    }
  };
}

export function loadDb(): PnxDb {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const db = defaultDb();
      localStorage.setItem(KEY, JSON.stringify(db));
      return db;
    }
    return JSON.parse(raw) as PnxDb;
  } catch {
    const db = defaultDb();
    localStorage.setItem(KEY, JSON.stringify(db));
    return db;
  }
}

export function saveDb(db: PnxDb) {
  localStorage.setItem(KEY, JSON.stringify(db));
}
