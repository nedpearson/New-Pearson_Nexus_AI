import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

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

function categorizeCapture(capture) {
  const t = String(capture?.type || "document");
  const notes = String(capture?.notes || "").toLowerCase();
  const rules = [];

  let category_group = "person";
  if (notes.includes("invoice") || notes.includes("client") || notes.includes("project") || notes.includes("vendor")) {
    category_group = "business";
    rules.push("keyword:business_terms");
  } else {
    rules.push("default:person");
  }

  let category = t === "violation" ? "violations" : "documents";
  if (notes.includes("court") || notes.includes("custody") || notes.includes("divorce") || notes.includes("attorney")) {
    category = "legal";
    rules.push("keyword:legal_terms");
  }
  if (notes.includes("bill") || notes.includes("due") || notes.includes("payment") || notes.includes("receipt")) {
    category = "money";
    rules.push("keyword:money_terms");
  }

  const confidence = rules.includes("keyword:legal_terms") || rules.includes("keyword:money_terms") || rules.includes("keyword:business_terms")
    ? 0.82
    : 0.6;

  return { category_group, category, confidence, rules_applied: rules };
}

async function appendJsonl(filePath, obj) {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  await fs.appendFile(filePath, JSON.stringify(obj) + "\n", "utf8");
}

app.post("/api/sync", async (req, res) => {
  const auth = requireAuth(req);
  if (!auth.ok) return res.status(401).json({ error: "unauthorized" });

  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  if (!items.length) return res.json({ results: [] });

  const out = [];
  for (const it of items) {
    try {
      const cat = categorizeCapture(it);
      const record = {
        id: String(it.id || ""),
        receivedAt: Date.now(),
        capture: it,
        categorization: cat,
      };
      await appendJsonl(path.join(process.cwd(), "data", "synced_captures.jsonl"), record);
      out.push({ id: record.id, ok: true });
    } catch (e) {
      out.push({ id: String(it?.id || ""), ok: false, error: e instanceof Error ? e.message : String(e) });
    }
  }
  return res.json({ results: out });
});

app.use(express.static(distPath));

// Express v5 (path-to-regexp v6+) does not accept "*" as a string route.
app.get(/.*/, (_, res) =>
  res.sendFile(path.join(distPath, "index.html"))
);

// Railway injects PORT; fall back to 8080 for local runs (matches Dockerfile convention)
const port = process.env.PORT || 8080;

app.listen(port, "0.0.0.0", () => {
  console.log("Server running on port", port);
});
