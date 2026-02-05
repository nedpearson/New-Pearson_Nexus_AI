import fs from "fs/promises";
import path from "path";
import { createClient } from "@supabase/supabase-js";

function hasSupabaseStorage() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_STORAGE_BUCKET);
}

function supabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false } });
}

function bucketName() {
  return String(process.env.SUPABASE_STORAGE_BUCKET || "ingestion");
}

function safeExtFromMime(mimeType) {
  const m = String(mimeType || "").toLowerCase();
  if (m.includes("pdf")) return "pdf";
  if (m.includes("png")) return "png";
  if (m.includes("jpeg") || m.includes("jpg")) return "jpg";
  if (m.includes("webp")) return "webp";
  if (m.includes("wav")) return "wav";
  if (m.includes("mpeg") || m.includes("mp3")) return "mp3";
  if (m.includes("mp4") || m.includes("m4a")) return "m4a";
  return "bin";
}

async function putLocal(relPath, bytes) {
  const abs = path.join(process.cwd(), "data", "artifacts", relPath);
  await fs.mkdir(path.dirname(abs), { recursive: true });
  await fs.writeFile(abs, Buffer.from(bytes));
  return `local:${relPath}`;
}

async function putSupabase(relPath, bytes, contentType) {
  const sb = supabase();
  const bucket = bucketName();
  const { error } = await sb
    .storage
    .from(bucket)
    .upload(relPath, bytes, {
      upsert: true,
      contentType: contentType || "application/octet-stream",
      cacheControl: "3600",
    });
  if (error) throw new Error(`Supabase storage upload failed: ${error.message}`);
  return `supabase:${bucket}/${relPath}`;
}

export async function putOriginalArtifact(args) {
  const sha256 = String(args.sha256);
  const mimeType = String(args.mimeType || "application/octet-stream");
  const ext = safeExtFromMime(mimeType);
  const rel = `v1/${sha256}/original.${ext}`;
  const bytes = args.bytes;

  if (hasSupabaseStorage()) return await putSupabase(rel, bytes, mimeType);
  return await putLocal(rel, bytes);
}

export async function putJsonArtifact(args) {
  const sha256 = String(args.sha256);
  const rel = `v1/${sha256}/${String(args.name || "result")}.json`;
  const bytes = new TextEncoder().encode(JSON.stringify(args.json, null, 2));

  if (hasSupabaseStorage()) return await putSupabase(rel, bytes, "application/json");
  return await putLocal(rel, bytes);
}

