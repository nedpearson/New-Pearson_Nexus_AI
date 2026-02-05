const API_VERSION = "2024-11-30";

function requiredEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function toText(result) {
  // Azure DI returns fullContent in some models; otherwise join lines.
  const content = result?.analyzeResult?.content;
  if (typeof content === "string" && content.trim()) return content;
  const pages = Array.isArray(result?.analyzeResult?.pages) ? result.analyzeResult.pages : [];
  const lines = pages.flatMap((p) => Array.isArray(p.lines) ? p.lines : []);
  return lines.map((l) => l.content).filter(Boolean).join("\n");
}

function toDocType(result) {
  const docs = Array.isArray(result?.analyzeResult?.documents) ? result.analyzeResult.documents : [];
  const top = docs[0];
  const name = String(top?.docType || "unknown");
  const confidence = typeof top?.confidence === "number" ? top.confidence : 0.0;
  return { name, confidence };
}

function toTables(result) {
  const tables = Array.isArray(result?.analyzeResult?.tables) ? result.analyzeResult.tables : [];
  return tables.map((t) => ({
    rowCount: Number(t.rowCount || 0),
    columnCount: Number(t.columnCount || 0),
    cells: (Array.isArray(t.cells) ? t.cells : []).map((c) => ({
      rowIndex: Number(c.rowIndex || 0),
      columnIndex: Number(c.columnIndex || 0),
      text: String(c.content || ""),
    })),
  }));
}

function toKeyValues(result) {
  const kvps = Array.isArray(result?.analyzeResult?.keyValuePairs) ? result.analyzeResult.keyValuePairs : [];
  return kvps.map((kv) => ({
    key: String(kv?.key?.content || ""),
    value: String(kv?.value?.content || ""),
    confidence: typeof kv?.confidence === "number" ? kv.confidence : undefined,
  })).filter((x) => x.key || x.value);
}

function toPages(result) {
  const pages = Array.isArray(result?.analyzeResult?.pages) ? result.analyzeResult.pages : [];
  return pages.map((p) => ({
    pageNumber: Number(p.pageNumber || 0),
    width: typeof p.width === "number" ? p.width : undefined,
    height: typeof p.height === "number" ? p.height : undefined,
    unit: typeof p.unit === "string" ? p.unit : undefined,
    lines: (Array.isArray(p.lines) ? p.lines : []).map((l) => ({
      text: String(l.content || ""),
      confidence: typeof l.confidence === "number" ? l.confidence : undefined,
    })),
  }));
}

function computeConfidence(result) {
  const dt = toDocType(result);
  const pages = toPages(result);
  const lineConf = pages.flatMap((p) => p.lines || []).map((l) => l.confidence).filter((n) => typeof n === "number");
  const avgLine = lineConf.length ? (lineConf.reduce((a, b) => a + b, 0) / lineConf.length) : 0.0;
  // Conservative blend: docType confidence tends to be reliable for model-based classification.
  const blended = Math.max(0, Math.min(1, (dt.confidence * 0.6) + (avgLine * 0.4)));
  return blended;
}

export class AzureDocumentExtractor {
  constructor(opts = {}) {
    this.endpoint = opts.endpoint || process.env.AZURE_DI_ENDPOINT || "";
    this.key = opts.key || process.env.AZURE_DI_KEY || "";
    this.modelId = opts.modelId || process.env.AZURE_DI_MODEL_ID || "prebuilt-document";
  }

  async extract({ bytes, mimeType, filename, correlationId }) {
    const endpoint = this.endpoint || requiredEnv("AZURE_DI_ENDPOINT");
    const key = this.key || requiredEnv("AZURE_DI_KEY");
    const modelId = this.modelId;

    const url = `${endpoint.replace(/\/+$/,"")}/documentintelligence/documentModels/${encodeURIComponent(modelId)}:analyze?api-version=${API_VERSION}`;

    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Content-Type": mimeType || "application/octet-stream",
        "x-ms-client-request-id": correlationId,
        ...(filename ? { "x-ms-useragent": filename } : {}),
      },
      body: bytes,
    });

    if (resp.status !== 202) {
      const t = await resp.text().catch(() => "");
      throw new Error(`Azure DI analyze failed: ${resp.status} ${t}`);
    }

    const opLoc = resp.headers.get("operation-location") || resp.headers.get("Operation-Location");
    if (!opLoc) throw new Error("Azure DI missing operation-location");

    // Poll with backoff (deterministic, bounded).
    for (let i = 0; i < 18; i++) {
      await sleep(350 + i * 150);
      const r = await fetch(opLoc, {
        headers: {
          "Ocp-Apim-Subscription-Key": key,
          "x-ms-client-request-id": correlationId,
        },
      });
      const j = await r.json().catch(() => null);
      const status = String(j?.status || "");
      if (status === "succeeded") {
        const text = toText(j);
        const pages = toPages(j);
        const tables = toTables(j);
        const keyValues = toKeyValues(j);
        const docType = toDocType(j);
        const confidence = computeConfidence(j);
        return {
          text,
          pages,
          tables,
          keyValues,
          entities: [], // Azure DI exposes entities in some models; keep empty for prebuilt-document.
          docType,
          confidence,
          metadata: {
            provider: "azure-document-intelligence",
            modelId,
            apiVersion: API_VERSION,
          },
        };
      }
      if (status === "failed") {
        throw new Error(`Azure DI analyze failed: ${JSON.stringify(j)}`);
      }
    }
    throw new Error("Azure DI analyze timed out");
  }
}

