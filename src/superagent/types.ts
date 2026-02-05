export type UploadSource = "web" | "mobile" | "email" | "api" | "voice";

export type Sensitivity = "public" | "internal" | "confidential" | "restricted";

export type RoutingDecision = {
  categoryId: string;
  folderPath: string;
  tags: string[];
  sensitivity: Sensitivity;
  retentionPolicy?: string;
  confidence: number;
  needsReview: boolean;
  reasons: string[];
};

export type DocType = { name: string; confidence: number };

export type KV = { key: string; value: string; confidence?: number };
export type Entity = { type: string; value: string; confidence?: number };

export type TableCell = { text: string; row: number; col: number };
export type Table = { title?: string; cells: TableCell[]; confidence?: number };

export type Page = {
  pageNumber: number;
  text?: string;
  width?: number;
  height?: number;
  rotation?: number;
};

export type NormalizedExtraction = {
  text: string;
  pages: Page[];
  tables: Table[];
  keyValues: KV[];
  entities: Entity[];
  docType: DocType;
  confidence: number; // overall
  providerMeta: Record<string, unknown>;
};

export type IngestContext = {
  userId: string;
  orgId?: string;
  source: UploadSource;
  filename?: string;
  mimeType?: string;
  capturedAt?: string; // ISO
  // Mobile capture metadata
  device?: { platform?: string; model?: string };
  capture?: { isScan?: boolean; hasAutoCrop?: boolean; rotationApplied?: boolean };
};

export type StoredArtifact = {
  sha256: string;
  originalUri: string;
  extractionUri?: string;
  transcriptUri?: string;
  createdAt: string; // ISO
};

export type IngestResult = {
  sha256: string;
  extraction?: NormalizedExtraction;
  transcript?: { text: string; confidence: number };
  routing: RoutingDecision;
  stored: StoredArtifact;
  correlationId: string;
};

