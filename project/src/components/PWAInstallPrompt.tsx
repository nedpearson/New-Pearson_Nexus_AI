import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Share, Plus } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;

  useEffect(() => {
    // Check if already installed
    if (isInStandaloneMode) {
      setIsInstalled(true);
      return;
    }

    // Check if user previously dismissed
    const isDismissed = localStorage.getItem('pwa_install_dismissed') === 'true';
    if (isDismissed) {
      return;
    }

    // For iOS, show install prompt immediately (they don't have beforeinstallprompt)
    if (isIOS && !isInStandaloneMode) {
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return;
    }

    // Listen for beforeinstallprompt event (Android/Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after 3 seconds
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App installed successfully');
      setIsInstalled(true);
      setShowPrompt(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isIOS, isInStandaloneMode]);

  const handleInstallClick = async () => {
    // iOS needs manual instructions
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    // Android/Desktop - use native prompt
    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('[PWA] User accepted install');
      setShowPrompt(false);
    } else {
      console.log('[PWA] User dismissed install');
    }

    // Clear the deferred prompt
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa_install_dismissed', 'true');
  };

  const handleRemindLater = () => {
    setShowPrompt(false);
    // Will show again on next visit
  };

  if (isInstalled || (!showPrompt && !showIOSInstructions) || dismissed) {
    return null;
  }

  // iOS Installation Instructions
  if (showIOSInstructions) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="max-w-md w-full bg-gradient-to-br from-cyan-600 to-blue-700 rounded-2xl border border-cyan-400/30 shadow-2xl">
          <div className="p-6 space-y-4">
            <button
              onClick={() => setShowIOSInstructions(false)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/20 transition-colors text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-3">
              <div className="p-3 bg-white/20 rounded-xl">
                <Smartphone className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-1">
                  Install on iPhone
                </h3>
                <p className="text-sm text-cyan-100">
                  Add to your home screen for offline access
                </p>
              </div>
            </div>

            <div className="bg-white/10 rounded-xl p-5 space-y-4 backdrop-blur">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0 text-white font-bold">
                  1
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium mb-1">Tap the Share button</p>
                  <div className="flex items-center gap-2 text-cyan-100 text-sm">
                    <Share className="w-4 h-4" />
                    <span>At the bottom of Safari</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0 text-white font-bold">
                  2
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium mb-1">Scroll and tap "Add to Home Screen"</p>
                  <div className="flex items-center gap-2 text-cyan-100 text-sm">
                    <Plus className="w-4 h-4" />
                    <span>Look for the plus icon</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0 text-white font-bold">
                  3
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium mb-1">Tap "Add" to confirm</p>
                  <p className="text-cyan-100 text-sm">
                    App appears on your home screen
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-white font-medium mb-2">✓ Benefits:</p>
              <ul className="space-y-1 text-sm text-cyan-100">
                <li>• Works completely offline</li>
                <li>• No loading time after install</li>
                <li>• Stored permanently on your phone</li>
                <li>• Auto-syncs when you're home</li>
              </ul>
            </div>

            <button
              onClick={() => {
                setShowIOSInstructions(false);
                handleDismiss();
              }}
              className="w-full px-4 py-3 bg-white text-cyan-700 rounded-xl font-bold hover:bg-cyan-50 transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Regular prompt (Android/Desktop or iOS initial prompt)
  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
      <div className="bg-gradient-to-br from-cyan-600 to-blue-700 text-white rounded-xl shadow-2xl p-5 border border-cyan-400/30">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 rounded-lg hover:bg-white/20 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <Smartphone className="w-6 h-6" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-1">
              {isIOS ? 'Install on Your iPhone' : 'Install App'}
            </h3>
            <p className="text-sm opacity-90 mb-4">
              {isIOS 
                ? 'Add to home screen for offline use anywhere, anytime!'
                : 'Install Pearson Nexus AI for instant access and offline use. No app store needed!'
              }
            </p>

            <div className="flex gap-2">
              <button
                onClick={handleInstallClick}
                className="flex-1 px-4 py-2 bg-white text-cyan-700 rounded-lg font-medium hover:bg-cyan-50 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                {isIOS ? 'Show Me How' : 'Install Now'}
              </button>
              <button
                onClick={handleRemindLater}
                className="px-4 py-2 bg-white/20 rounded-lg font-medium hover:bg-white/30 transition-colors"
              >
                Later
              </button>
            </div>

            <div className="mt-3 flex items-center gap-4 text-xs opacity-75">
              <span>✓ Works offline</span>
              <span>✓ No loading</span>
              <span>✓ Auto-sync</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}