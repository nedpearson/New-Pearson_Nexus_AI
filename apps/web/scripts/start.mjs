import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import Busboy from "busboy";
import crypto from "crypto";
import { ingestAudioBytes, ingestDocumentBytes, ingestTextOnly } from "../server/ingestion/ingest.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

const distPath = path.join(__dirname, "../dist");

app.use(express.json({ limit: "2mb" }));

function requireAuth(req) {
  const secret = process.env.SYNC_SHARED_SECRET;
  if (!secret) return { ok: true, reason: "no-secret" };
  const h = req.headers.authorization || "";
  const token = String(h).startsWith("Bearer ") ? String(h).slice("Bearer ".length).trim() : "";
  if (token && token === secret) return { ok: true, reason: "bearer" };
  return { ok: false, reason: "unauthorized" };
}

function correlationId() {
  return crypto.randomUUID ? crypto.randomUUID() : ("cid_" + Math.random().toString(16).slice(2, 10) + "_" + Date.now().toString(16));
}

function noStore(res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("Pragma", "no-cache");
}

app.get("/health", (_req, res) => {
  res.setHeader("content-type", "application/json");
  return res.status(200).send(JSON.stringify({ ok: true }));
});

app.post("/api/sync", async (req, res) => {
  const auth = requireAuth(req);
  if (!auth.ok) return res.status(401).json({ error: "unauthorized" });

  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  if (!items.length) return res.json({ results: [] });

  const out = [];
  for (const it of items) {
    try {
      const cid = correlationId();
      const notes = String(it?.notes || "");
      const transcript = String(it?.transcript || "");
      const text = [notes, transcript].filter(Boolean).join("\n").trim();
      const r = await ingestTextOnly({
        id: String(it?.id || cid),
        correlationId: cid,
        source: String(it?.source || "sync"),
        captureType: String(it?.type || "text"),
        filename: it?.files?.[0]?.name,
        text,
      });
      out.push({ id: String(it?.id || ""), ok: true, hash: r.hash, status: r.route?.categoryId === "needs_review" ? "NEEDS_REVIEW" : "ROUTED" });
    } catch (e) {
      out.push({ id: String(it?.id || ""), ok: false, error: e instanceof Error ? e.message : String(e) });
    }
  }
  return res.json({ results: out });
});

function parseSingleFile(req) {
  return new Promise((resolve, reject) => {
    const bb = Busboy({ headers: req.headers, limits: { files: 1, fileSize: 25 * 1024 * 1024 } });
    let fileBytes = [];
    let fileInfo = null;
    let fields = {};

    bb.on("field", (name, val) => { fields[name] = val; });
    bb.on("file", (_name, stream, info) => {
      fileInfo = info;
      stream.on("data", (d) => fileBytes.push(d));
      stream.on("limit", () => reject(new Error("file too large")));
      stream.on("error", reject);
    });
    bb.on("error", reject);
    bb.on("finish", () => {
      const buf = Buffer.concat(fileBytes);
      resolve({ bytes: new Uint8Array(buf), fileInfo, fields });
    });
    req.pipe(bb);
  });
}

app.post("/upload/mobile", async (req, res) => {
  const cid = correlationId();
  try {
    const { bytes, fileInfo, fields } = await parseSingleFile(req);
    const mimeType = fileInfo?.mimeType || "application/octet-stream";
    const filename = fileInfo?.filename || "mobile_upload";
    const captureType = fields.captureType || "document";
    const r = await ingestDocumentBytes({ id: fields.id, correlationId: cid, source: "mobile", captureType, filename, mimeType, bytes });
    return res.json({ ok: true, correlationId: cid, hash: r.hash, routing: r.route, recordId: r.recordId });
  } catch (e) {
    return res.status(400).json({ ok: false, correlationId: cid, error: e instanceof Error ? e.message : String(e) });
  }
});

app.post("/upload/voice", async (req, res) => {
  const cid = correlationId();
  try {
    const { bytes, fileInfo, fields } = await parseSingleFile(req);
    const mimeType = fileInfo?.mimeType || "application/octet-stream";
    const filename = fileInfo?.filename || "voice_upload";
    const r = await ingestAudioBytes({ id: fields.id, correlationId: cid, source: "voice", filename, mimeType, bytes });
    return res.json({ ok: true, correlationId: cid, hash: r.hash, routing: r.route, recordId: r.recordId });
  } catch (e) {
    return res.status(400).json({ ok: false, correlationId: cid, error: e instanceof Error ? e.message : String(e) });
  }
});

app.use(express.static(distPath, {
  setHeaders(res, filePath) {
    const p = String(filePath || "");
    if (p.endsWith("index.html") || p.endsWith("sw.js") || p.endsWith("manifest.json")) {
      noStore(res);
      return;
    }
    if (p.includes(`${path.sep}assets${path.sep}`)) {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    }
  },
}));

// Express v5 (path-to-regexp v6+) does not accept "*" as a string route.
app.get(/.*/, (_req, res) => {
  noStore(res);
  return res.sendFile(path.join(distPath, "index.html"));
});

// Railway injects PORT; fall back to 8080 for local runs (matches Dockerfile convention)
const port = process.env.PORT || 8080;

app.listen(port, "0.0.0.0", () => {
  console.log("Server running on port", port);
});
