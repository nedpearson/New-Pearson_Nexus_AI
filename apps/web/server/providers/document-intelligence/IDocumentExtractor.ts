export type Page = {
  pageNumber: number;
  width?: number;
  height?: number;
  unit?: string;
  lines?: { text: string; confidence?: number }[];
};

export type Table = {
  rowCount: number;
  columnCount: number;
  cells: { rowIndex: number; columnIndex: number; text: string }[];
};

export type KV = { key: string; value: string; confidence?: number };

export type Entity = { type: string; text: string; confidence?: number };

export type DocumentExtractResult = {
  text: string;
  pages: Page[];
  tables: Table[];
  keyValues: KV[];
  entities: Entity[];
  docType: { name: string; confidence: number };
  confidence: number;
  metadata: Record<string, unknown>;
};

export type ExtractInput = {
  bytes: Uint8Array;
  mimeType: string;
  filename?: string;
  correlationId: string;
};

export interface IDocumentExtractor {
  extract(input: ExtractInput): Promise<DocumentExtractResult>;
}

