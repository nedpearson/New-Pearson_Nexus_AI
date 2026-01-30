export interface FeatureFlags {
  enableSupabase: boolean;
  enableAuth: boolean;
  enableFileStorage: boolean;
  enableExternalAPIs: boolean;
}

const defaultFlags: FeatureFlags = {
  enableSupabase: false,
  enableAuth: false,
  enableFileStorage: false,
  enableExternalAPIs: false,
};

function loadFeatureFlags(): FeatureFlags {
  try {
    const stored = localStorage?.getItem?.('pnx_feature_flags');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === 'object') {
        return { ...defaultFlags, ...parsed };
      }
    }
  } catch (error) {
    console.warn('Failed to load feature flags, using defaults', error);
  }
  return defaultFlags;
}

export const featureFlags = loadFeatureFlags();

export function updateFeatureFlag(key: keyof FeatureFlags, value: boolean): void {
  try {
    if (!featureFlags || !localStorage?.setItem) return;
    featureFlags[key] = value;
    localStorage.setItem('pnx_feature_flags', JSON.stringify(featureFlags));
  } catch (error) {
    console.error('Failed to update feature flag:', error);
  }
}

export function resetFeatureFlags(): void {
  try {
    if (!featureFlags || !localStorage?.setItem) return;
    Object.assign(featureFlags, defaultFlags);
    localStorage.setItem('pnx_feature_flags', JSON.stringify(defaultFlags));
  } catch (error) {
    console.error('Failed to reset feature flags:', error);
  }
}
