import { AuthStore, DataStore } from './interfaces';
import { LocalStorageAuthStore } from './LocalStorageStore';
import { ApiAuthStore } from './ApiAuthStore';
import { LocalStorageDataStoreExtended } from './LocalStorageDataStoreExtended';

const AUTH_BACKEND = import.meta.env.VITE_AUTH_BACKEND || 'local';
const DATASTORE_TYPE = import.meta.env.VITE_DATASTORE || 'local';

function createAuthStore(): AuthStore {
  if (AUTH_BACKEND === 'supabase') {
    console.error(
      '❌ Supabase backend not available in this build.\n' +
      'This application is configured for 100% local-first operation.\n' +
      'Set VITE_AUTH_BACKEND=local in .env'
    );
    throw new Error(
      'Supabase auth backend is not available. ' +
      'Set VITE_AUTH_BACKEND=local in .env to use local storage.'
    );
  }

  if (AUTH_BACKEND === 'server') {
    console.log('✅ Using ApiAuthStore (httpOnly cookies)');
    return new ApiAuthStore();
  }

  console.log('✅ Using LocalStorageAuthStore (100% offline)');
  return new LocalStorageAuthStore();
}

function createDataStore(): DataStore {
  if (DATASTORE_TYPE === 'supabase') {
    console.warn(
      '⚠️  Supabase data store is not yet fully implemented.\n' +
      'Falling back to LocalStorageDataStore.\n' +
      'Set VITE_DATASTORE=local in .env to suppress this warning.'
    );
    return new LocalStorageDataStoreExtended();
  }

  console.log('✅ Using LocalStorageDataStore (100% offline)');
  return new LocalStorageDataStoreExtended();
}

export const authStore = createAuthStore();
export const dataStore = createDataStore();

authStore.seedDefaultUser?.().catch(err => {
  console.error('Failed to seed default user:', err);
});

export function getBackendConfig() {
  return {
    authBackend: AUTH_BACKEND,
    dataBackend: 'local',
    datastoreType: DATASTORE_TYPE,
    isLocal: AUTH_BACKEND === 'local' && DATASTORE_TYPE === 'local',
    isSupabase: false
  };
}
