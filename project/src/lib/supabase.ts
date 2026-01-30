import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { featureFlags } from './featureFlags';

const REMOTE_INTEGRATIONS_ENABLED = import.meta.env.VITE_ENABLE_REMOTE_INTEGRATIONS === 'true';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

let supabaseInstance: SupabaseClient | null = null;
let initializationError: Error | null = null;

if (REMOTE_INTEGRATIONS_ENABLED) {
  try {
    if (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://placeholder.supabase.co') {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    } else {
      initializationError = new Error('Supabase credentials not configured');
    }
  } catch (error) {
    initializationError = error as Error;
    console.warn('Supabase initialization failed, running in local-only mode:', error);
  }
}

const noOpHandler: ProxyHandler<any> = {
  get(_target, prop) {
    if (prop === 'from' || prop === 'auth' || prop === 'storage') {
      return new Proxy({}, noOpHandler);
    }
    return () => Promise.resolve({ data: null, error: null });
  }
};

const safeSupabaseProxy = new Proxy({} as SupabaseClient, noOpHandler);

export const supabase = (REMOTE_INTEGRATIONS_ENABLED && supabaseInstance)
  ? supabaseInstance
  : safeSupabaseProxy;

export function isSupabaseAvailable(): boolean {
  try {
    return REMOTE_INTEGRATIONS_ENABLED && featureFlags?.enableSupabase === true && supabaseInstance !== null && initializationError === null;
  } catch {
    return false;
  }
}

export function getSupabaseError(): Error | null {
  return initializationError;
}

export function isRemoteIntegrationsEnabled(): boolean {
  return REMOTE_INTEGRATIONS_ENABLED;
}
