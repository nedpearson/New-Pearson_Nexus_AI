import { createClient } from '@supabase/supabase-js';

function requiredEnv(name) {
  const v = process.env[name];
  return v && String(v).trim().length > 0 ? String(v) : null;
}

export function isSupabaseServerConfigured() {
  return Boolean(requiredEnv('SUPABASE_URL') && requiredEnv('SUPABASE_SERVICE_ROLE_KEY'));
}

export function getSupabaseAdmin() {
  const url = requiredEnv('SUPABASE_URL');
  const key = requiredEnv('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) return null;

  // Service role key is server-only; never expose to client.
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
  });
}

