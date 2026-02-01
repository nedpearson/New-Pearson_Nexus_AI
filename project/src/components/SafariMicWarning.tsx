import { AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

export function SafariMicWarning() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isSafari = /Safari/i.test(navigator.userAgent) && !/Chrome/i.test(navigator.userAgent);
    const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    const hasDismissed = localStorage.getItem('safari_mic_warning_dismissed') === 'true';

    // Show warning if on iOS Safari accessing via IP (not secure context)
    if (isIOS && isSafari && !isSecure && !hasDismissed) {
      setShow(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    setShow(false);
    localStorage.setItem('safari_mic_warning_dismissed', 'true');
  };

  if (!show || dismissed) return null;

  return (
    <div className="fixed top-20 left-4 right-4 z-30 animate-slide-down">
      <div className="bg-gradient-to-r from-amber-500/20 to-orange-600/20 border border-amber-500/40 rounded-xl p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-amber-300 mb-1">
              Voice Notes May Not Work
            </h4>
            <p className="text-xs text-amber-200/90 leading-relaxed mb-2">
              Safari on iPhone may block microphone access via IP address. Photos and text notes will still work perfectly!
            </p>
            <p className="text-xs text-amber-200/70">
              Tip: Use text notes or the browser's "aA" menu → Website Settings → Allow Microphone
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-amber-400 hover:text-amber-300 text-lg font-bold leading-none"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
