import type { IngestContext, NormalizedExtraction, RoutingDecision, Sensitivity } from "../types";
import { DEFAULT_DOC_GATE, needsReview } from "../utils/confidence";
import { loadTaxonomy, getCategoryById } from "./loadTaxonomy";

type RuleMatch = {
  categoryId: string;
  tags?: string[];
  sensitivity?: Sensitivity;
  reason: string;
};

function firstEntity(ex: NormalizedExtraction, type: string): string | undefined {
  return ex.entities.find(e => e.type === type)?.value;
}

function classifyByDocType(ex: NormalizedExtraction): RuleMatch | undefined {
  const dt = ex.docType.name.toLowerCase();

  if (dt.includes("invoice")) return { categoryId: "business.invoices", tags: ["invoice"], sensitivity: "internal", reason: "docType=invoice" };
  if (dt.includes("receipt")) return { categoryId: "business.receipts", tags: ["receipt"], sensitivity: "internal", reason: "docType=receipt" };
  if (dt.includes("contract")) return { categoryId: "business.contracts", tags: ["contract"], sensitivity: "confidential", reason: "docType=contract" };
  if (dt.includes("medical")) return { categoryId: "personal.medical", tags: ["medical"], sensitivity: "restricted", reason: "docType=medical" };
  if (dt.includes("insurance")) return { categoryId: "personal.insurance", tags: ["insurance"], sensitivity: "confidential", reason: "docType=insurance" };
  if (dt.includes("legal")) return { categoryId: "personal.legal", tags: ["legal"], sensitivity: "confidential", reason: "docType=legal" };

  return undefined;
}

function classifyByEntities(ex: NormalizedExtraction): RuleMatch | undefined {
  const vendor = firstEntity(ex, "vendor")?.toLowerCase();
  const amount = firstEntity(ex, "amount");

  if (vendor && vendor.includes("electric")) return { categoryId: "personal.utilities", tags: ["utilities", "electric"], sensitivity: "internal", reason: "entity.vendor contains electric" };
  if (amount) return { categoryId: "inbox", tags: ["amount_detected"], sensitivity: "internal", reason: "entity.amount present but docType unknown" };

  return undefined;
}

/**
 * Deterministic routing:
 * - prefers high-confidence docType
 * - uses entities only as tie-breakers
 * - enforces confidence gating (low confidence -> needs_review)
 */
export function routeDocument(ex: NormalizedExtraction, ctx: IngestContext): RoutingDecision {
  const taxonomy = loadTaxonomy();

  const reasons: string[] = [];
  const tags: string[] = [];

  const gate = DEFAULT_DOC_GATE;
  const lowConf = needsReview(ex.confidence, gate) || needsReview(ex.docType.confidence, gate);

  let match: RuleMatch | undefined = undefined;

  // 1) docType-driven routing (primary)
  if (ex.docType.confidence >= 0.90) {
    match = classifyByDocType(ex);
    if (match) reasons.push(match.reason);
  } else {
    reasons.push(`docType confidence low: ${ex.docType.confidence}`);
  }

  // 2) entity-driven routing (secondary)
  if (!match && ex.confidence >= 0.90) {
    match = classifyByEntities(ex);
    if (match) reasons.push(match.reason);
  } else if (!match) {
    reasons.push(`overall extraction confidence low: ${ex.confidence}`);
  }

  // 3) source-aware fallback (e.g., mobile scans go to inbox unless confident)
  if (!match) {
    if (ctx.source === "voice") {
      match = { categoryId: "voice.notes", tags: ["voice"], sensitivity: "internal", reason: "fallback voice route" };
    } else {
      match = { categoryId: "inbox", tags: ["unclassified"], sensitivity: "internal", reason: "fallback inbox route" };
    }
    reasons.push(match.reason);
  }

  if (match.tags) tags.push(...match.tags);

  const cat = getCategoryById(taxonomy, match.categoryId) ?? getCategoryById(taxonomy, "inbox")!;
  const finalNeedsReview = lowConf || match.categoryId === "inbox";

  if (finalNeedsReview) {
    const reviewCat = getCategoryById(taxonomy, "needs_review");
    if (reviewCat) {
      reasons.push("needsReview=true -> route to needs_review");
      return {
        categoryId: reviewCat.id,
        folderPath: reviewCat.folderPath,
        tags: Array.from(new Set([...tags, "needs_review"])),
        sensitivity: match.sensitivity ?? "internal",
        retentionPolicy: "default",
        confidence: Math.min(ex.confidence, ex.docType.confidence),
        needsReview: true,
        reasons
      };
    }
  }

  return {
    categoryId: cat.id,
    folderPath: cat.folderPath,
    tags: Array.from(new Set(tags)),
    sensitivity: match.sensitivity ?? "internal",
    retentionPolicy: "default",
    confidence: Math.min(ex.confidence, ex.docType.confidence),
    needsReview: false,
    reasons
  };
}

