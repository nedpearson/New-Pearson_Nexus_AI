import React from "react";
import App from "./App";
import { CrashOverlay, ErrorBoundary } from "./CrashOverlay";
import { installGlobalCrashHandlers, type CrashInfo } from "./crashHandlers";
import { hookManager } from "./hooks";
import "./hooks/exampleHooks"; // Import to register example hooks

export function AppRoot() {
  const [crash, setCrash] = React.useState<CrashInfo | null>(null);

  React.useEffect(() => {
    installGlobalCrashHandlers((c) => setCrash(c));
    
    // Execute SessionStart hooks
    hookManager.executeSessionStart().catch((error) => {
      console.error("[AppRoot] Failed to execute SessionStart hooks:", error);
    });
  }, []);

  return (
    <>
      <ErrorBoundary onCrash={(c) => setCrash(c)}>
        <App />
      </ErrorBoundary>
      <CrashOverlay crash={crash} onClose={() => setCrash(null)} />
    </>
  );
}
