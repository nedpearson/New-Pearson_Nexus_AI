import { AppData, Category, LearningRule } from "../data/model";

const DATA_KEY = "pnx.data.v1";
const LAYOUT_KEY = "pnx.layout.v1";

export type LayoutState = {
  active: "dashboard" | "documents" | "finances" | "legal" | "admin";
  desktopOrder: ("dashboard" | "documents" | "finances" | "legal" | "admin")[];
  mobileOrder: ("dashboard" | "documents" | "finances" | "legal" | "admin")[];
  userTier: "Free" | "Plus" | "Pro";
};

export function loadData(fallback: AppData): AppData {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(DATA_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as AppData;
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}

export function saveData(next: AppData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DATA_KEY, JSON.stringify(next));
}

export function loadLayout(fallback: LayoutState): LayoutState {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(LAYOUT_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as LayoutState;
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}

export function saveLayout(next: LayoutState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LAYOUT_KEY, JSON.stringify(next));
}

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 80);
}

export function suggestCategories(
  title: string,
  text: string | undefined,
  kind: "photo"|"video"|"voice"|"note",
  categories: Category[],
  learning: LearningRule[]
): { category: string; score: number }[] {
  const tokens = tokenize([title, text ?? "", kind].join(" "));
  const base: Record<string, number> = {};
  for (const c of categories) base[c.key] = 0.10;
  base["inbox"] = (base["inbox"] ?? 0) + 0.20;

  const bump = (k: string, v: number) => (base[k] = (base[k] ?? 0) + v);

  for (const t of tokens) {
    if (["bill","due","payment","pay","invoice","rent","mortgage","utility","electric","internet","insurance"].includes(t)) bump("bills", 0.25);
    if (["expense","receipt","spent","purchase","grocery","gas","pharmacy","amazon"].includes(t)) bump("expenses", 0.22);
    if (["legal","lawyer","attorney","court","custody","divorce","support","agreement"].includes(t)) bump("legal", 0.25);
    if (["divorce","alimony","settlement"].includes(t)) bump("divorce", 0.22);
    if (["custody","school","pickup","dropoff","schedule"].includes(t)) bump("custody", 0.22);
    if (["work","client","contract","project"].includes(t)) bump("work", 0.18);
    if (["home","repair","house","kids","family"].includes(t)) bump("home", 0.14);
  }

  for (const rule of learning) {
    if (tokens.includes(rule.token.toLowerCase())) bump(rule.categoryKey, 0.18 * rule.weight);
  }

  const allowed = new Set(categories.map(c => c.key));
  return Object.entries(base)
    .map(([category, score]) => ({ category, score: Math.min(0.99, score) }))
    .filter(i => allowed.has(i.category))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

export function learnCorrection(
  learning: LearningRule[],
  title: string,
  text: string | undefined,
  approvedCategory: string
): LearningRule[] {
  const tokens = tokenize([title, text ?? ""].join(" ")).slice(0, 12);
  const next = [...learning];

  for (const t of tokens) {
    if (t.length < 4) continue;
    const idx = next.findIndex(r => r.token === t && r.categoryKey === approvedCategory);
    if (idx >= 0) next[idx] = { ...next[idx], weight: Math.min(2.0, next[idx].weight + 0.15) };
    else next.push({ token: t, categoryKey: approvedCategory, weight: 1.0 });
  }
  return next.slice(-180);
}
