import type { IDocumentExtractor, DocumentInput } from "../providers/document-intelligence/IDocumentExtractor";
import type { IngestContext, IngestResult, StoredArtifact } from "../types";
import { sha256OfBuffer } from "../utils/hash";
import { routeDocument } from "../routing/routeDocument";

/**
 * NOTE: storage is abstracted as callbacks so this file stays framework-neutral.
 */
export type StorageAdapters = {
  putOriginal: (sha256: string, input: DocumentInput, ctx: IngestContext) => Promise<string>;
  putExtraction: (sha256: string, extractionJson: unknown, ctx: IngestContext) => Promise<string>;
};

export async function ingestDocument(
  extractor: IDocumentExtractor,
  input: DocumentInput,
  ctx: IngestContext,
  storage: StorageAdapters,
  correlationId: string
): Promise<IngestResult> {

  // sha256 for idempotency (buffer only; if uri, caller should supply sha or re-download)
  const sha256 =
    input.kind === "buffer"
      ? await sha256OfBuffer(input.buffer)
      : `uri:${Buffer.from(input.uri).toString("base64url")}`;

  const originalUri = await storage.putOriginal(sha256, input, ctx);

  const extraction = await extractor.extract(input, ctx);
  const routing = routeDocument(extraction, ctx);

  const extractionUri = await storage.putExtraction(sha256, {
    extraction,
    routing,
    ctx,
    correlationId,
    provider: extractor.name
  }, ctx);

  const stored: StoredArtifact = {
    sha256,
    originalUri,
    extractionUri,
    createdAt: new Date().toISOString()
  };

  return {
    sha256,
    extraction,
    routing,
    stored,
    correlationId
  };
}

