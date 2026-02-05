import fs from "node:fs";
import path from "node:path";

export type Category = { id: string; name: string; folderPath: string };
export type Taxonomy = { version: number; categories: Category[] };

export function loadTaxonomy(): Taxonomy {
  const p = path.join(process.cwd(), "src", "superagent", "taxonomy", "categories.json");
  const raw = fs.readFileSync(p, "utf-8");
  return JSON.parse(raw) as Taxonomy;
}

export function getCategoryById(t: Taxonomy, id: string): Category | undefined {
  return t.categories.find(c => c.id === id);
}

