import type { NormalizedExtraction, IngestContext } from "../../types";

export type DocumentInput =
  | { kind: "buffer"; buffer: Buffer; mimeType: string }
  | { kind: "uri"; uri: string; mimeType?: string };

export interface IDocumentExtractor {
  readonly name: string;

  /**
   * Extract text + structure + entities + docType.
   * Must be deterministic for a given input/provider version.
   */
  extract(input: DocumentInput, ctx: IngestContext): Promise<NormalizedExtraction>;
}

