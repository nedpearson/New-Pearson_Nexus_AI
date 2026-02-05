import { putJsonArtifact, putOriginalArtifact } from "./storage/artifacts.mjs";
import { AzureDocumentExtractor } from "./providers/document-intelligence/azure/AzureDocumentExtractor.mjs";
import { DeepgramSpeechTranscriber } from "./providers/speech/deepgram/DeepgramSpeechTranscriber.mjs";

function envTrue(name) {
  const v = String(process.env[name] || "").trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes" || v === "on";
}

async function loadSuperagent() {
  // Bundled during build to apps/web/server/superagent-dist/index.mjs
  return await import("./superagent-dist/index.mjs");
}

function hasAzureDI() {
  return Boolean(process.env.AZURE_DI_ENDPOINT && process.env.AZURE_DI_KEY);
}

function hasDeepgram() {
  return Boolean(process.env.DEEPGRAM_API_KEY);
}

class AzureExtractorAdapter {
  constructor(correlationId) {
    this.name = "azure-document-intelligence";
    this.impl = new AzureDocumentExtractor();
    this.correlationId = correlationId;
  }
  async extract(input, ctx) {
    if (input.kind !== "buffer") {
      // URI mode not supported in this adapter.
      return {
        text: "",
        pages: [],
        tables: [],
        keyValues: [],
        entities: [],
        docType: { name: "unknown", confidence: 0 },
        confidence: 0,
        providerMeta: { provider: this.name, reason: "uri_not_supported" }
      };
    }
    const r = await this.impl.extract({
      bytes: new Uint8Array(input.buffer),
      mimeType: input.mimeType,
      filename: ctx.filename,
      correlationId: this.correlationId
    });
    return {
      text: r.text || "",
      pages: (r.pages || []).map((p) => ({ pageNumber: p.pageNumber, width: p.width, height: p.height })),
      tables: (r.tables || []).map((t) => ({
        title: undefined,
        confidence: undefined,
        cells: (t.cells || []).map((c) => ({ text: c.text, row: c.rowIndex, col: c.columnIndex })),
      })),
      keyValues: (r.keyValues || []).map((kv) => ({ key: kv.key, value: kv.value, confidence: kv.confidence })),
      entities: (r.entities || []).map((e) => ({ type: e.type, value: e.text, confidence: e.confidence })),
      docType: { name: r.docType?.name || "unknown", confidence: Number(r.docType?.confidence || 0) },
      confidence: Number(r.confidence || 0),
      providerMeta: r.metadata || { provider: this.name }
    };
  }
}

class DeepgramTranscriberAdapter {
  constructor(correlationId) {
    this.name = "deepgram";
    this.impl = new DeepgramSpeechTranscriber();
    this.correlationId = correlationId;
  }
  async transcribe(input, ctx) {
    if (input.kind !== "buffer") {
      return { text: "", confidence: 0, providerMeta: { provider: this.name, reason: "uri_not_supported" } };
    }
    const r = await this.impl.transcribe({
      bytes: new Uint8Array(input.buffer),
      mimeType: input.mimeType,
      filename: ctx.filename,
      correlationId: this.correlationId
    });
    return { text: r.transcript || "", confidence: Number(r.confidence || 0), providerMeta: r.metadata || { provider: this.name } };
  }
}

export function superagentDocsEnabled() {
  return envTrue("SUPERAGENT_DOCS_ENABLED");
}

export function superagentVoiceEnabled() {
  return envTrue("SUPERAGENT_VOICE_ENABLED");
}

export async function ingestDocumentViaSuperagent(args) {
  const sa = await loadSuperagent();
  const extractor =
    (String(process.env.SUPERAGENT_DOCS_PROVIDER || "").toLowerCase() === "azure" && hasAzureDI())
      ? new AzureExtractorAdapter(args.correlationId)
      : new sa.NullExtractor();

  const ctx = args.ctx;
  const input = { kind: "buffer", buffer: args.buffer, mimeType: args.mimeType };

  const storage = {
    putOriginal: async (sha256, _input, _ctx) => await putOriginalArtifact({ sha256, bytes: new Uint8Array(args.buffer), mimeType: args.mimeType }),
    putExtraction: async (sha256, json, _ctx) => await putJsonArtifact({ sha256, name: "extraction", json }),
  };

  return await sa.ingestDocument(extractor, input, ctx, storage, args.correlationId);
}

export async function ingestVoiceViaSuperagent(args) {
  const sa = await loadSuperagent();
  const transcriber =
    (String(process.env.SUPERAGENT_VOICE_PROVIDER || "").toLowerCase() === "deepgram" && hasDeepgram())
      ? new DeepgramTranscriberAdapter(args.correlationId)
      : new sa.NullTranscriber();

  const ctx = args.ctx;
  const input = { kind: "buffer", buffer: args.buffer, mimeType: args.mimeType };

  const storage = {
    putOriginalAudio: async (sha256, _input, _ctx) => await putOriginalArtifact({ sha256, bytes: new Uint8Array(args.buffer), mimeType: args.mimeType }),
    putTranscript: async (sha256, json, _ctx) => await putJsonArtifact({ sha256, name: "transcript", json }),
  };

  return await sa.ingestVoice(transcriber, input, ctx, storage, args.correlationId);
}

