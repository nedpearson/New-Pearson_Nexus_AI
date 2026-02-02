import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { getSupabaseAdmin } from './supabaseAdmin.js';

function assertSupabase() {
  const sb = getSupabaseAdmin();
  if (!sb) {
    throw new Error('Supabase server not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }
  return sb;
}

function toIso(input) {
  if (!input) return null;
  const d = input instanceof Date ? input : new Date(input);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function mapOrg(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    plan: row.plan,
    created_at: toIso(row.created_at) || new Date().toISOString()
  };
}

function mapUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    name: row.name || undefined,
    organization_id: row.organization_id,
    isDemo: Boolean(row.is_demo),
    faceRecognitionEnabled: Boolean(row.face_recognition_enabled),
    created_at: toIso(row.created_at) || new Date().toISOString(),
    // Match existing server expectations
    passwordHash: row.password_hash
  };
}

export async function supabaseEnsureSeeded({ email, password, name } = {}) {
  const sb = assertSupabase();

  const { data: existingUsers, error } = await sb.from('users').select('id').limit(1);
  if (error) throw error;
  if (existingUsers && existingUsers.length > 0) return;

  const orgId = crypto.randomUUID();
  const userId = crypto.randomUUID();

  const org = {
    id: orgId,
    name: 'Pearson Nexus AI',
    plan: 'business',
    created_at: new Date().toISOString()
  };

  const passwordHash = await bcrypt.hash(password || '1Pearson2', 10);
  const user = {
    id: userId,
    email: email || 'nedpearson@gmail.com',
    role: 'owner',
    name: name || 'Ned Pearson',
    organization_id: orgId,
    is_demo: false,
    face_recognition_enabled: false,
    password_hash: passwordHash,
    created_at: new Date().toISOString()
  };

  const orgInsert = await sb.from('organizations').insert(org);
  if (orgInsert.error) throw orgInsert.error;
  const userInsert = await sb.from('users').insert(user);
  if (userInsert.error) throw userInsert.error;
}

export async function supabaseFindUserByEmail(email) {
  const sb = assertSupabase();
  const normalized = String(email || '').trim().toLowerCase();
  const { data, error } = await sb
    .from('users')
    .select('*')
    // `ilike` is pattern-based; for exact match, do not use wildcards.
    .ilike('email', normalized)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return mapUser(data);
}

export async function supabaseGetUserById(userId) {
  const sb = assertSupabase();
  const { data, error } = await sb.from('users').select('*').eq('id', userId).maybeSingle();
  if (error) throw error;
  return mapUser(data);
}

export async function supabaseGetOrgById(orgId) {
  const sb = assertSupabase();
  const { data, error } = await sb.from('organizations').select('*').eq('id', orgId).maybeSingle();
  if (error) throw error;
  return mapOrg(data);
}

export async function supabaseGetOrgForUser(user) {
  if (!user?.organization_id) return null;
  return supabaseGetOrgById(user.organization_id);
}

export async function supabaseCreateUserWithOrg({ email, password, name }) {
  const sb = assertSupabase();
  const normalized = String(email || '').trim().toLowerCase();

  const existing = await supabaseFindUserByEmail(normalized);
  if (existing) return { ok: false, error: 'ACCOUNT_EXISTS' };

  const orgId = crypto.randomUUID();
  const userId = crypto.randomUUID();
  const now = new Date().toISOString();

  const org = {
    id: orgId,
    name: `${name || email}'s Organization`,
    plan: 'basic',
    created_at: now
  };

  const passwordHash = await bcrypt.hash(String(password), 10);
  const user = {
    id: userId,
    email: normalized,
    role: 'owner',
    name: name || null,
    organization_id: orgId,
    is_demo: false,
    face_recognition_enabled: false,
    password_hash: passwordHash,
    created_at: now
  };

  const orgInsert = await sb.from('organizations').insert(org);
  if (orgInsert.error) throw orgInsert.error;
  const userInsert = await sb.from('users').insert(user);
  if (userInsert.error) throw userInsert.error;

  return { ok: true, user: mapUser(user), org: mapOrg(org) };
}

