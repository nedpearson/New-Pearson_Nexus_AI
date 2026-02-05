import type { IDocumentExtractor, DocumentInput } from "./IDocumentExtractor";
import type { IngestContext, NormalizedExtraction } from "../../types";

/**
 * Safe placeholder that never guesses.
 * Use until you wire Google DocAI / Azure / ABBYY / Textract.
 */
export class NullExtractor implements IDocumentExtractor {
  public readonly name = "null-extractor";

  async extract(input: DocumentInput, ctx: IngestContext): Promise<NormalizedExtraction> {
    const filename = ctx.filename ?? "unknown";
    return {
      text: "",
      pages: [],
      tables: [],
      keyValues: [],
      entities: [],
      docType: { name: "unknown", confidence: 0 },
      confidence: 0,
      providerMeta: { inputKind: input.kind, filename }
    };
  }
}

