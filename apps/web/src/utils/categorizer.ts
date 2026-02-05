import { PnxDb, PnxItem } from "@/types/pnx";
import { saveDb } from "@/data/db";

const KEY = "pnx_rules_v1";

type Rule = {
  id: string;
  contains: string[];        // keyword triggers
  categoryId: string;
  weight: number;
};

function defaultRules(): Rule[] {
  return [
    { id: "r_docs", contains: ["pdf","statement","document","lease","contract"], categoryId: "cat_docs", weight: 1.0 },
    { id: "r_bills", contains: ["bill","invoice","payment","rent","utility","bank"], categoryId: "cat_bills", weight: 1.2 },
    { id: "r_legal", contains: ["court","custody","divorce","order","attorney","legal"], categoryId: "cat_legal", weight: 1.2 },
    { id: "r_voice", contains: ["voice","note","audio","recording"], categoryId: "cat_voice", weight: 1.0 },
    { id: "r_photo", contains: ["photo","image","jpg","png","screenshot"], categoryId: "cat_photos", weight: 1.0 },
    { id: "r_cases", contains: ["evidence","timeline","incident","violation"], categoryId: "cat_cases", weight: 1.1 }
  ];
}

function loadRules(): Rule[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const rules = defaultRules();
      localStorage.setItem(KEY, JSON.stringify(rules));
      return rules;
    }
    return JSON.parse(raw) as Rule[];
  } catch {
    const rules = defaultRules();
    localStorage.setItem(KEY, JSON.stringify(rules));
    return rules;
  }
}

function saveRules(rules: Rule[]) {
  localStorage.setItem(KEY, JSON.stringify(rules));
}

export function suggestCategory(db: PnxDb, item: Pick<PnxItem, "title"|"description"|"fileName"|"mimeType">): string | undefined {
  const rules = loadRules();
  const hay = `${item.title||""} ${item.description||""} ${item.fileName||""} ${item.mimeType||""}`.toLowerCase();
  const score: Record<string, number> = {};
  for (const r of rules) {
    for (const kw of r.contains) {
      if (hay.includes(kw)) score[r.categoryId] = (score[r.categoryId] || 0) + r.weight;
    }
  }
  const best = Object.entries(score).sort((a,b)=>b[1]-a[1])[0];
  return best?.[0];
}

/**
 * Learning: when user approves a suggestion, we reinforce by adding keywords from title/fileName
 * to a lightweight rule for that category (kept small and safe).
 */
export function learnFromApproval(db: PnxDb, approvedItem: PnxItem) {
  const categoryId = approvedItem.approvedCategoryId;
  if (!categoryId) return;

  const rules = loadRules();
  const tokens = `${approvedItem.title||""} ${approvedItem.fileName||""}`.toLowerCase()
    .split(/[^a-z0-9]+/g).filter(Boolean)
    .filter(t => t.length >= 4)
    .slice(0, 8);

  if (!tokens.length) return;

  const id = `learn_${categoryId}`;
  const existing = rules.find(r => r.id === id);
  if (!existing) {
    rules.push({ id, contains: tokens, categoryId, weight: 0.6 });
  } else {
    const set = new Set(existing.contains);
    for (const t of tokens) set.add(t);
    existing.contains = Array.from(set).slice(0, 18);
  }

  saveRules(rules);
  saveDb(db);
}
