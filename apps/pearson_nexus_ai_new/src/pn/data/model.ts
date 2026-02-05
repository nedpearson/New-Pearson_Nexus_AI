export type CaptureKind = "photo" | "video" | "voice" | "note";

export type LibraryItem = {
  id: string;
  createdAt: number;
  kind: CaptureKind;
  title: string;
  text?: string;
  mediaUrl?: string;
  mime?: string;
  suggested: { category: string; score: number }[];
  approvedCategory?: string;
};

export type Category = {
  key: string;
  label: string;
  color: "cyan" | "blue" | "purple" | "rose" | "amber";
};

export type LearningRule = {
  token: string;
  categoryKey: string;
  weight: number;
};

export type AppData = {
  categories: Category[];
  library: LibraryItem[];
  learning: LearningRule[];
  bills: {
    id: string;
    name: string;
    amount: number;
    dueDay: number;
    website?: string;
    autopay?: boolean;
    status: "ok" | "due" | "late";
  }[];
  expenses: {
    id: string;
    vendor: string;
    amount: number;
    date: string; // ISO yyyy-mm-dd
    category: string;
    website?: string;
  }[];
  legal: {
    threads: {
      id: string;
      type: "personal" | "divorce" | "custody" | "other";
      title: string;
      notes: { id: string; createdAt: number; text: string }[];
      tasks: { id: string; title: string; done: boolean }[];
    }[];
  };
};
