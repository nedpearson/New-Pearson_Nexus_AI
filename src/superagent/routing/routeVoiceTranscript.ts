import type { IngestContext, RoutingDecision, Sensitivity } from "../types";
import { loadTaxonomy, getCategoryById } from "./loadTaxonomy";

/**
 * Deterministic transcript routing.
 * - No "AI guessing" here. Use keyword/entity rules + confidence gating.
 * - You can replace/augment this with an NLP entity extractor later.
 */
export function routeVoiceTranscript(
  transcript: string,
  confidence: number,
  ctx: IngestContext,
  forceNeedsReview: boolean
): RoutingDecision {

  const taxonomy = loadTaxonomy();
  const t = (transcript ?? "").toLowerCase();

  const reasons: string[] = [];
  const tags: string[] = ["voice"];
  let categoryId = "voice.notes";
  let sensitivity: Sensitivity = "internal";

  // Expense-like voice note
  const moneyLike = /\$?\b\d{1,6}(\.\d{2})?\b/.test(t);
  const hasPay = t.includes("paid") || t.includes("payment") || t.includes("pay ");
  const hasBill = t.includes("bill") || t.includes("invoice") || t.includes("receipt");

  if (moneyLike && (hasPay || hasBill)) {
    categoryId = "voice.expenses";
    tags.push("expense");
    reasons.push("transcript indicates expense/payment + amount-like token");
  } else {
    reasons.push("default voice note route");
  }

  if (confidence < 0.90) reasons.push(`speech confidence low: ${confidence}`);

  const needsReview = forceNeedsReview || confidence < 0.90;

  if (needsReview) {
    const reviewCat = getCategoryById(taxonomy, "needs_review")!;
    reasons.push("needsReview=true -> route to needs_review");
    return {
      categoryId: reviewCat.id,
      folderPath: reviewCat.folderPath,
      tags: Array.from(new Set([...tags, "needs_review"])),
      sensitivity,
      retentionPolicy: "default",
      confidence,
      needsReview: true,
      reasons
    };
  }

  const cat = getCategoryById(taxonomy, categoryId) ?? getCategoryById(taxonomy, "voice.notes")!;
  return {
    categoryId: cat.id,
    folderPath: cat.folderPath,
    tags: Array.from(new Set(tags)),
    sensitivity,
    retentionPolicy: "default",
    confidence,
    needsReview: false,
    reasons
  };
}

