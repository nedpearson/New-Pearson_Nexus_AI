import React from "react";
import App from "./App";
import { CrashOverlay, ErrorBoundary } from "./CrashOverlay";
import { installGlobalCrashHandlers, type CrashInfo } from "./crashHandlers";

export function AppRoot() {
  const [crash, setCrash] = React.useState<CrashInfo | null>(null);

  React.useEffect(() => {
    installGlobalCrashHandlers((c) => setCrash(c));
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
