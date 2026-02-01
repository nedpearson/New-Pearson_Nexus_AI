import { AlertCircle, Settings } from 'lucide-react';

interface MicrophonePermissionHelpProps {
  onClose: () => void;
}

export function MicrophonePermissionHelp({ onClose }: MicrophonePermissionHelpProps) {
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isAndroid = /Android/i.test(navigator.userAgent);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="max-w-md w-full bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl border border-red-500/30 shadow-2xl">
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-red-500/20">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1">
                Microphone Permission Needed
              </h3>
              <p className="text-sm text-slate-400">
                Voice notes require microphone access
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-4 p-4 bg-slate-950/50 rounded-xl border border-slate-800">
            <p className="text-sm text-slate-300 font-medium">
              How to enable microphone access:
            </p>

            {isIOS && (
              <div className="space-y-2 text-sm text-slate-400">
                <p className="font-medium text-slate-300">For iPhone/iPad (Safari):</p>
                
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg mb-3">
                  <p className="text-xs text-amber-300">
                    <strong>⚠️ Important:</strong> Safari requires either HTTPS or specific settings for microphone access via IP address.
                  </p>
                </div>
                
                <p className="font-semibold text-slate-200">Method 1: Browser Permission (Try First)</p>
                <ol className="list-decimal list-inside space-y-2 ml-2">
                  <li>Tap the <strong>aA</strong> icon in the address bar</li>
                  <li>Tap <strong>Website Settings</strong></li>
                  <li>Find <strong>Microphone</strong></li>
                  <li>Select <strong>Allow</strong></li>
                  <li>Reload this page</li>
                </ol>
                
                <p className="font-semibold text-slate-200 mt-4">Method 2: iOS Settings</p>
                <ol className="list-decimal list-inside space-y-2 ml-2">
                  <li>Go to iPhone <strong>Settings</strong></li>
                  <li>Scroll down to <strong>Safari</strong></li>
                  <li>Tap <strong>Camera & Microphone Access</strong> (or <strong>Settings for Websites</strong>)</li>
                  <li>Find <strong>Microphone</strong></li>
                  <li>Select <strong>Ask</strong> or <strong>Allow</strong></li>
                  <li>Return to this page and reload</li>
                </ol>
                
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg mt-3">
                  <p className="text-xs text-blue-300">
                    <strong>Still not working?</strong> iOS may block microphone access via IP addresses in some cases. The app will still work for photos and text notes!
                  </p>
                </div>
              </div>
            )}

            {isAndroid && (
              <div className="space-y-2 text-sm text-slate-400">
                <p className="font-medium text-slate-300">For Android (Chrome):</p>
                <ol className="list-decimal list-inside space-y-2 ml-2">
                  <li>Tap the <strong>🔒 lock icon</strong> in address bar</li>
                  <li>Tap <strong>Permissions</strong></li>
                  <li>Find <strong>Microphone</strong></li>
                  <li>Select <strong>Allow</strong></li>
                  <li>Reload the page</li>
                </ol>
                <p className="mt-3 pt-3 border-t border-slate-800">
                  <strong>Alternative:</strong>
                </p>
                <ol className="list-decimal list-inside space-y-2 ml-2">
                  <li>Go to phone <strong>Settings</strong></li>
                  <li>Tap <strong>Apps</strong> or <strong>Apps & notifications</strong></li>
                  <li>Find and tap <strong>Chrome</strong> or your browser</li>
                  <li>Tap <strong>Permissions</strong></li>
                  <li>Tap <strong>Microphone</strong></li>
                  <li>Select <strong>Allow</strong></li>
                </ol>
              </div>
            )}

            {!isIOS && !isAndroid && (
              <div className="space-y-2 text-sm text-slate-400">
                <p className="font-medium text-slate-300">For Desktop Browser:</p>
                <ol className="list-decimal list-inside space-y-2 ml-2">
                  <li>Click the <strong>🔒 lock icon</strong> in address bar</li>
                  <li>Find <strong>Microphone</strong> permission</li>
                  <li>Select <strong>Allow</strong></li>
                  <li>Reload the page</li>
                </ol>
              </div>
            )}
          </div>

          {/* Additional Help */}
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-xs text-blue-300">
              <strong>Note:</strong> After enabling microphone access, you may need to reload
              this page for the changes to take effect.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition-all font-medium"
            >
              Got it
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 transition-all font-medium flex items-center justify-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Reload Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}