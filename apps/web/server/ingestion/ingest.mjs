import { sha256Hex, stableJsonBytes } from "../utils/hash.mjs";
import { routeDocument } from "../routing/routeDocument.mjs";
import { persistIngestion } from "../storage/store.mjs";
import { AzureDocumentExtractor } from "../providers/document-intelligence/azure/AzureDocumentExtractor.mjs";
import { DeepgramSpeechTranscriber } from "../providers/speech/deepgram/DeepgramSpeechTranscriber.mjs";

function nowIso() {
  return new Date().toISOString();
}

function log(obj) {
  // Structured logs (Railway-friendly)
  console.log(JSON.stringify(obj));
}

function safeMime(m) {
  const s = String(m || "");
  return s && s.length < 120 ? s : "application/octet-stream";
}

export async function ingestTextOnly(input) {
  const correlationId = String(input.correlationId || "");
  const source = String(input.source || "web");
  const text = String(input.text || "");
  const captureType = input.captureType ? String(input.captureType) : undefined;
  const filename = input.filename ? String(input.filename) : undefined;

  const hash = sha256Hex(stableJsonBytes({ source, captureType, filename, text }));
  const startedAt = Date.now();

  const route = await routeDocument({
    docType: { name: "text", confidence: 0.0 },
    entities: [],
    keyValues: [],
    text,
    filename,
    source,
    captureType,
  });

  const record = {
    id: `ing_${hash}`,
    correlationId,
    receivedAt: nowIso(),
    source,
    type: captureType || "text",
    hash,
    filename: filename || null,
    mimeType: null,
    sizeBytes: null,
    extracted: {
      text,
      pages: [],
      tables: [],
      keyValues: [],
      entities: [],
      docType: { name: "text", confidence: 0.0 },
      confidence: 0.0,
      metadata: { mode: "text-only" },
    },
    routing: route,
    status: route.categoryId === "needs_review" ? "NEEDS_REVIEW" : "ROUTED",
    audit: { rules_applied: route.rules_applied || [], confidence: route.confidence || 0 },
  };

  const persisted = await persistIngestion(record);
  log({ level: "info", msg: "ingest.text_only", correlationId, hash, ms: Date.now() - startedAt, persisted });

  return { ok: true, hash, route, recordId: record.id, persisted };
}

export async function ingestDocumentBytes(input) {
  const correlationId = String(input.correlationId || "");
  const source = String(input.source || "web");
  const mimeType = safeMime(input.mimeType);
  const filename = input.filename ? String(input.filename) : undefined;
  const captureType = input.captureType ? String(input.captureType) : undefined;
  const bytes = input.bytes;

  const startedAt = Date.now();
  const hash = sha256Hex(bytes);

  const extractor = new AzureDocumentExtractor();
  const extracted = await extractor.extract({ bytes, mimeType, filename, correlationId });

  const route = await routeDocument({
    docType: extracted.docType,
    entities: extracted.entities,
    keyValues: extracted.keyValues,
    text: extracted.text,
    filename,
    source,
    captureType,
  });

  // Confidence gating: if extraction confidence is low, force review (deterministic).
  const FINAL_THRESHOLD = 0.9;
  const overallConfidence = Math.min(1, (extracted.confidence * 0.55) + (route.confidence * 0.45));
  const status = overallConfidence < FINAL_THRESHOLD ? "NEEDS_REVIEW" : "ROUTED";
  if (status === "NEEDS_REVIEW" && route.categoryId !== "needs_review") {
    // Hard gate: never auto-finalize low confidence routes.
    route.categoryId = "needs_review";
    route.folderPath = "needs_review";
    route.tags = Array.from(new Set([...(route.tags || []), "review"]));
    route.rules_applied = Array.from(new Set([...(route.rules_applied || []), "gate:overall_confidence"]));
  }

  const record = {
    id: `ing_${hash}`,
    correlationId,
    receivedAt: nowIso(),
    source,
    type: captureType || "document",
    hash,
    filename: filename || null,
    mimeType,
    sizeBytes: bytes?.byteLength || null,
    extracted,
    routing: { ...route, overallConfidence },
    status,
    audit: {
      rules_applied: route.rules_applied || [],
      extraction_confidence: extracted.confidence,
      routing_confidence: route.confidence,
      overall_confidence: overallConfidence,
    },
  };

  const persisted = await persistIngestion(record);
  log({ level: "info", msg: "ingest.document", correlationId, hash, ms: Date.now() - startedAt, persisted, overallConfidence });
  return { ok: true, hash, route: record.routing, recordId: record.id, persisted };
}

export async function ingestAudioBytes(input) {
  const correlationId = String(input.correlationId || "");
  const source = String(input.source || "voice");
  const mimeType = safeMime(input.mimeType);
  const filename = input.filename ? String(input.filename) : undefined;
  const bytes = input.bytes;

  const startedAt = Date.now();
  const hash = sha256Hex(bytes);

  const transcriber = new DeepgramSpeechTranscriber();
  const t = await transcriber.transcribe({ bytes, mimeType, filename, correlationId });

  // Basic deterministic entity hints (minimal, stable)
  const text = t.transcript || "";
  const route = await routeDocument({
    docType: { name: "audio", confidence: t.confidence },
    entities: [],
    keyValues: [],
    text,
    filename,
    source,
    captureType: "voice",
  });

  const FINAL_THRESHOLD = 0.9;
  const overallConfidence = Math.min(1, (t.confidence * 0.5) + (route.confidence * 0.5));
  const status = overallConfidence < FINAL_THRESHOLD ? "NEEDS_REVIEW" : "ROUTED";
  if (status === "NEEDS_REVIEW" && route.categoryId !== "needs_review") {
    route.categoryId = "needs_review";
    route.folderPath = "needs_review";
    route.tags = Array.from(new Set([...(route.tags || []), "review"]));
    route.rules_applied = Array.from(new Set([...(route.rules_applied || []), "gate:overall_confidence"]));
  }

  const record = {
    id: `ing_${hash}`,
    correlationId,
    receivedAt: nowIso(),
    source,
    type: "voice",
    hash,
    filename: filename || null,
    mimeType,
    sizeBytes: bytes?.byteLength || null,
    transcript: t.transcript,
    transcriptConfidence: t.confidence,
    routing: { ...route, overallConfidence },
    status,
    audit: { rules_applied: route.rules_applied || [], speech_confidence: t.confidence, overall_confidence: overallConfidence },
  };

  const persisted = await persistIngestion(record);
  log({ level: "info", msg: "ingest.voice", correlationId, hash, ms: Date.now() - startedAt, persisted, overallConfidence });
  return { ok: true, hash, route: record.routing, recordId: record.id, persisted };
}

