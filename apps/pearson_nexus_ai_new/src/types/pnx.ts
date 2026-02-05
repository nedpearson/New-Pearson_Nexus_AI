export type PnxCategory = {
  id: string;
  name: string;
  color: string; // hex
  icon: string;  // emoji for now (no new deps)
};

export type PnxMediaType = "photo" | "video" | "audio" | "file";

export type PnxItem = {
  id: string;
  createdAt: number;
  title: string;
  description?: string;
  mediaType: PnxMediaType;
  fileName?: string;
  mimeType?: string;
  sizeBytes?: number;
  localUrl?: string; // object URL
  suggestedCategoryId?: string;
  approvedCategoryId?: string;
  status: "needs_approval" | "approved";
  tags?: string[];
};

export type PnxSettings = {
  userDisplayName: string;
  autoSuggestEnabled: boolean;
};

export type PnxDb = {
  categories: PnxCategory[];
  items: PnxItem[];
  settings: PnxSettings;
};
