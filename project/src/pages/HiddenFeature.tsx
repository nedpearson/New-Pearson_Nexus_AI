import { EyeOff, Settings } from 'lucide-react';

interface HiddenFeatureProps {
  featureName: string;
}

export function HiddenFeature({ featureName }: HiddenFeatureProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-6">
            <EyeOff className="w-8 h-8 text-gray-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Feature Hidden
          </h1>

          <p className="text-gray-600 mb-6">
            <span className="font-semibold">{featureName}</span> is currently hidden in Simple View mode.
          </p>

          <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm text-gray-700">
              To access this feature, switch to Advanced View in your settings. Advanced View shows all available features and modules.
            </p>
          </div>

          <a
            href="#settings"
            onClick={(e) => {
              e.preventDefault();
              window.location.hash = 'settings';
              window.location.reload();
            }}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors w-full"
          >
            <Settings className="w-5 h-5" />
            <span>Go to Settings</span>
          </a>
        </div>
      </div>
    </div>
  );
}
