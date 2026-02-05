import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function loadTaxonomy() {
  const p = path.join(__dirname, "../taxonomy/categories.json");
  const raw = await fs.readFile(p, "utf8");
  return JSON.parse(raw);
}

function norm(s) {
  return String(s || "").toLowerCase();
}

function pickCategory(tax, id) {
  const c = (tax?.categories || []).find((x) => x.id === id);
  return c || (tax?.categories || []).find((x) => x.id === "needs_review");
}

export async function routeDocument(input) {
  const tax = await loadTaxonomy();

  const docType = norm(input?.docType?.name);
  const filename = norm(input?.filename);
  const source = norm(input?.source);
  const text = norm(input?.text);
  const entities = Array.isArray(input?.entities) ? input.entities : [];
  const kvs = Array.isArray(input?.keyValues) ? input.keyValues : [];

  const rules = [];
  let categoryId = "documents";
  let group = "person";
  let confidence = 0.75;

  // Source-first: mobile violation flow is a strong signal.
  if (source.includes("mobile") && (input?.captureType === "violation" || text.includes("violation"))) {
    categoryId = "violations";
    rules.push("source:mobile_violation");
    confidence = 0.92;
  }

  // Legal terms
  if (text.match(/\b(court|custody|divorce|attorney|order|hearing)\b/)) {
    categoryId = "legal";
    rules.push("keyword:legal_terms");
    confidence = Math.max(confidence, 0.92);
  }

  // Money terms
  if (text.match(/\b(invoice|receipt|paid|payment|bill|due|amount)\b/) || filename.includes("invoice") || filename.includes("receipt")) {
    categoryId = "money";
    rules.push("keyword:money_terms");
    confidence = Math.max(confidence, 0.90);
  }

  // Utilities: high precision pattern
  if (text.match(/\b(electric|utility|utilities|water|gas|internet)\b/) && text.match(/\bpaid|\bdue|\bamount|\$\d+/)) {
    categoryId = "utilities";
    rules.push("keyword:utilities_terms");
    confidence = Math.max(confidence, 0.93);
  }

  // Vendor + invoice patterns (business)
  const hasVendor = entities.some((e) => norm(e.type).includes("vendor")) || kvs.some((kv) => norm(kv.key).includes("vendor"));
  if (hasVendor || text.match(/\bclient\b|\bvendor\b|\bpo\b/)) {
    group = "business";
    rules.push("entity:business_vendor");
    if (categoryId === "money") categoryId = "invoices";
    confidence = Math.max(confidence, 0.90);
  }

  // Provider docType hints (deterministic mapping)
  if (docType.includes("invoice")) {
    categoryId = group === "business" ? "invoices" : "money";
    rules.push("doctype:invoice");
    confidence = Math.max(confidence, 0.93);
  }
  if (docType.includes("receipt")) {
    categoryId = group === "business" ? "receipts" : "money";
    rules.push("doctype:receipt");
    confidence = Math.max(confidence, 0.93);
  }

  // Confidence gating: never auto-finalize low confidence.
  const FINAL_THRESHOLD = 0.9;
  const needsReview = confidence < FINAL_THRESHOLD;
  if (needsReview) {
    rules.push("gate:needs_review");
    categoryId = "needs_review";
  }

  const cat = pickCategory(tax, categoryId);
  return {
    categoryId: cat.id,
    folderPath: cat.folderPath,
    tags: cat.tags || [],
    sensitivity: cat.sensitivity || "normal",
    retentionPolicy: cat.retentionPolicy || "standard",
    category_group: cat.group || group,
    confidence,
    rules_applied: rules,
  };
}

