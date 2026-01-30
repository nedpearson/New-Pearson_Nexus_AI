import { useState } from 'react';
import { Settings, X, AlertCircle } from 'lucide-react';
import { featureFlags, updateFeatureFlag, resetFeatureFlags } from '../lib/featureFlags';
import { isSupabaseAvailable } from '../lib/supabase';

export function FeatureFlagsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [flags, setFlags] = useState(featureFlags);

  const handleToggle = (key: keyof typeof featureFlags) => {
    const newValue = !flags[key];
    updateFeatureFlag(key, newValue);
    setFlags({ ...featureFlags });
  };

  const handleReset = () => {
    resetFeatureFlags();
    setFlags({ ...featureFlags });
  };

  const supabaseAvailable = isSupabaseAvailable();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-3 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 transition-colors z-40"
        title="Feature Flags"
      >
        <Settings className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gray-800 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <h2 className="text-lg font-bold">Feature Flags</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {!supabaseAvailable && (
                <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-orange-800">
                    <p className="font-medium">Running in Local Mode</p>
                    <p className="text-orange-700 mt-1">
                      Supabase is not configured. All data is stored locally in your browser.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <FeatureToggle
                  label="Enable Supabase"
                  description="Connect to Supabase backend for data storage"
                  enabled={flags.enableSupabase}
                  disabled={!supabaseAvailable}
                  onChange={() => handleToggle('enableSupabase')}
                />

                <FeatureToggle
                  label="Enable Authentication"
                  description="Use Supabase authentication instead of local auth"
                  enabled={flags.enableAuth}
                  disabled={!flags.enableSupabase || !supabaseAvailable}
                  onChange={() => handleToggle('enableAuth')}
                />

                <FeatureToggle
                  label="Enable File Storage"
                  description="Upload and store files in Supabase Storage"
                  enabled={flags.enableFileStorage}
                  disabled={!flags.enableSupabase || !supabaseAvailable}
                  onChange={() => handleToggle('enableFileStorage')}
                />

                <FeatureToggle
                  label="Enable External APIs"
                  description="Enable integrations and external service calls"
                  enabled={flags.enableExternalAPIs}
                  onChange={() => handleToggle('enableExternalAPIs')}
                />
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleReset}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Reset to Defaults
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                Changes take effect immediately
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

interface FeatureToggleProps {
  label: string;
  description: string;
  enabled: boolean;
  disabled?: boolean;
  onChange: () => void;
}

function FeatureToggle({ label, description, enabled, disabled, onChange }: FeatureToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <p className={`font-medium ${disabled ? 'text-gray-400' : 'text-gray-900'}`}>
          {label}
        </p>
        <p className={`text-sm ${disabled ? 'text-gray-400' : 'text-gray-600'}`}>
          {description}
        </p>
      </div>
      <button
        onClick={onChange}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          disabled
            ? 'bg-gray-200 cursor-not-allowed'
            : enabled
            ? 'bg-blue-600'
            : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
