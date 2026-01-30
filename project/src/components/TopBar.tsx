import { Download, Smartphone, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useInstallPrompt } from '../pwa/useInstallPrompt';

interface TopBarProps {
  viewMode?: 'simple' | 'advanced';
  onViewModeChange?: (mode: 'simple' | 'advanced') => void;
  showMobileViewButton?: boolean;
  showViewToggle?: boolean;
}

export function TopBar({
  viewMode = 'simple',
  onViewModeChange,
  showMobileViewButton = false,
  showViewToggle = false
}: TopBarProps) {
  const navigate = useNavigate();
  const { canInstall, isInstalled, isInstalling, promptInstall } = useInstallPrompt();

  const handleInstallClick = () => {
    if (canInstall && !isInstalling) {
      promptInstall();
    }
  };

  const handleViewToggle = () => {
    if (onViewModeChange) {
      const newMode = viewMode === 'simple' ? 'advanced' : 'simple';
      onViewModeChange(newMode);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            {showViewToggle && (
              <button
                onClick={handleViewToggle}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <span className="mr-2">{viewMode === 'simple' ? 'Simple' : 'Advanced'}</span>
                <span className="text-xs text-gray-500">↔</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {showMobileViewButton && (
              <button
                onClick={() => navigate('/m')}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Mobile View
              </button>
            )}

            <button
              onClick={handleInstallClick}
              disabled={isInstalled || isInstalling || !canInstall}
              className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isInstalled
                  ? 'bg-green-100 text-green-800 cursor-default'
                  : canInstall
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isInstalled ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Installed
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  {isInstalling ? 'Installing...' : 'Install App'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