export async function supabaseUpdateUser(userId, updates) {
  const sb = assertSupabase();
  const mapped = {};
  if (Object.prototype.hasOwnProperty.call(updates, 'name')) mapped.name = updates.name ?? null;
  if (Object.prototype.hasOwnProperty.call(updates, 'faceRecognitionEnabled')) {
    mapped.face_recognition_enabled = Boolean(updates.faceRecognitionEnabled);
  }

  const { data, error } = await sb.from('users').update(mapped).eq('id', userId).select('*').maybeSingle();
  if (error) throw error;
  return mapUser(data);
}

export async function supabaseSetUserPasswordHash(userId, passwordHash) {
  const sb = assertSupabase();
  const { error } = await sb.from('users').update({ password_hash: passwordHash }).eq('id', userId);
  if (error) throw error;
}

export async function supabaseUpsertRefreshToken(userId, { tokenHash, jti, expiresAtMs }) {
  const sb = assertSupabase();
  const { error } = await sb.from('refresh_tokens').upsert({
    user_id: userId,
    token_hash: tokenHash,
    jti,
    expires_at: new Date(expiresAtMs).toISOString(),
    updated_at: new Date().toISOString()
  });
  if (error) throw error;
}

export async function supabaseGetRefreshToken(userId) {
  const sb = assertSupabase();
  const { data, error } = await sb.from('refresh_tokens').select('*').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    tokenHash: data.token_hash,
    jti: data.jti,
    expiresAt: new Date(data.expires_at).getTime()
  };
}

export async function supabaseDeleteRefreshToken(userId) {
  const sb = assertSupabase();
  const { error } = await sb.from('refresh_tokens').delete().eq('user_id', userId);
  if (error) throw error;
}

export async function supabaseInsertPasswordReset(tokenHash, { userId, expiresAtMs }) {
  const sb = assertSupabase();
  const { error } = await sb.from('password_resets').insert({
    token_hash: tokenHash,
    user_id: userId,
    expires_at: new Date(expiresAtMs).toISOString(),
    used_at: null,
    created_at: new Date().toISOString()
  });
  if (error) throw error;
}

export async function supabaseGetPasswordReset(tokenHash) {
  const sb = assertSupabase();
  const { data, error } = await sb.from('password_resets').select('*').eq('token_hash', tokenHash).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    userId: data.user_id,
    expiresAt: new Date(data.expires_at).getTime(),
    usedAt: data.used_at ? new Date(data.used_at).getTime() : null
  };
}

export async function supabaseMarkPasswordResetUsed(tokenHash) {
  const sb = assertSupabase();
  const { error } = await sb
    .from('password_resets')
    .update({ used_at: new Date().toISOString() })
    .eq('token_hash', tokenHash);
  if (error) throw error;
}

export async function supabaseInsertUpload(record) {
  const sb = assertSupabase();
  const { error } = await sb.from('uploads').insert({
    id: record.id,
    organization_id: record.organization_id ?? null,
    created_by: record.created_by ?? null,
    original_name: record.original_name,
    stored_name: record.stored_name,
    storage_path: record.storage_path,
    mime_type: record.mime_type,
    size: record.size,
    sha256: record.sha256,
    case_id: record.case_id ?? null,
    tags: record.tags ?? [],
    notes: record.notes ?? '',
    captured_at: record.captured_at ?? null,
    location: record.location ?? null,
    created_at: record.created_at ?? new Date().toISOString()
  });
  if (error) throw error;
}

export async function supabaseListUploads() {
  const sb = assertSupabase();
  const { data, error } = await sb.from('uploads').select('*').order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []).map((u) => ({
    id: u.id,
    original_name: u.original_name,
    stored_name: u.stored_name,
    mime_type: u.mime_type,
    size: Number(u.size),
    sha256: u.sha256,
    case_id: u.case_id ?? null,
    tags: Array.isArray(u.tags) ? u.tags : [],
    notes: u.notes ?? '',
    captured_at: u.captured_at ? toIso(u.captured_at) : null,
    location: u.location ?? null,
    created_at: toIso(u.created_at) || new Date().toISOString()
  }));
}

