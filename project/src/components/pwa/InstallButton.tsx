import React from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function isStandalone(): boolean {
  // iOS Safari uses navigator.standalone
  const iosStandalone = (window.navigator as any).standalone === true;
  const mm = window.matchMedia?.("(display-mode: standalone)")?.matches === true;
  return iosStandalone || mm;
}

export function InstallButton({ className = "" }: { className?: string }) {
  const [deferred, setDeferred] = React.useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = React.useState(false);

  React.useEffect(() => {
    setInstalled(isStandalone());

    const onBip = (e: Event) => {
      // Chrome/Edge fire beforeinstallprompt. Must preventDefault to use later.
      e.preventDefault?.();
      setDeferred(e as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };

    window.addEventListener("beforeinstallprompt", onBip as any);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBip as any);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;
  if (!deferred) return null; // Only show when browser says install is available

  return (
    <button
      type="button"
      className={`px-3 py-2 rounded-xl text-sm font-semibold bg-white/10 hover:bg-white/20 transition ${className}`}
      onClick={async () => {
        try {
          await deferred.prompt();
          await deferred.userChoice;
        } finally {
          setDeferred(null);
        }
      }}
      title="Install Pearson Nexus AI"
    >
      Install App
    </button>
  );
}
