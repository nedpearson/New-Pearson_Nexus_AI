import { createClient } from "@supabase/supabase-js";
import fs from "fs/promises";
import path from "path";

function hasSupabaseEnv() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false } });
}

async function appendJsonl(filePath, obj) {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  await fs.appendFile(filePath, JSON.stringify(obj) + "\n", "utf8");
}

const seenHashes = new Set();

/**
 * Persist ingestion result.
 *
 * - If Supabase is configured: upsert into `pnx_ingestions` (unique on hash)
 * - Else: append to JSONL (dev fallback)
 */
export async function persistIngestion(record) {
  if (hasSupabaseEnv()) {
    const sb = getSupabase();
    const { error } = await sb
      .from("pnx_ingestions")
      .upsert(record, { onConflict: "hash" });
    if (error) throw new Error(`Supabase upsert failed: ${error.message}`);
    return { ok: true, backend: "supabase" };
  }

  if (record?.hash && seenHashes.has(record.hash)) {
    return { ok: true, backend: "jsonl", deduped: true };
  }
  await appendJsonl(path.join(process.cwd(), "data", "ingestions.jsonl"), record);
  if (record?.hash) seenHashes.add(record.hash);
  return { ok: true, backend: "jsonl" };
}

